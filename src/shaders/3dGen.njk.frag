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
    vec3 l = BLACK;
    vec3 rayPos = rayOrg;

    if(u_isSelectingObj) {
        intersectBasisCylinder(-1, -1,
                               u_objBasis.center, u_objBasis.r, u_objBasis.len,
                               rayPos, rayDir, isectInfo);
        if(u_objBasis.hasRotationUI) {
            intersectRotationTorus(-1, -1,
                                   u_objBasis.center, u_objBasis.rotationParam.x,
                                   u_objBasis.rotationParam.y,
                                   rayPos, rayDir, isectInfo);
        }
        if(isectInfo.hit) {
            return isectInfo.matColor;
        }
    }

    float transparency = 0.8;
    float coeff = 1.;
    for(int depth = 0 ; depth < MAX_TRACE_DEPTH ; depth++) {
        //march(rayPos, rayDir, isectInfo);
        intersectGenerators(rayPos, rayDir, isectInfo);

        if(isectInfo.hit) {
            vec3 matColor = isectInfo.matColor;
            float alpha = 1.;
            bool transparent = false;
            transparent =  (isectInfo.objId == ID_INVERSION_SPHERE &&
                            isectInfo.objComponentId == 0) ?
                true : false;

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
                l += (diffuse + ambient) * coeff;
            }
        }

        break;
    }

    return l;
}

out vec4 outColor;
void main() {
    vec3 sum = vec3(0);
    float MAX_SAMPLES = 5.;
    for (float i = 0. ; i < MAX_SAMPLES ; i++) {
        vec2 coordOffset = rand2n(gl_FragCoord.xy, i);
        vec3 ray = calcRay(u_camera.pos, u_camera.target, u_camera.up, u_camera.fov,
                           u_resolution, gl_FragCoord.xy + coordOffset);
        sum += computeColor(u_camera.pos, ray);
    }
    //    vec3 texCol = texture(u_accTexture, gl_FragCoord.xy / u_resolution).rgb;

    outColor = vec4(sum / MAX_SAMPLES, 1.);//vec4(mix(computeColor(u_camera.pos, ray), texCol, u_textureWeight), 1.0);
}
