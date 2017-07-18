#version 300 es

precision mediump float;

{% include "./3dUniforms.njk.frag" %}
{% include "./raytrace.njk.frag" %}

// from Syntopia http://blog.hvidtfeldts.net/index.php/2015/01/path-tracing-3d-fractals/
// include Color constants, hsv2rgb, and blendCol
{% include "./color.njk.frag" %}

vec2 rand2n(const vec2 co, const float sampleIndex) {
    vec2 seed = co * (sampleIndex + 1.0);
    seed+=vec2(-1,1);
    // implementation based on: lumina.sourceforge.net/Tutorials/Noise.html
    return vec2(fract(sin(dot(seed.xy ,vec2(12.9898,78.233))) * 43758.5453),
                fract(cos(dot(seed.xy ,vec2(4.898,7.23))) * 23421.631));
}

float MAX_FLOAT = 1e20;
const float THRESHOLD = 0.001;

bool intersectBoundingSphere(vec3 sphereCenter, float radius,
                             vec3 rayOrigin, vec3 rayDir,
                             out float t0, out float t1){
  	vec3 v = rayOrigin - sphereCenter;
  	float b = dot(rayDir, v);
  	float c = dot(v, v) - radius * radius;
  	float d = b * b - c;
  	if(d >= 0.){
    	float s = sqrt(d);
    	float tm = -b - s;
        t0 = tm;
        if(tm <= THRESHOLD){
            t1 = tm;
            tm = -b + s;
            t0 = tm;
        }else{
        	t1 = -b + s;
        }
    	if(THRESHOLD < tm){
      		return true;
    	}
  	}
  	return false;
}

void intersectSphere(const int objId, const int objIndex, const int objComponentId,
                     const vec3 matColor,
                     const vec3 sphereCenter, const float radius,
                     const vec3 rayOrigin, const vec3 rayDir, inout IsectInfo isectInfo){
    vec3 v = rayOrigin - sphereCenter;
    float b = dot(rayDir, v);
    float c = dot(v, v) - radius * radius;
    float d = b * b - c;
    if(d >= 0.){
        float s = sqrt(d);
        float t = -b - s;
        if(t <= THRESHOLD) t = -b + s;
        if(THRESHOLD < t && t < isectInfo.mint){
            isectInfo.objId = objId;
            isectInfo.objIndex = objIndex;
            isectInfo.objComponentId = objComponentId;
            isectInfo.matColor = matColor;
            isectInfo.mint = t;
            isectInfo.intersection = (rayOrigin + t * rayDir);
            isectInfo.normal = normalize(isectInfo.intersection - sphereCenter);
            isectInfo.hit = true;
        }
    }
}

void intersectXYCylinder(const int objId, const int objIndex, const int objComponentId,
                         const vec3 matColor,
                         const vec3 center, const float r, const float len,
                         vec3 rayOrigin, const vec3 rayDir, inout IsectInfo isectInfo){
    rayOrigin = rayOrigin - center;
    float a = rayDir.x * rayDir.x + rayDir.y * rayDir.y;
    float b = 2. * ( rayOrigin.x * rayDir.x + rayOrigin.y * rayDir.y);
    float c = rayOrigin.x * rayOrigin.x + rayOrigin.y * rayOrigin.y - r * r;
    float d = b * b - 4. * a * c;
    if(d >= 0.){
        float s = sqrt(d);
        float t = (-b - s) / (2. * a);
        if(t <= THRESHOLD) t = (-b + s) / (2. * a);
        vec3 p = (rayOrigin + t * rayDir);
        if(THRESHOLD < t && t < isectInfo.mint &&
           0. < p.z && p.z < len){
            isectInfo.objId = objId;
            isectInfo.objIndex = objIndex;
            isectInfo.objComponentId = objComponentId;
            isectInfo.matColor = matColor;
            isectInfo.mint = t;
            isectInfo.intersection = p;
            isectInfo.normal = normalize(vec3(isectInfo.intersection.xy, 0));
            isectInfo.hit = true;
        }
    }
}

void intersectYZCylinder(const int objId, const int objIndex, const int objComponentId,
                         const vec3 matColor,
                         const vec3 center, const float r, const float len,
                         vec3 rayOrigin, const vec3 rayDir, inout IsectInfo isectInfo){
    rayOrigin = rayOrigin - center;
    float a = rayDir.y * rayDir.y + rayDir.z * rayDir.z;
    float b = 2. * ( rayOrigin.y * rayDir.y + rayOrigin.z * rayDir.z);
    float c = rayOrigin.y * rayOrigin.y + rayOrigin.z * rayOrigin.z - r * r;
    float d = b * b - 4. * a * c;
    if(d >= 0.){
        float s = sqrt(d);
        float t = (-b - s) / (2. * a);
        if(t <= THRESHOLD) t = (-b + s) / (2. * a);
        vec3 p = (rayOrigin + t * rayDir);
        if(THRESHOLD < t && t < isectInfo.mint &&
           0. < p.x && p.x < len){
            isectInfo.objId = objId;
            isectInfo.objIndex = objIndex;
            isectInfo.objComponentId = objComponentId;
            isectInfo.matColor = matColor;
            isectInfo.mint = t;
            isectInfo.intersection = p;
            isectInfo.normal = normalize(vec3(0, isectInfo.intersection.yz));
            isectInfo.hit = true;
        }
    }
}

void intersectXZCylinder(const int objId, const int objIndex, const int objComponentId,
                         const vec3 matColor,
                         const vec3 center, const float r, const float len,
                         vec3 rayOrigin, const vec3 rayDir, inout IsectInfo isectInfo){
    rayOrigin = rayOrigin - center;
    float a = rayDir.x * rayDir.x + rayDir.z * rayDir.z;
    float b = 2. * ( rayOrigin.x * rayDir.x + rayOrigin.z * rayDir.z);
    float c = rayOrigin.x * rayOrigin.x + rayOrigin.z * rayOrigin.z - r * r;
    float d = b * b - 4. * a * c;
    if(d >= 0.){
        float s = sqrt(d);
        float t = (-b - s) / (2. * a);
        if(t <= THRESHOLD) t = (-b + s) / (2. * a);
        vec3 p = (rayOrigin + t * rayDir);
        if(THRESHOLD < t && t < isectInfo.mint &&
           0. < p.y && p.y < len){
            isectInfo.objId = objId;
            isectInfo.objIndex = objIndex;
            isectInfo.objComponentId = objComponentId;
            isectInfo.matColor = matColor;
            isectInfo.mint = t;
            isectInfo.intersection = p;
            isectInfo.normal = normalize(vec3(isectInfo.intersection.x,
                                              0,
                                              isectInfo.intersection.z));
            isectInfo.hit = true;
        }
    }
}

void intersectRect(const int objId, const int objIndex, const int objComponentId,
                   const vec3 matColor,
                   const vec3 center, const vec3 normal, const vec3 up, const vec2 size,
                   vec3 rayOrigin, const vec3 rayDir, inout IsectInfo isectInfo) {
    rayOrigin = rayOrigin - center;
    float v = dot(normal, rayDir);
    float t = -(dot(normal, rayOrigin)) / v;
    if(THRESHOLD < t && t < isectInfo.mint){
        vec3 p = rayOrigin + t * rayDir;
        vec2 hSize = size * .5;
        vec3 yAxis = up;
        vec3 xAxis = cross(yAxis, normal);
        float x = dot(p, xAxis);
        float y = dot(p, yAxis);
        if(-hSize.x <= x && x <= hSize.x &&
           -hSize.y <= y && y <= hSize.y ){
            isectInfo.objId = objId;
            isectInfo.objIndex = objIndex;
            isectInfo.objComponentId = objComponentId;
            isectInfo.matColor = matColor;
            isectInfo.mint = t;
            isectInfo.intersection = p + center;
            isectInfo.normal = normal;
            isectInfo.hit = true;
        }
    }
}

float distSphere(vec3 pos, vec3 center, float radius) {
    return distance(pos, center) - radius;
}

vec4 distUnion(vec4 t1, vec4 t2) {
    return (t1.x < t2.x) ? t1 : t2;
}

const int MAX_MARCHING_LOOP = 1000;


vec4 distRotationTorus(vec3 pos, const vec3 center, const float radius, const float pipeRadius) {
    vec4 hit = vec4(MAX_FLOAT, -1, -1, -1);
    pos -= center;
    hit = distUnion(hit, vec4(length(vec2(length(pos.yz) - radius, pos.x)) - pipeRadius,
                              -1, -1, 0));
    hit = distUnion(hit, vec4(length(vec2(length(pos.xz) - radius, pos.y)) - pipeRadius,
                              -1, -1, 1));
    return hit;
}

void intersectRotationTorus(const int objId, const int objIndex,
                            const vec3 center, const float radius, const float pipeRadius,
                            vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    float rayLength = 0.;
    vec3 rayPos = rayOrg + rayDir * rayLength;
    vec4 dist = vec4(-1);
    for(int i = 0 ; i < MAX_MARCHING_LOOP ; i++) {
        if(rayLength > isectInfo.maxt ||
           rayLength > isectInfo.mint) break;
        dist = distRotationTorus(rayPos, center, radius, pipeRadius);
        rayLength += dist.x;
        rayPos = rayOrg + rayDir * rayLength;
        if(dist.x < THRESHOLD) {
            isectInfo.objId = int(dist.y);
            isectInfo.objIndex = int(dist.z);
            isectInfo.objComponentId = int(dist.w);
            isectInfo.matColor = (isectInfo.objComponentId == 0) ? BLUE : RED;
            isectInfo.intersection = rayPos;
            //            isectInfo.normal = computeNormal(rayPos);
            isectInfo.hit = true;
            break;
        }
    }
}

void intersectBasisCylinder(const int objId, const int objIndex,
                            const vec3 center, const float r, const float len,
                            vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    intersectXYCylinder(objId, objIndex, -1,
                        PINK,
                        center, r, len,
                        rayOrg, rayDir, isectInfo);
    intersectYZCylinder(objId, objIndex, -1,
                        BLUE,
                        center, r, len,
                        rayOrg, rayDir, isectInfo);
    intersectXZCylinder(objId, objIndex, -1,
                        YELLOW,
                        center, r, len,
                        rayOrg, rayDir, isectInfo);
}

void intersectGenerators(const vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    {% for n in range(0, numBaseSphere) %}
    intersectSphere(ID_BASE_SPHERE, {{ n }}, 0, (u_baseSphere{{ n }}.selected) ? RED : GREEN,
                    u_baseSphere{{ n }}.center, u_baseSphere{{ n }}.r.x,
                    rayOrg, rayDir, isectInfo);
    {% endfor %}

    {% for n in range(0, numInversionSphere) %}
    intersectSphere(ID_INVERSION_SPHERE, {{ n }}, 0,
                    (u_inversionSphere{{ n }}.selected) ? RED : GRAY,
                    u_inversionSphere{{ n }}.center, u_inversionSphere{{ n }}.r.x,
                    rayOrg, rayDir, isectInfo);
    {% endfor %}

    {% for n in range(0, numHyperPlane) %}
    intersectRect(ID_HYPER_PLANE, {{ n }}, 0,
                  (u_hyperPlane{{ n }}.selected) ? RED : BLUE,
                  u_hyperPlane{{ n }}.center, u_hyperPlane{{ n }}.normal,
                  u_hyperPlane{{ n }}.up, u_hyperPlane{{ n }}.ui.xy,
                  rayOrg, rayDir, isectInfo);
    {% endfor %}
}

const int MAX_TRACE_DEPTH = 5;
const vec3 AMBIENT_FACTOR = vec3(0.1);
const vec3 LIGHT_DIR = normalize(vec3(1, 1, 0));
vec3 computeColor (const vec3 rayOrg, const vec3 rayDir) {
    IsectInfo isectInfo;
    isectInfo.objId = -1;
    isectInfo.objIndex = -1;
    isectInfo.mint = MAX_FLOAT;
    isectInfo.maxt = 9999999.;
    isectInfo.hit = false;

    vec3 l = BLACK;
    vec3 rayPos = rayOrg;

    if(u_isSelectingObj) {
        intersectBasisCylinder(-1, -1,
                               u_objBasis.center, u_objBasis.r, u_objBasis.len,
                               rayPos, rayDir, isectInfo);
        if(u_objBasis.hasRotationUI) {
            intersectRotationTorus(-1, -1,
                                   u_objBasis.center, u_objBasis.rotationParam.x,
                                   u_objBasis.rotationParam.y,
                                   rayPos, rayDir, isectInfo);
        }
        if(isectInfo.hit) {
            return isectInfo.matColor;
        }
    }

    float transparency = 0.8;
    float coeff = 1.;
    for(int depth = 0 ; depth < MAX_TRACE_DEPTH ; depth++) {
        //march(rayPos, rayDir, isectInfo);
        intersectGenerators(rayPos, rayDir, isectInfo);

        if(isectInfo.hit) {
            vec3 matColor = isectInfo.matColor;
            float alpha = 1.;
            bool transparent = false;
            transparent =  (isectInfo.objId == ID_INVERSION_SPHERE &&
                            isectInfo.objComponentId == 0) ?
                true : false;

            vec3 diffuse =  clamp(dot(isectInfo.normal, LIGHT_DIR), 0., 1.) * matColor;
            vec3 ambient = matColor * AMBIENT_FACTOR;
            if(transparent) {
                coeff *= transparency;
                l += (diffuse + ambient) * coeff;
                rayPos = isectInfo.intersection + rayDir * THRESHOLD * 2.;
                isectInfo.mint = MAX_FLOAT;
                isectInfo.hit = false;
                continue;
            } else {
                l += (diffuse + ambient) * coeff;
            }
        }

        break;
    }

    return l;
}

out vec4 outColor;
void main() {
    vec3 sum = vec3(0);
    float MAX_SAMPLES = 5.;
    for (float i = 0. ; i < MAX_SAMPLES ; i++) {
        vec2 coordOffset = rand2n(gl_FragCoord.xy, i);
        vec3 ray = calcRay(u_camera.pos, u_camera.target, u_camera.up, u_camera.fov,
                           u_resolution, gl_FragCoord.xy + coordOffset);
        sum += computeColor(u_camera.pos, ray);
    }
    //    vec3 texCol = texture(u_accTexture, gl_FragCoord.xy / u_resolution).rgb;

    outColor = vec4(sum / MAX_SAMPLES, 1.);//vec4(mix(computeColor(u_camera.pos, ray), texCol, u_textureWeight), 1.0);
}
