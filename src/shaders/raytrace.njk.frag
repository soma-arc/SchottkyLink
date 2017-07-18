vec3 calcRay (const vec3 eye, const vec3 target, const vec3 up, const float fov,
              const vec2 resolution, const vec2 coord){
    float imagePlane = (resolution.y * .5) / tan(fov * .5);
    vec3 v = normalize(target - eye);
    vec3 xaxis = normalize(cross(v, up));
    vec3 yaxis =  normalize(cross(v, xaxis));
    vec3 center = v * imagePlane;
    vec3 origin = center - (xaxis * (resolution.x  *.5)) - (yaxis * (resolution.y * .5));
    return normalize(origin + (xaxis * coord.x) + (yaxis * (resolution.y - coord.y)));
}

struct IsectInfo {
    int objId;
    int objIndex;
    int objComponentId;
    vec3 normal;
    vec3 intersection;
    float mint;
    float maxt;
    vec3 matColor;
    bool hit;
};

float MAX_FLOAT = 1e20;
const float THRESHOLD = 0.001;

IsectInfo newIsectInfo() {
    IsectInfo isectInfo;
    isectInfo.objId = -1;
    isectInfo.objIndex = -1;
    isectInfo.objComponentId = -1;
    isectInfo.mint = MAX_FLOAT;
    isectInfo.maxt = 9999999.;
    isectInfo.hit = false;
    return isectInfo;
}

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

void intersectParallelPlanes(const int objId, const int objIndex,
                             const vec3 p, const vec3 normal, const vec3 up, const vec2 size,
                             const vec2 dist,
                             vec3 rayOrg, const vec3 rayDir, inout IsectInfo isectInfo) {
    intersectRect(objId, objIndex, 0,
                  BLUE,
                  p, normal, up, size,
                  rayOrg, rayDir, isectInfo);
    intersectRect(objId, objIndex, 1,
                  BLUE,
                  p + normal * dist.x, normal, up, size,
                  rayOrg, rayDir, isectInfo);
}
