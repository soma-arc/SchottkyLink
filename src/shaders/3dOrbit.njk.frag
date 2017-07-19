#version 300 es

precision mediump float;

{% include "./3dUniforms.njk.frag" %}

// from Syntopia http://blog.hvidtfeldts.net/index.php/2015/01/path-tracing-3d-fractals/
// include Color constants, hsv2rgb, and blendCol
{% include "./color.njk.frag" %}

{% include "./raytrace.njk.frag" %}

vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

void sphereInvert(inout vec3 pos, inout float dr, vec3 center, vec2 r) {
    vec3 diff = pos - center;
    float lenSq = dot(diff, diff);
    dr *= r.y / lenSq; // (r * r) / lenSq
    pos = (diff * r.y) / lenSq + center;
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
            sphereInvert(pos, dr,
                         u_inversionSphere{{ n }}.center,
                         u_inversionSphere{{ n }}.r);
            invNum++;
            continue;
            //            inFund = false;
        }
        {% endfor %}

        {% for n in range(0, numHyperPlane) %}
        pos -= u_hyperPlane{{ n }}.center;
        float dHyperPlane{{ n }} = dot(pos, u_hyperPlane{{ n }}.normal);
        invNum += (dHyperPlane{{ n }} < 0.) ? 1. : 0.;
        inFund = (dHyperPlane{{ n }} < 0. ) ? false : inFund;
        pos -= 2.0 * min(0., dHyperPlane{{ n }}) * u_hyperPlane{{ n }}.normal;
        pos += u_hyperPlane{{ n }}.center;
        {% endfor %}

        {% for n in range(0, numParallelPlanes) %}
        pos -= u_parallelPlanes{{ n }}.p;
        float hpd{{ n }} = dot(u_parallelPlanes{{ n }}.normal, pos);
        if(hpd{{ n }} < 0. || u_parallelPlanes{{ n }}.dist.x < hpd{{ n }}) {
            invNum += abs(floor(hpd{{ n }} / u_parallelPlanes{{ n }}.dist.x));
            pos -= u_parallelPlanes{{ n }}.normal * (hpd{{ n }} - mod(hpd{{ n }}, u_parallelPlanes{{ n }}.dist.y));

            pos -= u_parallelPlanes{{ n }}.normal * u_parallelPlanes{{ n }}.dist.x;
            hpd{{ n }} = dot(pos, u_parallelPlanes{{ n }}.normal);
            pos -= 2.0 * max(0., hpd{{ n }}) * u_parallelPlanes{{ n }}.normal;
            pos += u_parallelPlanes{{ n }}.normal * u_parallelPlanes{{ n }}.dist.x;

            inFund = false;
        }
        pos += u_parallelPlanes{{ n }}.p;
        {% endfor %}

        {% for n in range(0, numTwoSpheres) %}
        if (distance(pos, u_twoSpheres{{ n }}.s1.center) < u_twoSpheres{{ n }}.s1.r.x) {
            sphereInvert(pos, dr, u_twoSpheres{{ n }}.s1.center, u_twoSpheres{{ n }}.s1.r);
            sphereInvert(pos, dr, u_twoSpheres{{ n }}.s2.center, u_twoSpheres{{ n }}.s2.r);
            invNum++;
            inFund = false;
        } else if (distance(pos, u_twoSpheres{{ n }}.s1d.center) >= u_twoSpheres{{ n }}.s1d.r.x) {
            sphereInvert(pos, dr, u_twoSpheres{{ n }}.s2.center, u_twoSpheres{{ n }}.s2.r);
            sphereInvert(pos, dr, u_twoSpheres{{ n }}.s1.center, u_twoSpheres{{ n }}.s1.r);
            invNum++;
            inFund = false;
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

vec4 distFunc(vec3 pos) {
    vec4 hit = vec4(MAX_FLOAT, -1, -1, -1);
    {% if 0 < numBaseSphere %}
    hit = distUnion(hit, vec4(distIIS(pos), ID_ORBIT, 0, 0));
    {% endif %}
    return hit;
}

const vec2 NORMAL_COEFF = vec2(0.01, 0.);
vec3 computeNormal(const vec3 p) {
    return normalize(vec3(distFunc(p + NORMAL_COEFF.xyy).x - distFunc(p - NORMAL_COEFF.xyy).x,
                          distFunc(p + NORMAL_COEFF.yxy).x - distFunc(p - NORMAL_COEFF.yxy).x,
                          distFunc(p + NORMAL_COEFF.yyx).x - distFunc(p - NORMAL_COEFF.yyx).x));
}

const float MARCHING_THRESHOLD = 0.01;
void march(const vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    float rayLength = 0.;
    vec3 rayPos = rayOrg + rayDir * rayLength;
    vec4 dist = vec4(-1);
    for(int i = 0 ; i < MAX_MARCHING_LOOP ; i++) {
        if(rayLength > isectInfo.maxt ||
           rayLength > isectInfo.mint) break;
        dist = distFunc(rayPos);
        rayLength += dist.x;
        rayPos = rayOrg + rayDir * rayLength;
        if(dist.x < MARCHING_THRESHOLD) {
            isectInfo.objId = int(dist.y);
            isectInfo.objIndex = int(dist.z);
            isectInfo.objComponentId = int(dist.w);
            isectInfo.matColor = (g_invNum == 0.) ?
                hsv2rgb(0.33, 1., .77) :
                hsv2rgb(0.0 + g_invNum * 0.21 , 1., 1.);
            isectInfo.intersection = rayPos;
            isectInfo.normal = computeNormal(rayPos);
            isectInfo.hit = true;
            break;
        }
    }
}

// This function is based on FractalLab's implementation
// http://hirnsohle.de/test/fractalLab/
float ambientOcclusion(vec3 p, vec3 n, float eps, float aoIntensity ){
    float o = 1.0;
    float k = aoIntensity / eps;
    float d = 2.0 * eps;

    for (int i = 0; i < 5; i++) {
        o -= (d - distFunc(p + n * d).x) * k;
        d += eps;
        k *= 0.5;
    }

    return clamp(o, 0.0, 1.0);
}

void intersectGenerators(const vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    {% for n in range(0, numBaseSphere) %}
    intersectSphere(ID_BASE_SPHERE, {{ n }}, 0, (u_baseSphere{{ n }}.selected) ? RED : GREEN,
                    u_baseSphere{{ n }}.center, u_baseSphere{{ n }}.r.x,
                    rayOrg, rayDir, isectInfo);
    {% endfor %}

    {% for n in range(0, numInversionSphere) %}
    intersectSphere(ID_INVERSION_SPHERE, {{ n }}, 0,
                    (u_inversionSphere{{ n }}.selected) ? RED : GRAY,
                    u_inversionSphere{{ n }}.center, u_inversionSphere{{ n }}.r.x,
                    rayOrg, rayDir, isectInfo);
    {% endfor %}

    {% for n in range(0, numHyperPlane) %}
    intersectRect(ID_HYPER_PLANE, {{ n }}, 0,
                  (u_hyperPlane{{ n }}.selected) ? RED : BLUE,
                  u_hyperPlane{{ n }}.center, u_hyperPlane{{ n }}.normal,
                  u_hyperPlane{{ n }}.up, u_hyperPlane{{ n }}.ui.xy,
                  rayOrg, rayDir, isectInfo);
    {% endfor %}

    {% for n in range(0, numParallelPlanes) %}
    intersectParallelPlanes(ID_PARALLEL_PLANES, {{ n }},
                            u_parallelPlanes{{ n }}.p, u_parallelPlanes{{ n }}.normal,
                            u_parallelPlanes{{ n }}.up, u_parallelPlanes{{ n }}.ui.xy,
                            u_parallelPlanes{{ n }}.dist,
                            rayOrg, rayDir, isectInfo);
    {% endfor %}
}

const int MAX_TRACE_DEPTH = 5;
const vec3 AMBIENT_FACTOR = vec3(0.1);
const vec3 LIGHT_DIR = normalize(vec3(1, 1, 0));
vec3 computeColor (const vec3 rayOrg, const vec3 rayDir) {
    IsectInfo isectInfo = newIsectInfo();
    vec3 rayPos = rayOrg;

    vec3 l = BLACK;
    float transparency = 0.8;
    float coeff = 1.;
    for(int depth = 0 ; depth < MAX_TRACE_DEPTH ; depth++) {
        if(u_renderGenerators)
            intersectGenerators(rayPos, rayDir, isectInfo);
        march(rayPos, rayDir, isectInfo);

        if(isectInfo.hit) {
            vec3 matColor = isectInfo.matColor;
            float alpha = 1.;
            bool transparent = false;
            transparent =  (isectInfo.objId == ID_INVERSION_SPHERE &&
                            isectInfo.objComponentId == 0) ? true : false;

            vec3 diffuse =  clamp(dot(isectInfo.normal, LIGHT_DIR), 0., 1.) * matColor;
            vec3 ambient = matColor * AMBIENT_FACTOR;
            if(transparent) {
                coeff *= transparency;
                l += (diffuse + ambient) * coeff;
                rayPos = isectInfo.intersection + rayDir * 0.01 * 2.;
                isectInfo.mint = MAX_FLOAT;
                isectInfo.hit = false;
                continue;
            } else {
                l += (diffuse + matColor * vec3(ambientOcclusion(isectInfo.intersection,
                                                               isectInfo.normal,
                                                                 10., .15 )))*coeff;
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
