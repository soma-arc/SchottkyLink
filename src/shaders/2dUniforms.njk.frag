uniform sampler2D u_accTexture;
uniform vec2 u_resolution;
// [translateX, translateY, scale]
uniform vec3 u_geometry;
uniform int u_maxIISIterations;
uniform sampler2D u_imageTextures;
uniform bool u_isRenderingGenerator;

struct Circle {
    vec4 centerAndRadius; // [x, y, r, r * r]
    float ui; // [boundaryThickness]
    bool selected;
};

struct HalfPlane {
    vec2 p;
    vec4 normal; //[x, y, normal ring radius, point radius]
    bool selected;
};

struct ParallelTranslation {
    vec2 p;
    vec4 normal; //[x, y, halfplane distance, translation length]
    vec2 ui; //[normal ring radius, point radius]
    bool selected;
};

struct Rotation {
    vec2 p;
    vec4 normal; // [normal1, normal2]
    vec4 boundaryPoint; // [p1, p2]
    vec2 ui; //[normal ring radius, point radius]
    bool selected;
};

struct TwoCircles {
    vec4 c1;
    vec4 c2;
    vec4 c1d;
    float ui; //[boundaryThickness]
    bool selected;
};

struct Loxodromic {
    vec4 c1;
    vec4 c2;
    vec4 c1d;
    vec4 c3;
    vec2 p;
    vec4 line; // [dirX, dirY, normalX, normalY]
    vec3 ui; //[normal ring radius, point radius, circumferenceThickness]
    bool selected;
};

struct OrbitSeed {
    int imageTexIndex;
    vec2 corner;
    vec2 size;
    vec4 ui; // [bodyCorner, bodySize]
    bool selected;
};

struct Scaling {
    vec4 c1;
    vec4 c2;
    vec4 c1d;
    vec4 line1;
    vec4 line2;
    vec2 ui; // [pointRadius, lineWidth]
    bool selected;
};

//[x, y, r, r * r]
{% for n  in range(0,  numCircle ) %}
uniform Circle u_circle{{ n }};
{% endfor %}

//[x, y, r, r * r]
{% for n  in range(0,  numCircleFromPoints ) %}
uniform Circle u_circleFromPoints{{ n }};
{% endfor %}

{% for n in range(0, numHalfPlane) %}
uniform HalfPlane u_halfPlane{{ n }};
{% endfor %}

//[x, y, r]
{% for n in range(0, numPoint) %}
uniform vec3 u_point{{ n }};
{% endfor %}

{% for n in range(0, numParallelTranslation) %}
uniform ParallelTranslation u_translate{{ n }};
{% endfor %}

{% for n in range(0, numRotation) %}
uniform Rotation u_rotation{{ n }};
{% endfor %}

{% for n in range(0, numTwoCircles) %}
uniform TwoCircles u_hyperbolic{{ n }};
{% endfor %}

{% for n in range(0, numLoxodromic) %}
uniform Loxodromic u_loxodromic{{ n }};
{% endfor %}

{% for n in range(0, numOrbitSeed) %}
uniform OrbitSeed u_orbitSeed{{ n }};
{% endfor %}

{% for n in range(0, numScaling) %}
uniform Scaling u_scaling{{ n }};
{% endfor %}
