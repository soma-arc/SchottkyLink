#version 300 es

precision mediump float;

uniform sampler2D u_accTexture;

out vec4 outColor;

void main() {
    outColor = vec4(1, 0, 0, 1);
}
