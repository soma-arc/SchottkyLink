#version 300 es

precision mediump float;

uniform sampler2D u_accTexture;
uniform vec2 u_resolution;
// [translateX, translateY, scale]
uniform vec3 u_geometry;
uniform int u_maxIISIterations;

struct Circle {
    vec2 center; // [x, y]
    vec3 radius; // [r, r * r, circumferenceThickness]
    bool selected;
};

struct HalfPlane {
    vec2 p;
    vec4 normal; //[x, t, normal point length, point radius]
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

out vec4 outColor;

const vec3 BLACK = vec3(0);
const vec3 WHITE = vec3(1);
const vec3 RED = vec3(0.8, 0, 0);
const vec3 GREEN = vec3(0, 0.8, 0);
const vec3 BLUE = vec3(0, 0, 0.8);
const vec3 LIGHT_BLUE = vec3(0, 1, 1);

// from Syntopia http://blog.hvidtfeldts.net/index.php/2015/01/path-tracing-3d-fractals/
vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

vec2 circleInvert(const vec2 pos, const Circle circle){
    vec2 p = pos - circle.center;
    float d = length(p);
    return (p * circle.radius.y)/(d * d) + circle.center;
}

const int MAX_ITERATIONS = 200;
float IIS(vec2 pos) {
    float invNum = 0.;
    bool inFund = true;
    for (int i = 0; i < MAX_ITERATIONS; i++) {
        if(i > u_maxIISIterations) break;
        inFund = true;

        {% for n in range(0,  numCircle ) %}
        if(distance(pos, u_circle{{ n }}.center) < u_circle{{ n }}.radius.x){
            pos = circleInvert(pos, u_circle{{ n }});
            inFund = false;
            invNum++;
        }
        {% endfor %}

        {% for n in range(0,  numCircleFromPoints) %}
        if(distance(pos, u_circleFromPoints{{ n }}.center) < u_circleFromPoints{{ n }}.radius.x){
            pos = circleInvert(pos, u_circleFromPoints{{ n }});
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
        
        if (inFund) break;
    }

    return invNum;
}

vec3 hsv2rgb(vec3 c){
    const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

bool renderGenerator(vec2 pos, out vec3 color) {
    {% for n  in range(0,  numPoint ) %}
    if(distance(pos, u_point{{ n }}.xy) < u_point{{ n }}.z){
        color = BLUE;
        return true;
    }
    {% endfor %}

    float dist;
    {% for n in range(0,  numCircle ) %}
    if(u_circle{{ n }}.selected){
        dist = u_circle{{ n }}.radius.x - distance(pos, u_circle{{ n }}.center);
        if(0. < dist && dist < u_circle{{ n }}.radius.z){
            color = WHITE;
            return true;
        }
    }
    {% endfor %}

    {% for n in range(0, numHalfPlane) %}
    if(u_halfPlane{{ n }}.selected) {
        if(distance(pos, u_halfPlane{{ n }}.p + u_halfPlane{{ n }}.normal.xy * u_halfPlane{{ n }}.normal.z) < u_halfPlane{{ n }}.normal.w) {
            color = LIGHT_BLUE;
            return true;
        }
        if(distance(pos, u_halfPlane{{ n }}.p) < u_halfPlane{{ n }}.normal.w) {
            color = WHITE;
            return true;
        }
        if(abs(distance(pos, u_halfPlane{{ n }}.p) - u_halfPlane{{ n }}.normal.z) < 1.) {
            color = WHITE;
            return true;
        }
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
        bool isRendered = renderGenerator(position, col);
        if(isRendered) {
            sum += col;
            continue;
        }
        float loopNum = IIS(position);
        if(loopNum > 0.){
            vec3 hsv = vec3(0. + 0.01 * (loopNum -1.), 1.0, 1.0);
            sum += hsv2rgb(hsv);
        }
    }
    vec3 texCol = texture(u_accTexture, gl_FragCoord.xy / u_resolution).rgb;
    outColor = vec4(sum / MAX_SAMPLES, 1);
}
