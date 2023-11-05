uniform sampler2D u_accTexture;
uniform vec2 u_resolution;
// [translateX, translateY, scale]
uniform vec3 u_geometry;
uniform sampler2D u_videoTexture;

{% if numImageTexture > 0 %}
uniform sampler2D u_imageTexture[{{ numImageTexture }}];
{% endif %}

{% if numCanvasTexture > 0 %}
uniform sampler2D u_canvasTexture[{{ numCanvasTexture }}];
{% endif %}

uniform float u_isRenderingGenerator;

struct Circle {
    vec2 center;
    float radius;
    bool isSelected;
};

struct HalfPlane {
    vec2 p;
    vec2 normal;
    bool isSelected;
};

struct OrbitSeed {
    vec2 origin;
    vec2 size;
    float rotationRadian;
    int textureIndex;
    bool isSelected;
};

uniform float u_uiControlPointRadius;
uniform float u_circumferenceThickness;
uniform float u_seedBorderWidth;

{% if numCircle > 0 %}
uniform Circle u_circle[{{ numCircle }}];
{% endif %}

{% if numHalfPlane > 0 %}
uniform HalfPlane u_halfPlane[{{ numHalfPlane }}];
{% endif %}

{% if numImageSeed > 0 %}
uniform OrbitSeed u_imageSeed[{{ numImageSeed }}];
{% endif %}

{% if numVideoSeed > 0 %}
uniform OrbitSeed u_videoSeed[{{ numVideoSeed }}];
{% endif %}

{% if numCanvasSeed > 0 %}
uniform OrbitSeed u_canvasSeed[{{ numCanvasSeed }}];
{% endif %}
