// collection of vertex/uv data to draw all in one drawElements call
// the collection is an unbounded array that grows to accomodate total
// number of quads asked to be drawn between calls to reset. That data is never
// un allocated. Instead the numQuads counter is used to render only used data
var QuadBatch = function(){
    this.texture = TextureManager.getActiveTexture();
    var vertices = [];
    var uvs = [];
    var colors = [];
    var numQuads = 0;
    var indices = [];
    
    var vertexBuffer = GLES20.createBuffer();
    vertexBuffer.itemSize = 3;
    var uvBuffer = GLES20.createBuffer();
    uvBuffer.itemSize = 2;
    var colorBuffer = GLES20.createBuffer();
    colorBuffer.itemSize = 4;
    var indexBuffer = GLES20.createBuffer();
    

    this.shaderProgram = ShaderManager.getActiveProgram();

    // reset (empty) vertex/uv data
    this.reset = function() {
        numQuads = 0;
    };

    // adds the quad's vertex/uv data to our vertex/uv data array
    // and increments numQuads count.
    this.addQuad = function(quad, transform) {
        // first, update the vertex position by transforming based on current TransformMatrix stack
        var pv = quad.pv;
        var pi = quad.pi;
        var tv = [];
        
        if(transform != undefined && transform == true)
        {
            var m = MvMatrix.getMatrix();
            for(var i = 0; i < 12; i+=3)
            {
                var v = $V([pv[i], pv[i+1], pv[i+2], 1]);
                var r = m.multiply(v);
                tv.push(r.e(1));
                tv.push(r.e(2));
                tv.push(r.e(3));
            }
            pv = tv;
        }
        

        var vi = numQuads * 12; // vertex offset
        var ti = numQuads * 8; // uv offset
        var ci = numQuads * 16; // color offset
        var ii = numQuads * 6; // indices offset
        // copy vertice data
        vertices[vi] = pv[0];
        vertices[vi+1] = pv[1];
        vertices[vi+2] = pv[2];
        vertices[vi+3] = pv[3];
        vertices[vi+4] = pv[4];
        vertices[vi+5] = pv[5];
        vertices[vi+6] = pv[6];
        vertices[vi+7] = pv[7];
        vertices[vi+8] = pv[8];
        vertices[vi+9] = pv[9];
        vertices[vi+10] = pv[10];
        vertices[vi+11] = pv[11];
        // copy indices
        var io =  numQuads * 4;
        indices[ii] =   io + pi[0];
        indices[ii+1] = io + pi[1];
        indices[ii+2] = io + pi[2];
        indices[ii+3] = io + pi[3];
        indices[ii+4] = io + pi[4];
        indices[ii+5] = io + pi[5];
        
        // copy uv data
        uvs[ti] = quad.pt[0];
        uvs[ti+1] = quad.pt[1];
        uvs[ti+2] = quad.pt[2];
        uvs[ti+3] = quad.pt[3];
        uvs[ti+4] = quad.pt[4];
        uvs[ti+5] = quad.pt[5];
        uvs[ti+6] = quad.pt[6];
        uvs[ti+7] = quad.pt[7];
        // copy color data
        colors[ci] = quad.pc[0];
        colors[ci+1] = quad.pc[1];
        colors[ci+2] = quad.pc[2];
        colors[ci+3] = quad.pc[3];
        colors[ci+4] = quad.pc[4];
        colors[ci+5] = quad.pc[5];
        colors[ci+6] = quad.pc[6];
        colors[ci+7] = quad.pc[7];
        colors[ci+8] = quad.pc[8];
        colors[ci+9] = quad.pc[9];
        colors[ci+10] = quad.pc[10];
        colors[ci+11] = quad.pc[11];
        colors[ci+12] = quad.pc[12];
        colors[ci+13] = quad.pc[13];
        colors[ci+14] = quad.pc[14];
        colors[ci+15] = quad.pc[15];

        // increment quad counter
        numQuads++;
    };
    
    this.setColor = function(ci, color) {
        var ci = ci * 16;
        for(var i = 0; i < 16; i+=4) {
            colors[ci] = color[0];
            colors[ci+1] = color[1];
            colors[ci+2] = color[2];
            colors[ci+3] = color[3];
            ci += 4;
        }    
    };

    // puts the vertex/uv data into gl buffers
    this.pushToGpu = function() {
        GLES20.bindBuffer(GLES20.ARRAY_BUFFER, vertexBuffer);
        GLES20.bufferData(GLES20.ARRAY_BUFFER, new Float32Array(vertices), GLES20.STATIC_DRAW);

        GLES20.bindBuffer(GLES20.ARRAY_BUFFER, uvBuffer);
        GLES20.bufferData(GLES20.ARRAY_BUFFER, new Float32Array(uvs), GLES20.STATIC_DRAW);

        GLES20.bindBuffer(GLES20.ARRAY_BUFFER, colorBuffer);
        GLES20.bufferData(GLES20.ARRAY_BUFFER, new Float32Array(colors), GLES20.STATIC_DRAW);
        
        GLES20.bindBuffer(GLES20.ELEMENT_ARRAY_BUFFER, indexBuffer);
        GLES20.bufferData(GLES20.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), GLES20.STATIC_DRAW);
       
    };

    this.render = function() {
        this.pushToGpu();

        ShaderManager.use(this.shaderProgram);
        MvMatrix.updateShader();
        TextureManager.use(this.texture);

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

        // only render numQuads elements
        GLES20.drawElements(GLES20.TRIANGLES, numQuads*6, GLES20.UNSIGNED_SHORT, 0);
    };
};