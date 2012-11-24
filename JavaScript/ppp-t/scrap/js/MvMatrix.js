var MvMatrix = new  (function(){
    var orthoMatrix = new Array(16);
    var stack = [];
    var matrix = Matrix.I(4);

    this.init = function(t, r, b, l, n, f) { 
        orthoMatrix = [
            2/GLES20.viewportWidth, 0, 0, 0,
            0, -2/GLES20.viewportHeight, 0, 0,
            0, 0, 0, 0,
            -1, 1, 0, 1
        ];
        
        
        var rl = (r - l);
        var tb = (t - b);
        var fn = (f - n);
        orthoMatrix[0] = 2 / rl;
        orthoMatrix[1] = 0;
        orthoMatrix[2] = 0;
        orthoMatrix[3] = 0;
        orthoMatrix[4] = 0;
        orthoMatrix[5] = 2 / tb;
        orthoMatrix[6] = 0;
        orthoMatrix[7] = 0;
        orthoMatrix[8] = 0;
        orthoMatrix[9] = 0;
        orthoMatrix[10] = -2 / fn;
        orthoMatrix[11] = 0;
        orthoMatrix[12] = -(l + r) / rl;
        orthoMatrix[13] = -(t + b) / tb;
        orthoMatrix[14] = -(f + n) / fn;
        orthoMatrix[15] = 1;
    };

    this.reset = function() { stack = []; matrix = Matrix.I(4); }

    this.push = function() {
        stack.push(matrix.dup());
    };

    this.pop = function() {
        if(stack.length == 0)
            throw "MvMatrix Stack underflow";
        matrix = stack.pop();
    };

    this.loadIdentity = function() {
        matrix = Matrix.I(4);
    };

    this.translate = function(x, y) {
        var m = Matrix.I(4);
        m.elements[0][3] = x;
        m.elements[1][3] = y;
        matrix = matrix.multiply(m);
    };

    this.rotate = function(theta) {
        var m = Matrix.I(4);
        m.elements[0][0] = Math.cos(theta);
        m.elements[0][1] = -Math.sin(theta);

        m.elements[1][0] = Math.sin(theta);
        m.elements[1][1] = Math.cos(theta);
        matrix = matrix.multiply(m);
    };

    this.scale = function(sx, sy) {
        var m = Matrix.I(4);
        m.elements[0][0] = sx;
        m.elements[1][1] = sy;
        matrix = matrix.multiply(m);
    };

    this.updateShader = function() {
        // pass matrices uniform to shader
        GLES20.uniformMatrix4fv(ShaderManager.getUniformLocation(ShaderManager.getActiveProgram(), 'uOrthoMatrix'), false, orthoMatrix);        
        GLES20.uniformMatrix4fv(ShaderManager.getUniformLocation(ShaderManager.getActiveProgram(), 'uTransformMatrix'), false, matrix.toArray());
    };

    this.getMatrix = function() { return matrix; }

})();