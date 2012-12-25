var SpriteShader = {
    vertices: [],
    uvs: [],
    texture: null,
    vertexShader:null,
    fragmentShader:null,
    program: null,
    resolutionLocation:null,
    textureSizeLocation:null,
    positionLocation: null,
    textureLocation: null,
    vertexBuffer: null,
    textureBuffer: null,
    resolution: {width: 320, height: 240},
    // init shader program & pointers
    init: function(gl) {
        // build program
        this.vertexShader = glUtil.createShaderFromScriptElement(gl, 'SpriteShader-vertex');
        this.fragmentShader = glUtil.createShaderFromScriptElement(gl, 'SpriteShader-fragment');
        this.program = glUtil.createProgram(gl, [this.vertexShader, this.fragmentShader]);
        // use program to get pointers
        gl.useProgram(this.program);
        this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
        this.textureLocation = gl.getAttribLocation(this.program, 'a_texCoord');
        this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution');
        this.textureSizeLocation = gl.getUniformLocation(this.program, 'u_texSize');
        // create buffers
        this.vertexBuffer = gl.createBuffer();
        this.textureBuffer = gl.createBuffer();
    },
    setResolution: function (width, height) {
        this.resolution = {'width': width, 'height': height};
    },
    setTexture: function (texture) {
        this.texture = texture;
    },
    // add vertex & uv information for sprite (to be bulk rendered later)
    sprite: function(x, y, w, h, u, v, s, t) {
        var x1 = x, x2 = x+ w, y1 = y, y2 = y+h;
        // add tri verts
        this.vertices.push(x1, y1,// top left
                           x2, y1,// top right
                           x1, y2,// bottom left
                           x1, y2,// bottom left
                           x2, y1,// top right
                           x2, y2);// bottom right
        // add tri uvs
        this.uvs.push(u, v,// top left
                      s, v,// top right
                      u, t,// bottom left
                      u, t,// bottom left
                      s, u,// top right
                      s, t);// bottom right
    },
    // bulk render all tris w/ uv coords
    render: function(gl) {
        var count = this.vertices.length/2;
        var width = this.resolution.width;
        var height = this.resolution.height;
        var texWidth = this.texture._width;
        var texHeight = this.texture._height;
        // use program
        gl.useProgram(this.program);
        // pass vertices into program
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        // pass uvs into program
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.uvs), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.textureLocation);
        gl.vertexAttribPointer(this.textureLocation, 2, gl.FLOAT, false, 0, 0);
        // specify screen resolution
        gl.uniform2f(this.resolutionLocation, width, height);
        // specify texture size
        gl.uniform2f(this.textureSizeLocation, texWidth, texHeight);
        // bind texture
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // render the triangles to buffer
        gl.drawArrays(gl.TRIANGLES, 0, count);
    }
};
