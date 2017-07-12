#version 300 es

precision mediump float;

{% include "./3dUniforms.njk.frag" %}
{% include "./raytrace.njk.frag" %}

// from Syntopia http://blog.hvidtfeldts.net/index.php/2015/01/path-tracing-3d-fractals/
// include Color constants, hsv2rgb, and blendCol
{% include "./color.njk.frag" %}

vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

float MAX_FLOAT = 1e20;

float distSphere(vec3 pos, vec3 center, float radius) {
    return distance(pos, center) - radius;
}

vec3 distUnion(vec3 t1, vec3 t2) {
    return (t1.x < t2.x) ? t1 : t2;
}
float g_invNum;
const float scalingFactor = 0.08;
float distIIS(vec3 pos) {
    float invNum = 0.;
    float dr = 1.;
    bool inFund = false;

    for(int i = 0; i < 9000 ; i++) {
        if(i > u_maxIISIterations) break;
        inFund = true;

        {% for n in range(0, numInversionSphere) %}
        if(distance(pos, u_inversionSphere{{ n }}.center) < u_inversionSphere{{ n }}.r.x) {
            vec3 diff = pos - u_inversionSphere{{ n }}.center;
            float lenSq = dot(diff, diff);
            dr *= u_inversionSphere{{ n }}.r.y / lenSq;
            pos = (diff * u_inversionSphere{{ n }}.r.y) / lenSq + u_inversionSphere{{ n }}.center;
            invNum++;
            continue;
            //            inFund = false;
        }
        {% endfor %}

        if(inFund) break;
    }
    g_invNum = invNum;
    float minDist = MAX_FLOAT;
    {% for n in range(0, numBaseSphere) %}
    minDist = min(minDist,
                  (distance(pos, u_baseSphere{{ n }}.center) - u_baseSphere{{ n }}.r.x) / abs(dr) * scalingFactor);
    {% endfor %}
    return minDist;
}

vec3 distFunc(vec3 pos) {
    vec3 hit = vec3(MAX_FLOAT, -1, -1);
    {% if 0 < numBaseSphere %}
    hit = distUnion(hit, vec3(distIIS(pos), ID_ORBIT, 0));
    {% endif %}
    return hit;
}

const vec2 NORMAL_COEFF = vec2(0.01, 0.);
vec3 computeNormal(const vec3 p) {
    return normalize(vec3(distFunc(p + NORMAL_COEFF.xyy).x - distFunc(p - NORMAL_COEFF.xyy).x,
                          distFunc(p + NORMAL_COEFF.yxy).x - distFunc(p - NORMAL_COEFF.yxy).x,
                          distFunc(p + NORMAL_COEFF.yyx).x - distFunc(p - NORMAL_COEFF.yyx).x));
}

const int MAX_MARCHING_LOOP = 1000;
const float MARCHING_THRESHOLD = 0.01;
void march(const vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    float rayLength = isectInfo.mint;
    vec3 rayPos = rayOrg + rayDir * rayLength;
    vec3 dist = vec3(-1);
    for(int i = 0 ; i < MAX_MARCHING_LOOP ; i++) {
        if(rayLength > isectInfo.maxt) break;
        dist = distFunc(rayPos);
        rayLength += dist.x;
        rayPos = rayOrg + rayDir * rayLength;
        if(dist.x < MARCHING_THRESHOLD) {
            isectInfo.objId = int(dist.y);
            isectInfo.objIndex = int(dist.z);
            isectInfo.intersection = rayPos;
            isectInfo.normal = computeNormal(rayPos);
            isectInfo.hit = true;
            break;
        }
    }
}

const vec3 AMBIENT_FACTOR = vec3(0.1);
const vec3 LIGHT_DIR = normalize(vec3(1, 1, 0));
vec3 computeColor (const vec3 rayOrg, const vec3 rayDir) {
    IsectInfo isectInfo;
    isectInfo.objId = -1;
    isectInfo.objIndex = -1;
    isectInfo.mint = 0.;
    isectInfo.maxt = 9999999.;
    isectInfo.hit = false;

    march(rayOrg, rayDir, isectInfo);

    vec3 l = BLACK;
    if(isectInfo.hit) {
        vec3 matColor = BLUE;
        if (isectInfo.objId == ID_BASE_SPHERE) {
            matColor = GREEN;
        } else if (isectInfo.objId == ID_INVERSION_SPHERE) {
            matColor = GRAY;
        } else if (isectInfo.objId == ID_ORBIT) {
            //            float invNum = IISOrbitDepth(isectInfo.intersection);
            matColor = (g_invNum == 0.) ?
                hsv2rgb(0.33, 1., .77) :
                matColor = hsv2rgb(0.0 + g_invNum * 0.21 , 1., 1.);
        }

        vec3 diffuse =  clamp(dot(isectInfo.normal, LIGHT_DIR), 0., 1.) * matColor;
        vec3 ambient = matColor * AMBIENT_FACTOR;
        l = diffuse + ambient;
    }

    return l;
}

out vec4 outColor;
void main() {
    vec2 coordOffset = rand2n(gl_FragCoord.xy, u_numSamples);
    vec3 ray = calcRay(u_camera.pos, u_camera.target, u_camera.up, u_camera.fov,
                       u_resolution, gl_FragCoord.xy + coordOffset);
    vec3 texCol = texture(u_accTexture, gl_FragCoord.xy / u_resolution).rgb;
    outColor = vec4(mix(computeColor(u_camera.pos, ray), texCol, u_textureWeight), 1.0);
}
