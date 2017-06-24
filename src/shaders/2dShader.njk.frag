#version 300 es

precision mediump float;

uniform sampler2D u_accTexture;
uniform vec2 u_resolution;
// [translateX, translateY, scale]
uniform vec3 u_geometry;
uniform int u_maxIISIterations;

struct Circle {
    vec4 centerAndRadius; // [x, y, r, r * r]
    float ui; // [boundaryThickness]
    bool selected;
};

struct HalfPlane {
    vec2 p;
    vec4 normal; //[x, y, normal ring radius, point radius]
    bool selected;
};

struct ParallelTranslation {
    vec2 p;
    vec3 normal; //[x, y, translation length]
    vec2 ui; //[normal ring radius, point radius]
    bool selected;
};

struct Rotation {
    vec2 p;
    vec4 normal;
    vec4 boundaryPoint;
    vec2 ui; //[normal ring radius, point radius]
    bool selected;
};

struct Hyperbolic {
    vec4 c1;
    vec4 c2;
    vec4 c1d;
    bool selected;
};

//[x, y, r, r * r]
{% for n  in range(0,  numCircle ) %}
uniform Circle u_circle{{ n }};
{% endfor %}

//[x, y, r, r * r]
{% for n  in range(0,  numCircleFromPoints ) %}
uniform Circle u_circleFromPoints{{ n }};
{% endfor %}

{% for n in range(0, numHalfPlane) %}
uniform HalfPlane u_halfPlane{{ n }};
{% endfor %}

//[x, y, r]
{% for n in range(0, numPoint) %}
uniform vec3 u_point{{ n }};
{% endfor %}

{% for n in range(0, numParallelTranslation) %}
uniform ParallelTranslation u_translate{{ n }};
{% endfor %}

{% for n in range(0, numRotation) %}
uniform Rotation u_rotation{{ n }};
{% endfor %}

{% for n in range(0, numHyperbolic) %}
uniform Hyperbolic u_hyperbolic{{ n }};
{% endfor %}

out vec4 outColor;

const vec3 BLACK = vec3(0);
const vec3 WHITE = vec3(1);
const vec3 RED = vec3(0.8, 0, 0);
const vec3 GREEN = vec3(0, 0.8, 0);
const vec3 BLUE = vec3(0, 0, 0.8);
const vec3 YELLOW = vec3(1, 1, 0);
const vec3 PINK = vec3(.78, 0, .78);
const vec3 LIGHT_BLUE = vec3(0, 1, 1);

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

const int MAX_ITERATIONS = 200;
float IIS(vec2 pos) {
    float invNum = 0.;
    bool inFund = true;
    for (int i = 0; i < MAX_ITERATIONS; i++) {
        if(i > u_maxIISIterations) break;
        inFund = true;

        {% for n in range(0,  numCircle ) %}
        if(distance(pos, u_circle{{ n }}.centerAndRadius.xy) < u_circle{{ n }}.centerAndRadius.z){
            pos = circleInvert(pos, u_circle{{ n }}.centerAndRadius);
            inFund = false;
            invNum++;
        }
        {% endfor %}

        {% for n in range(0,  numCircleFromPoints) %}
        if(distance(pos, u_circleFromPoints{{ n }}.centerAndRadius.xy) < u_circleFromPoints{{ n }}.centerAndRadius.z){
            pos = circleInvert(pos, u_circleFromPoints{{ n }}.centerAndRadius);
            inFund = false;
            invNum++;
        }
        {% endfor %}

        {% for n in range(0, numHyperbolic) %}
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
            pos -= u_translate{{ n }}.normal.xy * (hpd{{ n }} - mod(hpd{{ n }}, u_translate{{ n }}.normal.z));
            inFund = false;
        }
        pos += u_translate{{ n }}.p;
        {% endfor %}

        {% for n in range(0, numRotation) %}
        pos -= u_rotation{{ n }}.p;
        float dRot{{ n }} = dot(pos, u_rotation{{ n }}.normal.xy);
        invNum += (dRot{{ n }} < 0.) ? 1. : 0.;
        inFund = (dRot{{ n }} < 0. ) ? false : inFund;
        pos -= 2.0 * min(0., dRot{{ n }}) * u_rotation{{ n }}.normal.xy;
        pos += u_rotation{{ n }}.p;

        pos -= u_rotation{{ n }}.p;
        dRot{{ n }} = dot(pos, u_rotation{{ n }}.normal.zw);
        invNum += (dRot{{ n }} < 0.) ? 1. : 0.;
        inFund = (dRot{{ n }} < 0. ) ? false : inFund;
        pos -= 2.0 * min(0., dRot{{ n }}) * u_rotation{{ n }}.normal.zw;
        pos += u_rotation{{ n }}.p;
        {% endfor %}

        if (inFund) break;
    }

    return invNum;
}

vec3 hsv2rgb(vec3 c){
    const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
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
            color = LIGHT_BLUE;
            return true;
        }
        // point p
        if(distance(pos, u_halfPlane{{ n }}.p) < u_halfPlane{{ n }}.normal.w) {
            color = WHITE;
            return true;
        }
        // ring
        if(abs(distance(pos, u_halfPlane{{ n }}.p) - u_halfPlane{{ n }}.normal.z) < u_halfPlane{{ n }}.normal.w *.5) {
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
            color = WHITE;
            return true;
        }
        // point on hp2
        if(distance(pos, u_translate{{ n }}.p + u_translate{{ n }}.normal.xy * u_translate{{ n }}.normal.z) < u_translate{{ n }}.ui.y) {
            color = PINK;
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
        float rotDot{{ n }} = dot(u_rotation{{ n }}.normal.xy, pos);
        if(abs(rotDot{{ n }}) < u_rotation{{ n }}.ui.y * .5) {
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

    return false;
}

bool renderGenerator(vec2 pos, out vec3 color) {
    color = vec3(0);
    {% for n in range(0, numHyperbolic) %}
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
        bool isRendered = renderUI(position, col);
        if(isRendered) {
            sum += col;
            continue;
        }
        float loopNum = IIS(position);
        if(loopNum > 0.){
            vec3 hsv = vec3(0. + 0.05 * (loopNum -1.), 1.0, 1.0);
            sum += hsv2rgb(hsv);
            continue;
        }

        isRendered = renderGenerator(position, col);
        if(isRendered) {
            sum += col;
            continue;
        }
    }
    vec3 texCol = texture(u_accTexture, gl_FragCoord.xy / u_resolution).rgb;
    outColor = vec4(sum / MAX_SAMPLES, 1);
}
