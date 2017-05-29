import assert from 'power-assert';
import Canvas2D from './Canvas2d';
import { Scene } from './geometry.js';

const PRESET = require('./preset.json');

window.addEventListener('load', () => {
    const scene = new Scene();
    scene.load(PRESET);
    const canvas2d = new Canvas2D('canvas', scene);
    canvas2d.render();
});
