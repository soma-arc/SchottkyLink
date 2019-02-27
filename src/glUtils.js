import assert from 'power-assert';

export function GetWebGL2Context(canvas) {
    const gl = canvas.getContext('webgl2');
    assert.ok(gl);
    return gl;
}

export function CreateStaticVbo(gl, data) {
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

export function CreateSquareVbo(gl) {
    return CreateStaticVbo(gl, SQUARE);
}

export function LinkProgram(gl, program) {
    gl.linkProgram(program);
    assert.ok(gl.getProgramParameter(program, gl.LINK_STATUS),
              'Link Program Error');
    gl.useProgram(program);
}

export function AttachShader(gl, shaderStr, program, shaderType) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);
    assert.ok(gl.getShaderParameter(shader, gl.COMPILE_STATUS),
             `Shader Compilation Error\n${gl.getShaderInfoLog(shader)}`);
    gl.attachShader(program, shader);
}

export function CreateRGBTexture2D(gl, width, height,
                                   internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height,
                  0, gl.RGB, type, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

export function CreateRGBTextures(gl, width, height, num) {
    const textures = [];
    for (let i = 0; i < num; i++) {
        textures.push(CreateRGBTexture2D(gl, width, height,
                                         gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, num));
    }
    return textures;
}

export function CreateRGBATexture2D(gl, width, height,
                                    internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height,
                  0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

export function CreateRGBAImageTexture2D(gl, width, height, image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height,
                  0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

export function CreateRGBATextures(gl, width, height, num) {
    const textures = [];
    for (let i = 0; i < num; i++) {
        textures.push(CreateRGBATexture2D(gl, width, height,
                                          gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, num));
    }
    return textures;
}

export function CreateFloatTexture2D(gl, width, height,
                                     internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height,
                  0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}


export function CreateFloatTextures(gl, width, height, num) {
    const textures = [];
    for (let i = 0; i < num; i++) {
        textures.push(CreateFloatTexture2D(gl, width, height,
                                           gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, num));
    }
    return textures;
}
