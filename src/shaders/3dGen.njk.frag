#version 300 es

precision mediump float;

{% include "./3dUniforms.njk.frag" %}

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

vec3 calcRay (const vec3 eye, const vec3 target, const vec3 up, const float fov,
              const vec2 resolution, const vec2 coord){
    float imagePlane = (resolution.y * .5) / tan(fov * .5);
    vec3 v = normalize(target - eye);
    vec3 xaxis = normalize(cross(v, up));
    vec3 yaxis =  normalize(cross(v, xaxis));
    vec3 center = v * imagePlane;
    vec3 origin = center - (xaxis * (resolution.x  *.5)) - (yaxis * (resolution.y * .5));
    return normalize(origin + (xaxis * coord.x) + (yaxis * (resolution.y - coord.y)));
}

struct IsectInfo {
    int objId;
    int objIndex;
    vec3 normal;
    vec3 intersection;
    float mint;
    float maxt;
    bool hit;
};

float MAX_FLOAT = 1e20;
int ID_BASE_SPHERE = 0;

float distSphere(vec3 pos, vec3 center, float radius) {
    return distance(pos, center) - radius;
}

vec3 distUnion(vec3 t1, vec3 t2) {
    return (t1.x < t2.x) ? t1 : t2;
}

vec3 distFunc(vec3 pos) {
    vec3 hit = vec3(MAX_FLOAT, -1, -1);
    {% for n in range(0, numBaseSphere) %}
    hit = distUnion(hit, vec3(distSphere(pos,
                                         u_baseSphere{{ n }}.pos,
                                         u_baseSphere{{ n }}.r.x),
                              ID_BASE_SPHERE, {{ n }}));
    {% endfor %}
    return hit;
}

const vec2 NORMAL_COEFF = vec2(0.001, 0.);
vec3 computeNormal(const vec3 p) {
    return normalize(vec3(distFunc(p + NORMAL_COEFF.xyy).x - distFunc(p - NORMAL_COEFF.xyy).x,
                          distFunc(p + NORMAL_COEFF.yxy).x - distFunc(p - NORMAL_COEFF.yxy).x,
                          distFunc(p + NORMAL_COEFF.yyx).x - distFunc(p - NORMAL_COEFF.yyx).x));
}

const int MAX_MARCHING_LOOP = 500;
const float MARCHING_THRESHOLD = 0.001;
void march(const vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    float rayLength = isectInfo.mint;
    vec3 rayPos = rayOrg + rayDir * rayLength;
    vec3 dist = vec3(-1);
    for(int i = 0 ; i < MAX_MARCHING_LOOP ; i++) {
        if(rayLength > isectInfo.maxt) break;
        dist = distFunc(rayPos);
        rayLength += dist.x;
        rayPos = rayPos + rayDir * rayLength;
        if(dist.x < MARCHING_THRESHOLD) {
            isectInfo.objId = int(dist.y);
            isectInfo.objIndex = int(dist.z);
            isectInfo.intersection = rayPos;
            isectInfo.normal = computeNormal(rayPos);
            isectInfo.hit = true;
            isectInfo = isectInfo;
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
        if(isectInfo.objId == ID_BASE_SPHERE) {
            matColor = GREEN;
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
