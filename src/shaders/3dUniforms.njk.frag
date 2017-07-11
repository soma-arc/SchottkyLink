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

struct Sphere {
    vec3 pos;
    vec2 r; // [r, rSq]
    bool selected;
};

{% for n in range(0, numBaseSphere) %}
uniform Sphere u_baseSphere{{ n }};
{% endfor %}
