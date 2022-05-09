#version 300 es

precision mediump float;

out vec4 outColor;

{% include "./2dUniforms.njk.frag" %}

// include Color constants, hsv2rgb, and blendCol
{% include "./color.njk.frag" %}

// from Syntopia http://blog.hvidtfeldts.net/index.php/2015/01/path-tracing-3d-fractals/
vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

// circle [x, y, radius, radius * radius]
vec2 circleInvert(const vec2 pos, const vec4 circle){
    vec2 p = pos - circle.xy;
    float d = length(p);
    return (p * circle.w)/(d * d) + circle.xy;
}

vec3 computeColor(float loopNum) {
    return hsv2rgb(0.01 + 0.05 * (loopNum -1.), 1., 1.);
}

const int MAX_ITERATIONS = 200;
bool IIS(vec2 pos, out vec3 col) {
    float invNum = 0.;
    bool inFund = true;
    vec4 c = vec4(0);
    for (int i = 0; i < MAX_ITERATIONS; i++) {
        if(i > u_maxIISIterations) break;
        inFund = true;

        {% for no in range(0, numOrbitSeed) %}
        vec2 uv{{ n }}{{ no }} = (pos - u_orbitSeed{{ no }}.corner) / u_orbitSeed{{ no }}.size;
        if(0. < uv{{ n }}{{ no }}.x && uv{{ n }}{{ no }}.x < 1. &&
           0. < uv{{ n }}{{ no }}.y && uv{{ n }}{{ no }}.y < 1.) {
            c = textureLod(u_imageTextures[{{ no }}], vec2(uv{{ n }}{{ no }}.x, 1. - uv{{ n }}{{ no }}.y), 0.0);
            if(c.w == 1.) {
                col = c.rgb;
                return true;
            }
        }
        {% endfor %}

        {% for no in range(0, numCameraOrbit) %}
        vec2 uv{{ n }}{{ no }}cam = (pos - u_cameraOrbit{{ no }}.corner) / u_cameraOrbit{{ no }}.size;
        if(0. < uv{{ n }}{{ no }}cam.x && uv{{ n }}{{ no }}cam.x < 1. &&
           0. < uv{{ n }}{{ no }}cam.y && uv{{ n }}{{ no }}cam.y < 1.) {
            c = textureLod(u_cameraTexture, vec2(uv{{ n }}{{ no }}cam.x, 1. - uv{{ n }}{{ no }}cam.y), 0.0);
            if(c.w == 1.) {
                col = c.rgb;
                return true;
            }
        }
        {% endfor %}

        {% for n in range(0,  numCircle ) %}
        if(distance(pos, u_circle{{ n }}.centerAndRadius.xy) < u_circle{{ n }}.centerAndRadius.z){
            pos = circleInvert(pos, u_circle{{ n }}.centerAndRadius);
            inFund = false;
            invNum++;
            continue;
        }
        {% endfor %}

        {% for n in range(0,  numCircleFromPoints) %}
        if(distance(pos, u_circleFromPoints{{ n }}.centerAndRadius.xy) < u_circleFromPoints{{ n }}.centerAndRadius.z){
            pos = circleInvert(pos, u_circleFromPoints{{ n }}.centerAndRadius);
            inFund = false;
            invNum++;
        }
        {% endfor %}

        {% for n in range(0, numHalfPlane ) %}
        pos -= u_halfPlane{{ n }}.p;
        float dHalfPlane{{ n }} = dot(pos, u_halfPlane{{ n }}.normal.xy);
        invNum += (dHalfPlane{{ n }} < 0.) ? 1. : 0.;
        inFund = (dHalfPlane{{ n }} < 0. ) ? false : inFund;
        pos -= 2.0 * min(0., dHalfPlane{{ n }}) * u_halfPlane{{ n }}.normal.xy;
        pos += u_halfPlane{{ n }}.p;
        {% endfor %}

        {% for n in range(0, numParallelTranslation) %}
        pos -= u_translate{{ n }}.p;
        float hpd{{ n }} = dot(u_translate{{ n }}.normal.xy, pos);
        if(hpd{{ n }} < 0. || u_translate{{ n }}.normal.z < hpd{{ n }}) {
            invNum += abs(floor(hpd{{ n }} / u_translate{{ n }}.normal.z));
            pos -= u_translate{{ n }}.normal.xy * (hpd{{ n }} - mod(hpd{{ n }}, u_translate{{ n }}.normal.w/2.));

            inFund = false;
        }
        pos += u_translate{{ n }}.p;
        {% endfor %}

        {% for n in range(0, numParallelInversions) %}
        pos -= u_parallelInversions{{ n }}.p;
        float hpdInv{{ n }} = dot(u_parallelInversions{{ n }}.normal.xy, pos);
        if(hpdInv{{ n }} < 0. || u_parallelInversions{{ n }}.normal.z < hpdInv{{ n }}) {
            invNum += abs(floor(hpdInv{{ n }} / u_parallelInversions{{ n }}.normal.z));
            pos -= u_parallelInversions{{ n }}.normal.xy * (hpdInv{{ n }} - mod(hpdInv{{ n }}, u_parallelInversions{{ n }}.normal.w));
            pos -= u_parallelInversions{{ n }}.normal.xy * u_parallelInversions{{ n }}.normal.z;
            hpdInv{{ n }} = dot(pos, u_parallelInversions{{ n }}.normal.xy);
            pos -= 2.0 * max(0., hpdInv{{ n }}) * u_parallelInversions{{ n }}.normal.xy;
            pos += u_parallelInversions{{ n }}.normal.xy * u_parallelInversions{{ n }}.normal.z;

            inFund = false;
        }
        pos += u_parallelInversions{{ n }}.p;
        {% endfor %}

        {% for n in range(0, numGlideReflection) %}
        pos -= u_glideReflection{{ n }}.p;
        float glideInv{{ n }} = dot(u_glideReflection{{ n }}.normal.xy, pos);
        if(glideInv{{ n }} < 0. || u_glideReflection{{ n }}.normal.z < glideInv{{ n }}) {
          float ref = abs(floor(glideInv{{ n }} / u_glideReflection{{ n }}.normal.z));
          invNum += ref;
          pos -= u_glideReflection{{ n }}.normal.xy * (glideInv{{ n }} - mod(glideInv{{ n }}, u_glideReflection{{ n }}.normal.w/2.));
          pos = mod(ref, 2.0) == 0. ? pos : vec2(pos.x, -pos.y);
          inFund = false;
        }
        pos += u_glideReflection{{ n }}.p;
        {% endfor %}

        {% for n in range(0, numRotation) %}
        pos -= u_rotation{{ n }}.p;
        float dRot1{{ n }} = dot(pos, u_rotation{{ n }}.normal.xy);
        float dRot2{{ n }} = dot(pos, u_rotation{{ n }}.normal.zw);
        invNum += (u_isRenderingGenerator && (dRot1{{ n }} < 0. || dRot2{{ n }} < 0.)) ? 1. : 0.;
        inFund = (dRot1{{ n }} < 0. || dRot2{{ n }} < 0.) ? false : inFund;
        vec2 rot1{{ n }} = abs(vec2(-u_rotation{{ n }}.normal.y, u_rotation{{ n }}.normal.x));
        vec2 rot2{{ n }} = abs(vec2(u_rotation{{ n }}.normal.w, -u_rotation{{ n }}.normal.z));
        float angle{{ n }} = (atan(-rot1{{ n }}.y, rot1{{ n }}.x) -  atan(rot2{{ n }}.y, rot2{{n}}.x));
        mat2 m = mat2(cos(angle{{n}}), -sin(angle{{n}}),
                       sin(angle{{n}}), cos(angle{{n}}));
        pos = m * pos;
        pos += u_rotation{{ n }}.p;
        {% endfor %}
        
        {% for n in range(0, numCrossingInversions) %}
        pos -= u_crossingInversions{{ n }}.p;
        float dRot{{ n }} = dot(pos, u_crossingInversions{{ n }}.normal.xy);
        invNum += (dRot{{ n }} < 0.) ? 1. : 0.;
        inFund = (dRot{{ n }} < 0. ) ? false : inFund;
        pos -= 2.0 * min(0., dRot{{ n }}) * u_crossingInversions{{ n }}.normal.xy;
        pos += u_crossingInversions{{ n }}.p;

        pos -= u_crossingInversions{{ n }}.p;
        dRot{{ n }} = dot(pos, u_crossingInversions{{ n }}.normal.zw);
        invNum += (dRot{{ n }} < 0.) ? 1. : 0.;
        inFund = (dRot{{ n }} < 0. ) ? false : inFund;
        pos -= 2.0 * min(0., dRot{{ n }}) * u_crossingInversions{{ n }}.normal.zw;
        pos += u_crossingInversions{{ n }}.p;
        {% endfor %}

        {% for n in range(0, numTwoCircles) %}
        if(distance(pos, u_hyperbolic{{ n }}.c1.xy) < u_hyperbolic{{ n }}.c1.z){
            pos = circleInvert(pos, u_hyperbolic{{ n }}.c1);
            pos = circleInvert(pos, u_hyperbolic{{ n }}.c2);

            inFund = false;
       }else if(distance(pos, u_hyperbolic{{ n }}.c1d.xy) >= u_hyperbolic{{ n }}.c1d.z){
            pos = circleInvert(pos, u_hyperbolic{{ n }}.c2);
            pos = circleInvert(pos, u_hyperbolic{{ n }}.c1);

            inFund = false;
        }
        {% endfor %}

        {% for n in range(0, numLoxodromic) %}
        if(distance(pos, u_loxodromic{{ n }}.c1.xy) < u_loxodromic{{ n }}.c1.z){
            pos -= u_loxodromic{{ n }}.c1.xy;
            pos -= 2.0 * dot(pos, u_loxodromic{{ n }}.line.zw) * u_loxodromic{{ n }}.line.zw;
            pos += u_loxodromic{{ n }}.c1.xy;

            pos = circleInvert(pos, u_loxodromic{{ n }}.c3);

            pos = circleInvert(pos, u_loxodromic{{ n }}.c1);
            pos = circleInvert(pos, u_loxodromic{{ n }}.c2);

            inFund = false;
       }else if(distance(pos, u_loxodromic{{ n }}.c1d.xy) >= u_loxodromic{{ n }}.c1d.z){
            pos = circleInvert(pos, u_loxodromic{{ n }}.c2);
            pos = circleInvert(pos, u_loxodromic{{ n }}.c1);

            pos = circleInvert(pos, u_loxodromic{{ n }}.c3);
            pos -= u_loxodromic{{ n }}.c1.xy;
            pos -= 2.0 * dot(pos, u_loxodromic{{ n }}.line.zw) * u_loxodromic{{ n }}.line.zw;
            pos += u_loxodromic{{ n }}.c1.xy;

            inFund = false;
        }
        {% endfor %}

        {% for n in range(0, numScaling) %}
        if(distance(pos, u_scaling{{ n }}.c1.xy) < u_scaling{{ n }}.c1.z){
            pos -= u_scaling{{ n }}.line1.xy;
            pos -= 2.0 * dot(pos, u_scaling{{ n }}.line1.zw) * u_scaling{{ n }}.line1.zw;
            pos += u_scaling{{ n }}.line1.xy;

            pos -= u_scaling{{ n }}.c2.xy;
            pos -= 2.0 * dot(pos, u_scaling{{ n }}.line2.zw) * u_scaling{{ n }}.line2.zw;
            pos += u_scaling{{ n }}.c2.xy;

            pos = circleInvert(pos, u_scaling{{ n }}.c1);
            pos = circleInvert(pos, u_scaling{{ n }}.c2);

            inFund = false;
       }else if(distance(pos, u_scaling{{ n }}.c1d.xy) >= u_scaling{{ n }}.c1d.z){
            pos = circleInvert(pos, u_scaling{{ n }}.c2);
            pos = circleInvert(pos, u_scaling{{ n }}.c1);

            pos -= u_scaling{{ n }}.c2.xy;
            pos -= 2.0 * dot(pos, u_scaling{{ n }}.line2.zw) * u_scaling{{ n }}.line2.zw;
            pos += u_scaling{{ n }}.c2.xy;

            pos -= u_scaling{{ n }}.line1.xy;
            pos -= 2.0 * dot(pos, u_scaling{{ n }}.line1.zw) * u_scaling{{ n }}.line1.zw;
            pos += u_scaling{{ n }}.line1.xy;

            inFund = false;
        }
        {% endfor %}

        if (inFund) break;
    }

    col = computeColor(invNum);
    return (invNum == 0.) ? false : true;
}

bool renderUI(vec2 pos, out vec3 color) {
    {% for n  in range(0,  numPoint ) %}
    if(distance(pos, u_point{{ n }}.xy) < u_point{{ n }}.z){
        color = BLUE;
        return true;
    }
    {% endfor %}

    float dist;
    {% for n in range(0,  numCircle ) %}
    // boundary of circle
    if(u_circle{{ n }}.selected){
        dist = u_circle{{ n }}.centerAndRadius.z - distance(pos, u_circle{{ n }}.centerAndRadius.xy);
        if(0. < dist && dist < u_circle{{ n }}.ui){
            color = WHITE;
            return true;
        }
    }
    {% endfor %}

    {% for n in range(0, numHalfPlane) %}
    if(u_halfPlane{{ n }}.selected) {
        // normal point
        if(distance(pos, u_halfPlane{{ n }}.p + u_halfPlane{{ n }}.normal.xy * u_halfPlane{{ n }}.normal.z) < u_halfPlane{{ n }}.normal.w) {
            color = PINK;
            return true;
        }
        // point p
        if(distance(pos, u_halfPlane{{ n }}.p) < u_halfPlane{{ n }}.normal.w) {
            color = LIGHT_BLUE;
            return true;
        }
        // ring
        if(abs(distance(pos, u_halfPlane{{ n }}.p) - u_halfPlane{{ n }}.normal.z) < u_halfPlane{{ n }}.normal.w *.5) {
            color = WHITE;
            return true;
        }
        // line
        dist = dot(pos - u_halfPlane{{ n }}.p , u_halfPlane{{ n }}.normal.xy);
        if(-u_halfPlane{{ n }}.normal.w < dist && dist < 0.) {
            color = WHITE;
            return true;
        }
    }
    {% endfor %}

    {% for n in range(0, numParallelTranslation) %}
    if(u_translate{{ n }}.selected){
        // normal point
        if(distance(pos, u_translate{{ n }}.p + u_translate{{ n }}.normal.xy * u_translate{{ n }}.ui.x) < u_translate{{ n }}.ui.y) {
            color = PINK;
            return true;
        }
        // ring
        if(abs(distance(pos, u_translate{{ n }}.p) - u_translate{{ n }}.ui.x) < u_translate{{ n }}.ui.y *.5) {
            color = WHITE;
            return true;
        }
        // point p
        if(distance(pos, u_translate{{ n }}.p) < u_translate{{ n }}.ui.y) {
            color = LIGHT_BLUE;
            return true;
        }
        // point on hp2
        if(distance(pos, u_translate{{ n }}.p + u_translate{{ n }}.normal.xy * u_translate{{ n }}.normal.z) < u_translate{{ n }}.ui.y) {
            color = PINK;
            return true;
        }
        // boundary
        dist = dot(pos - u_translate{{ n }}.p, - u_translate{{ n }}.normal.xy);
        if(0. < dist && dist < u_translate{{ n }}.ui.y) {
            color = WHITE;
            return true;
        }

        dist = dot(pos - (u_translate{{ n }}.p + u_translate{{ n }}.normal.xy * u_translate{{ n }}.normal.z),
                   - u_translate{{ n }}.normal.xy);
        if(0. < dist && dist < u_translate{{ n }}.ui.y) {
            color = WHITE;
            return true;
        }

        // line
        pos -= u_translate{{ n }}.p;
        float hpd{{ n }} = dot(u_translate{{ n }}.normal.xy, pos);
        if(hpd{{ n }} > 0. && u_translate{{ n }}.normal.z > hpd{{ n }} &&
           abs(dot(pos, vec2(-u_translate{{ n }}.normal.y, u_translate{{ n }}.normal.x))) < u_translate{{ n }}.ui.y *.5) {
            color = WHITE;
            return true;
        }
        pos += u_translate{{ n }}.p;
    }
    {% endfor %}

    {% for n in range(0, numParallelInversions) %}
    if(u_parallelInversions{{ n }}.selected){
      
        // normal point
        if(distance(pos, u_parallelInversions{{ n }}.p + u_parallelInversions{{ n }}.normal.xy * u_parallelInversions{{ n }}.ui.x) < u_parallelInversions{{ n }}.ui.y) {
            color = PINK;
            return true;
        }
        // ring
        if(abs(distance(pos, u_parallelInversions{{ n }}.p) - u_parallelInversions{{ n }}.ui.x) < u_parallelInversions{{ n }}.ui.y *.5) {
            color = WHITE;
            return true;
        }
        // point p
        if(distance(pos, u_parallelInversions{{ n }}.p) < u_parallelInversions{{ n }}.ui.y) {
            color = LIGHT_BLUE;
            return true;
        }
        // point on hp2
        if(distance(pos, u_parallelInversions{{ n }}.p + u_parallelInversions{{ n }}.normal.xy * u_parallelInversions{{ n }}.normal.z) < u_parallelInversions{{ n }}.ui.y) {
            color = PINK;
            return true;
        }
        // boundary
        dist = dot(pos - u_parallelInversions{{ n }}.p, - u_parallelInversions{{ n }}.normal.xy);
        if(0. < dist && dist < u_parallelInversions{{ n }}.ui.y) {
            color = WHITE;
            return true;
        }

        dist = dot(pos - (u_parallelInversions{{ n }}.p + u_parallelInversions{{ n }}.normal.xy * u_parallelInversions{{ n }}.normal.z),
                   - u_parallelInversions{{ n }}.normal.xy);
        if(0. < dist && dist < u_parallelInversions{{ n }}.ui.y) {
            color = WHITE;
            return true;
        }

        // line
        pos -= u_parallelInversions{{ n }}.p;
        float hpdInv{{ n }} = dot(u_parallelInversions{{ n }}.normal.xy, pos);
        if(hpdInv{{ n }} > 0. && u_parallelInversions{{ n }}.normal.z > hpdInv{{ n }} &&
           abs(dot(pos, vec2(-u_parallelInversions{{ n }}.normal.y, u_parallelInversions{{ n }}.normal.x))) < u_parallelInversions{{ n }}.ui.y *.5) {
            color = WHITE;
            return true;
        }
        pos += u_parallelInversions{{ n }}.p;
    }
    {% endfor %}

    {% for n in range(0, numGlideReflection) %}
    if(u_glideReflection{{ n }}.selected){
      
        // normal point
        if(distance(pos, u_glideReflection{{ n }}.p + u_glideReflection{{ n }}.normal.xy * u_glideReflection{{ n }}.ui.x) < u_glideReflection{{ n }}.ui.y) {
            color = PINK;
            return true;
        }
        // ring
        if(abs(distance(pos, u_glideReflection{{ n }}.p) - u_glideReflection{{ n }}.ui.x) < u_glideReflection{{ n }}.ui.y *.5) {
            color = WHITE;
            return true;
        }
        // point p
        if(distance(pos, u_glideReflection{{ n }}.p) < u_glideReflection{{ n }}.ui.y) {
            color = LIGHT_BLUE;
            return true;
        }
        // point on hp2
        if(distance(pos, u_glideReflection{{ n }}.p + u_glideReflection{{ n }}.normal.xy * u_glideReflection{{ n }}.normal.z) < u_glideReflection{{ n }}.ui.y) {
            color = PINK;
            return true;
        }
        // boundary
        dist = dot(pos - u_glideReflection{{ n }}.p, - u_glideReflection{{ n }}.normal.xy);
        if(0. < dist && dist < u_glideReflection{{ n }}.ui.y) {
            color = WHITE;
            return true;
        }

        dist = dot(pos - (u_glideReflection{{ n }}.p + u_glideReflection{{ n }}.normal.xy * u_glideReflection{{ n }}.normal.z),
                   - u_glideReflection{{ n }}.normal.xy);
        if(0. < dist && dist < u_glideReflection{{ n }}.ui.y) {
            color = WHITE;
            return true;
        }

        // line
        pos -= u_glideReflection{{ n }}.p;
        float hpdGlide{{ n }} = dot(u_glideReflection{{ n }}.normal.xy, pos);
        if(hpdGlide{{ n }} > 0. && u_glideReflection{{ n }}.normal.z > hpdGlide{{ n }} &&
           abs(dot(pos, vec2(-u_glideReflection{{ n }}.normal.y, u_glideReflection{{ n }}.normal.x))) < u_glideReflection{{ n }}.ui.y *.5) {
            color = WHITE;
            return true;
        }
        pos += u_glideReflection{{ n }}.p;
    }
    {% endfor %}

    {% for n in range(0, numRotation) %}
    if(u_rotation{{ n }}.selected) {
        // point p
        if(distance(pos, u_rotation{{ n }}.p) < u_rotation{{ n }}.ui.y) {
            color = LIGHT_BLUE;
            return true;
        }
        if(distance(pos, u_rotation{{ n }}.boundaryPoint.xy) < u_rotation{{ n }}.ui.y) {
            color = PINK;
            return true;
        }
        if(distance(pos, u_rotation{{ n }}.boundaryPoint.zw) < u_rotation{{ n }}.ui.y) {
            color = PINK;
            return true;
        }
        // line
        pos -= u_rotation{{ n }}.p;
        dist = dot(-u_rotation{{ n }}.normal.xy, pos);
        if(0. < dist && dist < u_rotation{{ n }}.ui.y) {
            color = WHITE;
            return true;
        }
        dist = dot(-u_rotation{{ n }}.normal.zw, pos);
        if(0. < dist && dist < u_rotation{{ n }}.ui.y) {
            color = WHITE;
            return true;
        }

        // ring
        if(dot(pos, u_rotation{{ n }}.normal.xy) > 0. &&
           dot(pos, u_rotation{{ n }}.normal.zw) > 0. &&
           abs(distance(pos, u_rotation{{ n }}.p - u_rotation{{ n }}.p) - u_rotation{{ n }}.ui.x) < u_rotation{{ n }}.ui.y *.5) {
            color = WHITE;
            return true;
        }
        pos += u_rotation{{ n }}.p;
    }
    {% endfor %}

    {% for n in range(0, numCrossingInversions) %}
    if(u_crossingInversions{{ n }}.selected) {
        // point p
        if(distance(pos, u_crossingInversions{{ n }}.p) < u_crossingInversions{{ n }}.ui.y) {
            color = LIGHT_BLUE;
            return true;
        }
        if(distance(pos, u_crossingInversions{{ n }}.boundaryPoint.xy) < u_crossingInversions{{ n }}.ui.y) {
            color = PINK;
            return true;
        }
        if(distance(pos, u_crossingInversions{{ n }}.boundaryPoint.zw) < u_crossingInversions{{ n }}.ui.y) {
            color = PINK;
            return true;
        }
        // line
        pos -= u_crossingInversions{{ n }}.p;
        dist = dot(-u_crossingInversions{{ n }}.normal.xy, pos);
        if(0. < dist && dist < u_crossingInversions{{ n }}.ui.y) {
            color = WHITE;
            return true;
        }
        dist = dot(-u_crossingInversions{{ n }}.normal.zw, pos);
        if(0. < dist && dist < u_crossingInversions{{ n }}.ui.y) {
            color = WHITE;
            return true;
        }

        // ring
        if(dot(pos, u_crossingInversions{{ n }}.normal.xy) > 0. &&
           dot(pos, u_crossingInversions{{ n }}.normal.zw) > 0. &&
           abs(distance(pos, u_crossingInversions{{ n }}.p - u_crossingInversions{{ n }}.p) - u_crossingInversions{{ n }}.ui.x) < u_crossingInversions{{ n }}.ui.y *.5) {
            color = WHITE;
            return true;
        }
        pos += u_crossingInversions{{ n }}.p;
    }
    {% endfor %}

    {% for n in range(0, numLoxodromic) %}
    // point p
    if(distance(pos, u_loxodromic{{ n }}.p) < u_loxodromic{{ n }}.ui.x) {
        color = PINK;
        return true;
    }
    {% endfor %}

    {% for no in range(0, numOrbitSeed) %}
    if(u_orbitSeed{{ no }}.selected) {
        vec2 uv{{ no }} = (pos - u_orbitSeed{{ no }}.corner) / u_orbitSeed{{ no }}.size;
        if(0. < uv{{ n }}{{ no }}.x && uv{{ n }}{{ no }}.x < 1. &&
           0. < uv{{ n }}{{ no }}.y && uv{{ n }}{{ no }}.y < 1. &&
           (pos.x < u_orbitSeed{{ no }}.ui.x || u_orbitSeed{{ no }}.ui.z < pos.x ||
            pos.y < u_orbitSeed{{ no }}.ui.y || u_orbitSeed{{ no }}.ui.w < pos.y)) {
            color = WHITE;
            return true;
        }
    }
    {% endfor %}

    {% for no in range(0, numCameraOrbit) %}
    if(u_cameraOrbit{{ no }}.selected) {
        vec2 uv{{ no }} = (pos - u_cameraOrbit{{ no }}.corner) / u_cameraOrbit{{ no }}.size;
        if(0. < uv{{ n }}{{ no }}.x && uv{{ n }}{{ no }}.x < 1. &&
           0. < uv{{ n }}{{ no }}.y && uv{{ n }}{{ no }}.y < 1. &&
           (pos.x < u_cameraOrbit{{ no }}.ui.x || u_cameraOrbit{{ no }}.ui.z < pos.x ||
            pos.y < u_cameraOrbit{{ no }}.ui.y || u_cameraOrbit{{ no }}.ui.w < pos.y)) {
            color = WHITE;
            return true;
        }
    }
    {% endfor %}

    {% for n in range(0, numScaling) %}
    if(distance(pos, u_scaling{{ n }}.line1.xy) < u_scaling{{ n }}.ui.x) {
        color = PINK;
        return true;
    }
    if(distance(pos, u_scaling{{ n }}.line2.xy) < u_scaling{{ n }}.ui.x) {
        color = PINK;
        return true;
    }
    {% endfor %}

    return false;
}

bool renderGenerator(vec2 pos, out vec3 color) {
    color = vec3(0);
    float dist;
    {% for n in range(0, numTwoCircles) %}
    if(u_hyperbolic{{ n }}.selected) {
        dist = u_hyperbolic{{ n }}.c1.z - distance(pos, u_hyperbolic{{ n }}.c1.xy);
        if(0. < dist && dist < u_hyperbolic{{ n }}.ui){
            color = WHITE;
            return true;
        }

        dist = u_hyperbolic{{ n }}.c2.z - distance(pos, u_hyperbolic{{ n }}.c2.xy);
        if(0. < dist && dist < u_hyperbolic{{ n }}.ui){
            color = WHITE;
            return true;
        }
    }
    if(distance(pos, u_hyperbolic{{ n }}.c1.xy) < u_hyperbolic{{ n }}.c1.z) {
        color = RED;
        return true;
    }
    if(distance(pos, u_hyperbolic{{ n }}.c2.xy) < u_hyperbolic{{ n }}.c2.z) {
        color = GREEN;
        return true;
    }
    if(distance(pos, u_hyperbolic{{ n }}.c1d.xy) < u_hyperbolic{{ n }}.c1d.z) {
        color = BLUE;
        return true;
    }
    {% endfor %}

    {% for n in range(0, numLoxodromic) %}
    // line
    if(abs(dot(pos - u_loxodromic{{ n }}.c1.xy,
               u_loxodromic{{ n }}.line.zw)) < u_loxodromic{{ n }}.ui.y) {
        color = WHITE;
        return true;
    }
    vec4 loxoCol{{ n }} = vec4(0);
    bool loxoRender{{ n }} = false;
    if (distance(pos, u_loxodromic{{ n }}.c3.xy) < u_loxodromic{{ n }}.c3.z) {
        loxoCol{{ n }} = blendCol(vec4(YELLOW, 0.5), loxoCol{{ n }});
        loxoRender{{ n }} = true;
    }
    if(u_loxodromic{{ n }}.selected) {
        dist = u_loxodromic{{ n }}.c1.z - distance(pos, u_loxodromic{{ n }}.c1.xy);
        if(0. < dist && dist < u_loxodromic{{ n }}.ui.z){
            loxoCol{{ n }} = blendCol(vec4(WHITE, 1.), loxoCol{{ n }});
            loxoRender{{ n }} = true;
        }

        dist = u_loxodromic{{ n }}.c2.z - distance(pos, u_loxodromic{{ n }}.c2.xy);
        if(0. < dist && dist < u_loxodromic{{ n }}.ui.z){
            loxoCol{{ n }} = blendCol(vec4(WHITE, 1.), loxoCol{{ n }});
            loxoRender{{ n }} = true;
        }
    }
    if(distance(pos, u_loxodromic{{ n }}.c1.xy) < u_loxodromic{{ n }}.c1.z) {
        loxoCol{{ n }} = blendCol(vec4(RED, 1.), loxoCol{{ n }});
        loxoRender{{ n }} = true;
    }else if(distance(pos, u_loxodromic{{ n }}.c2.xy) < u_loxodromic{{ n }}.c2.z) {
        loxoCol{{ n }} = blendCol(vec4(GREEN, 1.), loxoCol{{ n }});
        loxoRender{{ n }} = true;
    }else if(distance(pos, u_loxodromic{{ n }}.c1d.xy) < u_loxodromic{{ n }}.c1d.z) {
        loxoCol{{ n }} = blendCol(vec4(BLUE, 1.), loxoCol{{ n }});
        loxoRender{{ n }} = true;
    }
    if(loxoRender{{ n }}) {
        color = loxoCol{{ n }}.rgb;
        return true;
    }
    {% endfor %}

    {% for n in range(0, numScaling) %}
    if(abs(dot(pos - u_scaling{{ n }}.line1.xy,
               u_scaling{{ n }}.line1.zw)) < u_scaling{{ n }}.ui.y) {
        color = YELLOW;
        return true;
    }
    if(abs(dot(pos - u_scaling{{ n }}.line2.xy,
               u_scaling{{ n }}.line2.zw)) < u_scaling{{ n }}.ui.y) {
        color = WHITE;
        return true;
    }
    if(distance(pos, u_scaling{{ n }}.c1.xy) < u_scaling{{ n }}.c1.z) {
        color = RED;
        return true;
    }
    if(distance(pos, u_scaling{{ n }}.c2.xy) < u_scaling{{ n }}.c2.z) {
        color = GREEN;
        return true;
    }
    if(distance(pos, u_scaling{{ n }}.c1d.xy) < u_scaling{{ n }}.c1d.z) {
        color = BLUE;
        return true;
    }
    {% endfor %}

    return false;
}

const float MAX_SAMPLES = 20.;
void main() {
    vec3 sum = vec3(0);
    float ratio = u_resolution.x / u_resolution.y / 2.0;
    for(float i = 0.; i < MAX_SAMPLES; i++){
        vec2 position = ((gl_FragCoord.xy + rand2n(gl_FragCoord.xy, i)) / u_resolution.yy ) - vec2(ratio, 0.5);
        position = position * u_geometry.z;
        position += u_geometry.xy;

        vec3 col = vec3(0);
        if (u_isRenderingGenerator) {
            if(renderUI(position, col)) {
                sum += col;
                continue;
            }
        }

        col = vec3(0);
        bool isRendered = IIS(position, col);
        if(isRendered){
            sum += col;
            continue;
        }

        if (u_isRenderingGenerator) {
            if(renderGenerator(position, col)) {
                sum += col;
                    continue;
            }
        }
    }
    vec3 texCol = textureLod(u_accTexture, gl_FragCoord.xy / u_resolution, 0.0).rgb;
    outColor = vec4(sum / MAX_SAMPLES, 1);
}
