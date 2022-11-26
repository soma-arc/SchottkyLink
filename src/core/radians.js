const PI_2 = Math.PI / 2;
const PI_3 = Math.PI / 3;
const TWO_PI_3 = 2 * Math.PI / 3;
const PI_4 = Math.PI / 4;
const THREE_PI_4 = 3 * Math.PI / 4;
const PI_6 = Math.PI / 6;
const PI_12 = Math.PI / 12;
const FIVE_PI_12 = 5 * Math.PI / 12;
const SEVEN_PI_12 = 7 * Math.PI / 12;
const FIVE_PI_6 = 5 * Math.PI / 6;
const ELEVEN_PI_12 = 11 * Math.PI / 12;

/**
 * @module Radians
 */
export default class Radians {
    /**
     */
    constructor() {}
    /**
     * Convert angles in degrees into angles in radians.
     * @param {Number} degrees
     * @returns {Number}
     */
    static DegToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Convert radians in degrees into angles in degrees.
     * @param {Number} radians
     * @returns {Number}
     */
    static RadToDeg(radians) {
        return radians * 180 / Math.PI;
    }

    /**
     * Returns PI.
     * @returns {Number}
     */
    static get PI() {
        return Math.PI;
    }
    /**
     * Returns  PI / 2.
     * @returns {Number}
     */
    static get PI_2() {
        return PI_2;
    }
    /**
     * Returns PI / 3.
     * @returns {Number}
     */
    static get PI_3() {
        return PI_3;
    }
    /**
     * Returns 2 * PI / 3.
     * @returns {Number}
     */
    static get TWO_PI_3() {
        return TWO_PI_3;
    }
    /**
     * Returns PI / 4.
     * @returns {Number}
     */
    static get PI_4() {
        return PI_4;
    }

    /**
     * Returns 3 * PI / 4.
     * @returns {Number}
     */
    static get THREE_PI_4() {
        return THREE_PI_4;
    }

    /**
     * Returns PI / 6.
     * @returns {Number}
     */
    static get PI_6() {
        return PI_6;
    }

    /**
     * Returns PI / 12.
     * @returns {Number}
     */    
    static get PI_12 () {
        return PI_12;
    }
    /**
     * Returns 5 * PI / 12.
     * @returns {Number}
     */
    static get FIVE_PI_12 () {
        return FIVE_PI_12;
    }
    /**
     * Returns 5 * PI / 6.
     * @returns {Number}
     */
    static get FIVE_PI_6 () {
        return FIVE_PI_6;
    }
    /**
     * Returns 7 * PI / 12.
     * @returns {Number}
     */
    static get SEVEN_PI_12 () {
        return SEVEN_PI_12;
    }
    /**
     * Returns 11 * PI / 12.
     * @returns {Number}
     */
    static get ELEVEN_PI_12 () {
        return ELEVEN_PI_12;
    }
}
