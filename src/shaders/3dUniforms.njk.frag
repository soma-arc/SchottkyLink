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
uniform int u_maxIISIterations;
uniform Camera u_camera;

struct Sphere {
    vec3 center;
    vec2 r; // [r, rSq]
    bool selected;
};

int ID_BASE_SPHERE = 0;
{% for n in range(0, numBaseSphere) %}
uniform Sphere u_baseSphere{{ n }};
{% endfor %}

int ID_INVERSION_SPHERE = 1;
{% for n in range(0, numInversionSphere) %}
uniform Sphere u_inversionSphere{{ n }};
{% endfor %}

int ID_ORBIT = 2;
