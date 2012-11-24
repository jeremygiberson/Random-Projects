var Quad = function(x,y, w, h, z)
{
    this.width = w;
    this.height = h;
    if(z == undefined)
        z = 0;
    
    var top = y;
    var bottom = y+h;
    var left = x;
    var right = x+w;
    var vertices = [
         left, bottom,  z,
         left, top, z,
         right, top, z,
         right, bottom, z
    ];
    // default mapping
    var uvs = [
        // left tri
        0, 1,
        0, 0,
        1, 0,
        1, 1
    ];
    // default colors
    var colors = [1, 0, 0, 1,
                  1, 0, 0, 1,
                  1, 0, 0, 1,
                  1, 0, 0, 1];
                  
    var indices = [0, 1, 2, 0, 2, 3];//1, 2, 3];              

    // used by quadbatch
    this.pv = vertices;
    this.pt = uvs;
    this.pc = colors;
    this.pi = indices;


    this.texture = null;
    this.shaderProgram = ShaderManager.getActiveProgram();

    var vertexBuffer = GLES20.createBuffer();
    GLES20.bindBuffer(GLES20.ARRAY_BUFFER, vertexBuffer);
    GLES20.bufferData(GLES20.ARRAY_BUFFER, new Float32Array(vertices), GLES20.STATIC_DRAW);
    vertexBuffer.itemSize = 3;
    vertexBuffer.numItems = 6;

    var uvBuffer = GLES20.createBuffer();
    GLES20.bindBuffer(GLES20.ARRAY_BUFFER, uvBuffer);
    GLES20.bufferData(GLES20.ARRAY_BUFFER, new Float32Array(uvs), GLES20.STATIC_DRAW);
    uvBuffer.itemSize = 2;
    uvBuffer.numItems = 6;

    var colorBuffer = GLES20.createBuffer();
    GLES20.bindBuffer(GLES20.ARRAY_BUFFER, colorBuffer);
    GLES20.bufferData(GLES20.ARRAY_BUFFER, new Float32Array(colors), GLES20.STATIC_DRAW);
    colorBuffer.itemSize = 4;
    colorBuffer.numItems = 6;
    
    var indexBuffer = GLES20.createBuffer();
    GLES20.bindBuffer(GLES20.ELEMENT_ARRAY_BUFFER, indexBuffer);
    GLES20.bufferData(GLES20.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GLES20.STATIC_DRAW);
    indexBuffer.itemSize = 1;
    indexBuffer.numItems = 6;

    this.setUvs = function(textureUvs) {
        uvs = textureUvs;
        this.pt = uvs;
        // reset buffer data
        GLES20.bindBuffer(GLES20.ARRAY_BUFFER, uvBuffer);
        GLES20.bufferData(GLES20.ARRAY_BUFFER, new Float32Array(uvs), GLES20.STATIC_DRAW);
    }

    this.setColor = function(color) {
        for(i = 0; i < 24; i+=4)
        {
            colors[i] = color[0];
            colors[i+1] = color[1];
            colors[i+2] = color[2];
            colors[i+3] = color[3];
        }
        this.ct = colors;
        GLES20.bindBuffer(GLES20.ARRAY_BUFFER, colorBuffer);
        GLES20.bufferData(GLES20.ARRAY_BUFFER, new Float32Array(colors), GLES20.STATIC_DRAW);
    };

    // render the quad
    this.render = function()
    {
        ShaderManager.use(this.shaderProgram);
        TextureManager.use(this.texture);
        MvMatrix.updateShader();

        GLES20.bindBuffer(GLES20.ARRAY_BUFFER, vertexBuffer);
        GLES20.vertexAttribPointer(ShaderManager.getAttribPointer(this.shaderProgram, 'aVertexPosition'), vertexBuffer.itemSize, GLES20.FLOAT, false, 0, 0);

        GLES20.bindBuffer(GLES20.ARRAY_BUFFER, colorBuffer);
        GLES20.vertexAttribPointer(ShaderManager.getAttribPointer(this.shaderProgram, 'aColor'), colorBuffer.itemSize, GLES20.FLOAT, false, 0, 0);
        
        GLES20.bindBuffer(GLES20.ELEMENT_ARRAY_BUFFER, indexBuffer);


        if(ShaderManager.hasUniformLocation(this.shaderProgram, 'uSampler')) {
            GLES20.uniform1i(ShaderManager.getUniformLocation(this.shaderProgram, 'uSampler'), 0);
        }

        if(ShaderManager.hasAttribPointer(this.shaderProgram, 'aTexturePosition')) {
            GLES20.bindBuffer(GLES20.ARRAY_BUFFER, uvBuffer);
            GLES20.vertexAttribPointer(ShaderManager.getAttribPointer(this.shaderProgram, 'aTexturePosition'), uvBuffer.itemSize, GLES20.FLOAT, false, 0, 0);
        }


        //GLES20.drawArrays(GLES20.TRIANGLES, 0, vertexBuffer.numItems);
        GLES20.drawElements(GLES20.TRIANGLES, indexBuffer.numItems, GLES20.UNSIGNED_SHORT, 0);

    };
};
