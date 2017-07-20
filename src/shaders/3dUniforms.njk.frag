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
uniform bool u_renderGenerators;

struct ObjBasis {
    vec3 center;
    float r;
    float len;
    bool hasRotationUI;
    vec2 rotationParam; // [radius, pipeRadius]
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
    vec3 up;
    vec2 ui; //[sizeX, sizeY]
    bool selected;
};

struct ParallelPlanes {
    vec3 p;
    vec3 normal;
    vec3 up;
    vec2 dist; //[plane distance, planeDist * 2]
    vec2 ui; //[sizeX, sizeY]
    bool selected;
};

struct TwoSpheres {
    Sphere s1;
    Sphere s2;
    Sphere s1d;
    bool selected;
};

struct Loxodromic {
    Sphere s1;
    Sphere s2;
    Sphere s1d;
    Sphere s3;
    Sphere s4;
    vec4 p; // [x, y, z, selected (0 or 1)]
    vec4 q1; // [x, y, z, selected (0 or 1)]
    vec4 q2; // [x, y, z, selected (0 or 1)]
    float ui; // [radius]
    bool selected;
};

int ID_BASE_SPHERE = 0;
int ID_INVERSION_SPHERE = 1;
int ID_ORBIT = 2;
int ID_HYPER_PLANE = 3;
int ID_PARALLEL_PLANES = 4;
int ID_TWO_SPHERES = 5;
int ID_LOXODROMIC = 6;

{% for n in range(0, numBaseSphere) %}
uniform Sphere u_baseSphere{{ n }};
{% endfor %}

{% for n in range(0, numInversionSphere) %}
uniform Sphere u_inversionSphere{{ n }};
{% endfor %}

{% for n in range(0, numHyperPlane) %}
uniform HyperPlane u_hyperPlane{{ n }};
{% endfor %}

{% for n in range(0, numParallelPlanes) %}
uniform ParallelPlanes u_parallelPlanes{{ n }};
{% endfor %}

{% for n in range(0, numTwoSpheres) %}
uniform TwoSpheres u_twoSpheres{{ n }};
{% endfor %}

{% for n in range(0, numLoxodromic) %}
uniform Loxodromic u_loxodromic{{ n }};
{% endfor %}
