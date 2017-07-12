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
const float THRESHOLD = 0.001;

bool intersectBoundingSphere(vec3 sphereCenter, float radius,
                             vec3 rayOrigin, vec3 rayDir,
                             out float t0, out float t1){
  	vec3 v = rayOrigin - sphereCenter;
  	float b = dot(rayDir, v);
  	float c = dot(v, v) - radius * radius;
  	float d = b * b - c;
  	if(d >= 0.){
    	float s = sqrt(d);
    	float tm = -b - s;
        t0 = tm;
        if(tm <= THRESHOLD){
            t1 = tm;
            tm = -b + s;
            t0 = tm;
        }else{
        	t1 = -b + s;
        }
    	if(THRESHOLD < tm){
      		return true;
    	}
  	}
  	return false;
}

void intersectSphere(int objId, int objIndex, int objComponentId,
                     vec3 sphereCenter, float radius,
                     vec3 rayOrigin, vec3 rayDir, inout IsectInfo isectInfo){
    vec3 v = rayOrigin - sphereCenter;
    float b = dot(rayDir, v);
    float c = dot(v, v) - radius * radius;
    float d = b * b - c;
    if(d >= 0.){
        float s = sqrt(d);
        float t = -b - s;
        if(t <= THRESHOLD) t = -b + s;
        if(THRESHOLD < t && t < isectInfo.mint){
            isectInfo.objId = objId;
            isectInfo.objIndex = objIndex;
            isectInfo.objComponentId = objComponentId;
            isectInfo.mint = t;
            isectInfo.intersection = (rayOrigin + t * rayDir);
            isectInfo.normal = normalize(isectInfo.intersection - sphereCenter);
            isectInfo.hit = true;
        }
    }
}

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
                                         u_baseSphere{{ n }}.center,
                                         u_baseSphere{{ n }}.r.x),
                              ID_BASE_SPHERE, {{ n }}));
    {% endfor %}

    {% for n in range(0, numInversionSphere) %}
    hit = distUnion(hit, vec3(distSphere(pos,
                                         u_inversionSphere{{ n }}.center,
                                         u_inversionSphere{{ n }}.r.x),
                              ID_INVERSION_SPHERE, {{ n }}));
    {% endfor %}
    return hit;
}

const vec2 NORMAL_COEFF = vec2(0.001, 0.);
vec3 computeNormal(const vec3 p) {
    return normalize(vec3(distFunc(p + NORMAL_COEFF.xyy).x - distFunc(p - NORMAL_COEFF.xyy).x,
                          distFunc(p + NORMAL_COEFF.yxy).x - distFunc(p - NORMAL_COEFF.yxy).x,
                          distFunc(p + NORMAL_COEFF.yyx).x - distFunc(p - NORMAL_COEFF.yyx).x));
}

const int MAX_MARCHING_LOOP = 1000;
void march(const vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    float rayLength = 0.;
    vec3 rayPos = rayOrg + rayDir * rayLength;
    vec3 dist = vec3(-1);
    for(int i = 0 ; i < MAX_MARCHING_LOOP ; i++) {
        if(rayLength > isectInfo.maxt) break;
        dist = distFunc(rayPos);
        rayLength += dist.x;
        rayPos = rayOrg + rayDir * rayLength;
        if(dist.x < THRESHOLD) {
            isectInfo.objId = int(dist.y);
            isectInfo.objIndex = int(dist.z);
            isectInfo.intersection = rayPos;
            isectInfo.normal = computeNormal(rayPos);
            isectInfo.hit = true;
            break;
        }
    }
}

void intersectGenerators(const vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    {% for n in range(0, numBaseSphere) %}
    intersectSphere(ID_BASE_SPHERE, {{ n }}, 0,
                    u_baseSphere{{ n }}.center, u_baseSphere{{ n }}.r.x,
                    rayOrg, rayDir, isectInfo);
    {% endfor %}

    {% for n in range(0, numInversionSphere) %}
    intersectSphere(ID_INVERSION_SPHERE, {{ n }}, 0,
                    u_inversionSphere{{ n }}.center, u_inversionSphere{{ n }}.r.x,
                    rayOrg, rayDir, isectInfo);
    {% endfor %}
}

const int MAX_TRACE_DEPTH = 5;
const vec3 AMBIENT_FACTOR = vec3(0.1);
const vec3 LIGHT_DIR = normalize(vec3(1, 1, 0));
vec3 computeColor (const vec3 rayOrg, const vec3 rayDir) {
    IsectInfo isectInfo;
    isectInfo.objId = -1;
    isectInfo.objIndex = -1;
    isectInfo.mint = MAX_FLOAT;
    isectInfo.maxt = 9999999.;
    isectInfo.hit = false;

    vec3 l = BLACK;

    vec3 rayPos = rayOrg;
    float transparency = 0.8;
    float coeff = 1.;
    for(int depth = 0 ; depth < MAX_TRACE_DEPTH ; depth++) {
        //march(rayPos, rayDir, isectInfo);
        intersectGenerators(rayPos, rayDir, isectInfo);

        if(isectInfo.hit) {
            vec3 matColor = BLUE;
            float alpha = 1.;
            bool transparent = false;
            if (isectInfo.objId == ID_BASE_SPHERE) {
                matColor = GREEN;
            } else if (isectInfo.objId == ID_INVERSION_SPHERE) {
                matColor = GRAY;
                transparent = true;
            }

            vec3 diffuse =  clamp(dot(isectInfo.normal, LIGHT_DIR), 0., 1.) * matColor;
            vec3 ambient = matColor * AMBIENT_FACTOR;
            if(transparent) {
                coeff *= transparency;
                l += (diffuse + ambient) * coeff;
                rayPos = isectInfo.intersection + rayDir * THRESHOLD;
                isectInfo.mint = MAX_FLOAT;
                isectInfo.hit = false;
                continue;
            } else {
                l += (diffuse + ambient) * coeff;
            }
        }

        break;
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
