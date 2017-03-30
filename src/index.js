import assert from 'power-assert';
import Canvas2D from './Canvas2d';

window.addEventListener('load', () => {
    const canvas2d = new Canvas2D('canvas');
    canvas2d.render();

});
