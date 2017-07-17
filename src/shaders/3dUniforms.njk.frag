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

struct ObjBasis {
    vec3 center;
    float r;
    float len;
};

uniform bool u_isSelectingObj;
uniform ObjBasis u_objBasis;

struct Sphere {
    vec3 center;
    vec2 r; // [r, rSq]
    bool selected;
};

struct HyperPlane {
    vec3 center;
    vec3 normal;
    vec2 ui; //[sizeX, sizeY]
    bool selected;
};

int ID_BASE_SPHERE = 0;
int ID_INVERSION_SPHERE = 1;
int ID_ORBIT = 2;
int ID_HYPER_PLANE = 3;

{% for n in range(0, numBaseSphere) %}
uniform Sphere u_baseSphere{{ n }};
{% endfor %}

{% for n in range(0, numInversionSphere) %}
uniform Sphere u_inversionSphere{{ n }};
{% endfor %}

{% for n in range(0, numHyperPlane) %}
uniform HyperPlane u_hyperPlane{{ n }};
{% endfor %}
