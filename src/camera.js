import Vec2 from './vector2d.js';
import Vec3 from './vector3d.js';

export class Camera {
    /**
     *
     * @param {Vec3} pos
     * @param {Vec3} target
     * @param {number} fov
     */
    constructor(pos, target, fov) {
        this.pos = pos;
        this.target = target;
        this.fov = fov; // radians
        this.up = new Vec3(0, 1, 0);
    }

    /**
     *
     * @param {number} screenWidth
     * @param {number} screenHeight
     * @param {number} coordX
     * @param {number} coordY
     * @return {Vec3}
     */
    computeRay(screenWidth, screenHeight, coordX, coordY) {
        const imagePlane = (screenHeight * 0.5) / Math.tan(this.fov * 0.5);
        const v = Vec3.normalize(this.target.sub(this.pos));
        const focalXAxis = Vec3.normalize(Vec3.cross(v, this.up));
        const focalYAxis = Vec3.normalize(Vec3.cross(v, focalXAxis));
        const center = v.scale(imagePlane);
        const origin = center.sub(focalXAxis.scale(screenWidth * 0.5))
              .sub(focalYAxis.scale(screenHeight * 0.5));
        return Vec3.normalize(origin.add(focalXAxis.scale(coordX)).add(focalYAxis.scale(coordY)));
    }

    /**
     * Compute coordinates of p on screen space
     * @param {Vec3} p
     * @param {number} width
     * @param {number} height
     */
    computeCoordOnScreen(p, width, height) {
        const imagePlane = (height * 0.5) / Math.tan(this.fov * 0.5);
        const v = Vec3.normalize(this.target.sub(this.pos));
        const focalXAxis = Vec3.normalize(Vec3.cross(v, this.up));
        const focalYAxis = Vec3.normalize(Vec3.cross(v, focalXAxis));
        const center = v.scale(imagePlane);
        const origin = center.sub(focalXAxis.scale(width * 0.5))
              .sub(focalYAxis.scale(height * 0.5));

        const ray = Vec3.normalize(p.sub(this.pos));
        const t = this.distToScreen(this.pos.add(center), v, this.pos, ray);
        const screenP = this.pos.add(ray.scale(t));
        const pv = screenP.sub(this.pos.add(origin));
        return new Vec2(Vec3.dot(pv, focalXAxis),
                        Vec3.dot(pv, focalYAxis));
    }

    /**
     * Compute projected screen vector from given 3d space vector
     * @param {Vec3} orgPoint
     * @param {Vec3} dir
     * @param {number} width
     * @param {number} height
     * @returns {Vec2}
     */
    computeVectorOnScreen(orgPoint, dir, width, height) {
        const imagePlane = (height * 0.5) / Math.tan(this.fov * 0.5);
        const v = Vec3.normalize(this.target.sub(this.pos));
        const focalXAxis = Vec3.normalize(Vec3.cross(v, this.up));
        const focalYAxis = Vec3.normalize(Vec3.cross(v, focalXAxis));
        const center = v.scale(imagePlane);
        const origin = center.sub(focalXAxis.scale(width * 0.5))
              .sub(focalYAxis.scale(height * 0.5));

        let ray = Vec3.normalize(orgPoint.sub(this.pos));
        let t = this.distToScreen(this.pos.add(center), v, this.pos, ray);
        let screenP = this.pos.add(ray.scale(t));
        let pv = screenP.sub(this.pos.add(origin));
        const p1 = new Vec2(Vec3.dot(pv, focalXAxis),
                            Vec3.dot(pv, focalYAxis));

        ray = Vec3.normalize(orgPoint.add(dir.scale(50)).sub(this.pos));
        t = this.distToScreen(this.pos.add(center), v, this.pos, ray);
        screenP = this.pos.add(ray.scale(t));
        pv = screenP.sub(this.pos.add(origin));
        const p2 = new Vec2(Vec3.dot(pv, focalXAxis),
                            Vec3.dot(pv, focalYAxis));
        return Vec2.normalize(p2.sub(p1));
    }

    computeXAxisDirOnScreen(orgPoint, width, height) {
        return this.computeVectorOnScreen(orgPoint, new Vec3(1, 0, 0), width, height);
    }

    computeYAxisDirOnScreen(orgPoint, width, height) {
        return this.computeVectorOnScreen(orgPoint, new Vec3(0, 1, 0), width, height);
    }

    computeZAxisDirOnScreen(orgPoint, width, height) {
        return this.computeVectorOnScreen(orgPoint, new Vec3(0, 0, 1), width, height);
    }

    /**
     * Cast ray from rayOrg and compute distance between screen and rayOrg
     * @param {Vec3} center
     * @param {Vec3} normal
     * @param {Vec3} rayOrg
     * @param {Vec3} rayDir
     * @returns {number}
     */
    distToScreen(center, normal,
                 rayOrg, rayDir) {
        const d = -Vec3.dot(center, normal);
        const v = Vec3.dot(normal, rayDir);
        return -(Vec3.dot(normal, rayOrg) + d) / v;
    }

    setUniformLocations(gl, uniLocations, program) {
        uniLocations.push(gl.getUniformLocation(program, 'u_camera.pos'));
        uniLocations.push(gl.getUniformLocation(program, 'u_camera.target'));
        uniLocations.push(gl.getUniformLocation(program, 'u_camera.fov'));
        uniLocations.push(gl.getUniformLocation(program, 'u_camera.up'));
    }

    setUniformValues(gl, uniLocations, uniI) {
        gl.uniform3f(uniLocations[uniI++],
                     this.pos.x, this.pos.y, this.pos.z);
        gl.uniform3f(uniLocations[uniI++],
                     this.target.x, this.target.y, this.target.z);
        gl.uniform1f(uniLocations[uniI++],
                     this.fov);
        gl.uniform3f(uniLocations[uniI++],
                     this.up.x, this.up.y, this.up.z);
        return uniI;
    }
}

export class CameraOnSphere extends Camera {
    /**
     *
     * @param {Vec3} target
     * @param {number} fov
     * @param {number} cameraDistance
     * @param {Vec3} up
     */
    constructor(target, fov, cameraDistance, up) {
        super(new Vec3(0, 0, 0), target, fov);
        this.prevTarget = target;
        this.target = target;
        this.fov = fov;
        this.cameraDistance = cameraDistance;
        this.up = up;
        this.theta = 0;
        this.phi = 0;

        this.prevThetaPhi = new Vec2(this.theta, this.phi);

        this.update();
    }

    /**
     * TODO: compute up vector using quaternion
     */
    update() {
        this.pos = new Vec3(this.cameraDistance * Math.cos(this.phi) * Math.cos(this.theta),
                            this.cameraDistance * Math.sin(this.phi),
                            -this.cameraDistance * Math.cos(this.phi) * Math.sin(this.theta));
        this.pos = this.target.add(this.pos);
        if (Math.abs(this.phi) % (2 * Math.PI) > Math.PI / 2 &&
            Math.abs(this.phi) % (2 * Math.PI) < 3 * Math.PI / 2) {
            this.up = new Vec3(0, -1, 0);
        } else {
            this.up = new Vec3(0, 1, 0);
        }
    }
}
