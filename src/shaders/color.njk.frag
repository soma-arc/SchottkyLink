const vec3 BLACK = vec3(0);
const vec3 WHITE = vec3(1);
const vec3 RED = vec3(0.8, 0, 0);
const vec3 GREEN = vec3(0, 0.8, 0);
const vec3 BLUE = vec3(0, 0, 0.8);
const vec3 YELLOW = vec3(1, 1, 0);
const vec3 PINK = vec3(.78, 0, .78);
const vec3 LIGHT_BLUE = vec3(0, 1, 1);

vec3 hsv2rgb(float h, float s, float v){
    vec3 c = vec3(h, s, v);
    const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// front to back blend
vec4 blendCol(vec4 srcC, vec4 outC){
	srcC.rgb *= srcC.a;
	return outC + srcC * (1.0 - outC.a);
}
