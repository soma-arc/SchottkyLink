struct Camera {
    vec3 pos;
    vec3 target;
    float fov;
    vec3 up;
};

uniform sampler2D u_textures[20];
uniform sampler2D u_accTexture;
uniform vec2 u_resolution;
uniform float u_textureWeight;
uniform float u_numSamples;
uniform float u_maxIISIterations;
uniform Camera u_camera;
