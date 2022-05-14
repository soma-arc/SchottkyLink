const PI_2 = Math.PI / 2;
const PI_3 = Math.PI / 3;
const TWO_PI_3 = Math.PI / 3;
const PI_4 = Math.PI / 4;
const THREE_PI_4 = 3 * Math.PI / 4;
const PI_6 = Math.PI / 6;

export default class Radians {
    /**
     *
     * @param {Number} degrees
     * @returns {Number}
     */
    static DegToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     *
     * @param {Number} radians
     * @returns {Number}
     */
    static RadToDeg(radians) {
        return radians * 180 / Math.PI;
    }

    static get PI() {
        return Math.PI;
    }

    static get PI_2() {
        return PI_2;
    }

    static get PI_3() {
        return PI_3;
    }

    static get TWO_PI_3() {
        return TWO_PI_3;
    }

    static get PI_4() {
        return PI_4;
    }

    static get THREE_PI_4() {
        return THREE_PI_4;
    }

    static get PI_6() {
        return PI_6;
    }
}
