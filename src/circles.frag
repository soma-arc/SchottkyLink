#version 300 es

precision mediump float;

uniform sampler2D u_accTexture;
uniform vec2 u_resolution;
// [translateX, translateY, scale]
uniform vec3 u_geometry;

out vec4 outColor;

const vec3 g_c1 = vec3(100, 100, 100);
const vec3 g_c2 = vec3(100, -100, 100);
const vec3 g_c3 = vec3(-100, 100, 100);
const vec3 g_c4 = vec3(-100, -100, 100);

// from Syntopia http://blog.hvidtfeldts.net/index.php/2015/01/path-tracing-3d-fractals/
vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

vec2 circleInvert(const vec2 pos, const vec3 circle){
    vec2 p = pos - circle.xy;
    float d = length(p);
    return (p * circle.z * circle.z)/(d * d) + circle.xy;
}

const int MAX_ITERATIONS = 30;
float IIS(vec2 pos) {
    float invNum = 0.;
    bool inFund = true;
    for (int i = 0; i < MAX_ITERATIONS; i++) {
        inFund = true;
        if (distance(pos, g_c1.xy) < g_c1.z) {
            pos = circleInvert(pos, g_c1);
            inFund = false;
            invNum++;
        } else if (distance(pos, g_c2.xy) < g_c2.z) {
            pos = circleInvert(pos, g_c2);
            inFund = false;
            invNum++;
        } else if (distance(pos, g_c3.xy) < g_c3.z) {
            pos = circleInvert(pos, g_c3);
            inFund = false;
            invNum++;
        } else if (distance(pos, g_c4.xy) < g_c4.z) {
            pos = circleInvert(pos, g_c4);
            inFund = false;
            invNum++;
        }
        if (inFund) break;
    }

    return invNum;
}

vec3 hsv2rgb(vec3 c){
    const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

const float MAX_SAMPLES = 10.;
void main() {
    vec3 sum = vec3(0);
    float ratio = u_resolution.x / u_resolution.y / 2.0;
    for(float i = 0.; i < MAX_SAMPLES; i++){
        vec2 position = ((gl_FragCoord.xy + rand2n(gl_FragCoord.xy, i)) / u_resolution.yy ) - vec2(ratio, 0.5);
        position = position * 500.;//u_geometry.z;
        position += u_geometry.xy;

        vec3 col = vec3(0);
        float loopNum = IIS(position);
        if(loopNum > 0.){
            vec3 hsv = vec3(0. + 0.01 * (loopNum -1.), 1.0, 1.0);
            sum += hsv2rgb(hsv);
        }
    }
    vec3 texCol = texture(u_accTexture, gl_FragCoord.xy / u_resolution).rgb;
    outColor = vec4(sum / MAX_SAMPLES, 1);
}
