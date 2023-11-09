#version 300 es

precision mediump float;

out vec4 outColor;

{% include "./2dUniforms.njk.frag" %}

// include Color constants, hsv2rgb, and blendCol
{% include "./color.njk.frag" %}

// from Syntopia http://blog.hvidtfeldts.net/index.php/2015/01/path-tracing-3d-fractals/
vec2 rand2n(vec2 co, float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

vec2 circleInvert(vec2 pos, const Circle circle) {
    vec2 p = pos - circle.center;
    float d = length(p);
    return (p * circle.radius * circle.radius)/(d * d) + circle.center;
}

vec3 computeColor(float n) {
    return hsv2rgb(0.01 + 0.05 * (n -1.), 1., 1.);
}

const int MAX_ITERATIONS = 200;
bool IIS(vec2 pos, out vec4 outColor) {
    int u_maxIISIterations = 100;
    float invNum = 0.;
    bool inFund = true;
    vec4 col;
    for (int i = 0; i < MAX_ITERATIONS; i++) {
        if(i > u_maxIISIterations) break;

        {% for n in range(0,  numCircle ) %}
        if(distance(pos, u_circle[{{ n }}].center) < u_circle[{{ n }}].radius) {
            if(u_circle[{{ n }}].isSelected) {
                invNum++;
            }
            pos = circleInvert(pos, u_circle[{{ n }}]);
            invNum++;
            continue;
        }
        {% endfor %}

        break;
    }

    outColor = vec4(computeColor(invNum), 1.);

    return (invNum == 0.) ? false : true;
}

const float MAX_SAMPLES = 20.;
void main() {
    vec4 sum = vec4(0);
    float ratio = u_resolution.x / u_resolution.y / 2.0;
    for(float i = 0.; i < MAX_SAMPLES; i++){
        vec2 position = ((gl_FragCoord.xy + rand2n(gl_FragCoord.xy, i)) / u_resolution.yy ) - vec2(ratio, 0.5);
        position = position * u_geometry.z;
        position += u_geometry.xy;

        vec4 col;
        bool rendered = IIS(position, col);

        if(rendered) {
            sum += col;
        } else {
            sum += vec4(0, 0, 0, 1);
        }
    }

    //vec3 texCol = textureLod(u_accTexture, gl_FragCoord.xy / u_resolution, 0.0).rgb;
    outColor = sum / MAX_SAMPLES;
}
