#version 300 es
precision mediump float;

in vec2 v_texCoord;
uniform sampler2D u_texture;

const float DISPLAY_GAMMA_COEFF = 1. / 2.2;
vec4 gammaCorrect(vec4 rgba) {
    return vec4((min(pow(rgba.r, DISPLAY_GAMMA_COEFF), 1.)),
                (min(pow(rgba.g, DISPLAY_GAMMA_COEFF), 1.)),
                (min(pow(rgba.b, DISPLAY_GAMMA_COEFF), 1.)),
                rgba.a);
}

out vec4 outColor;
void main() {
    outColor = gammaCorrect(texture(u_texture, v_texCoord));
}
