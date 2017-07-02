import assert from 'power-assert';

export function getWebGL2Context(canvas) {
    const gl = canvas.getContext('webgl2');
    assert.ok(gl);
    return gl;
}

export function createStaticVbo(gl, data) {
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}

const SQUARE = [
    -1, -1,
    -1, 1,
    1, -1,
    1, 1,
];

export function createSquareVbo(gl) {
    return createStaticVbo(gl, SQUARE);
}

export function linkProgram(gl, program) {
    gl.linkProgram(program);
    assert.ok(gl.getProgramParameter(program, gl.LINK_STATUS),
              'Link Program Error');
    gl.useProgram(program);
}

export function attachShader(gl, shaderStr, program, shaderType) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);
    assert.ok(gl.getShaderParameter(shader, gl.COMPILE_STATUS),
             `Shader Compilation Error\n${gl.getShaderInfoLog(shader)}`);
    gl.attachShader(program, shader);
}

export function createRGBTexture2D(gl, width, height,
                                   internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height,
                  0, gl.RGB, type, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

export function createRGBTextures(gl, width, height, num) {
    const textures = [];
    for (let i = 0; i < num; i++) {
        textures.push(createRGBTexture2D(gl, width, height,
                                         gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, num));
    }
    return textures;
}

export function createRGBATexture2D(gl, width, height,
                                    internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height,
                  0, gl.RGBA, type, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

export function createRGBATextures(gl, width, height, num) {
    const textures = [];
    for (let i = 0; i < num; i++) {
        textures.push(createRGBTexture2D(gl, width, height,
                                         gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, num));
    }
    return textures;
}
