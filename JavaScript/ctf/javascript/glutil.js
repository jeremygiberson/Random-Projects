var glUtil = new (function(){
    var self = this;
    /**
     * Loads a shader.
     * @param {!WebGLContext} gl The WebGLContext to use.
     * @param {string} shaderSource The shader source.
     * @param {number} shaderType The type of shader.
     * @param {function(string): void) opt_errorCallback callback for errors.
        * @return {!WebGLShader} The created shader.
     */
    var loadShader = function(gl, shaderSource, shaderType, opt_errorCallback) {
        // Create the shader object
        var shader = gl.createShader(shaderType);

        // Load the shader source
        gl.shaderSource(shader, shaderSource);

        // Compile the shader
        gl.compileShader(shader);

        // Check the compile status
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            // Something went wrong during compilation; get the error
            lastError = gl.getShaderInfoLog(shader);
            console.log("*** Error compiling shader '" + shader + "':" + lastError);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * Creates a program, attaches shaders, binds attrib locations, links the
     * program and calls useProgram.
     * @param {!Array.<!WebGLShader>} shaders The shaders to attach
     * @param {!Array.<string>} opt_attribs The attribs names.
     * @param {!Array.<number>} opt_locations The locations for the attribs.
     */
    var loadProgram = function(gl, shaders, opt_attribs, opt_locations) {
        var program = gl.createProgram();
        for (var ii = 0; ii < shaders.length; ++ii) {
            gl.attachShader(program, shaders[ii]);
        }
        if (opt_attribs) {
            for (var ii = 0; ii < opt_attribs.length; ++ii) {
                gl.bindAttribLocation(
                    program,
                    opt_locations ? opt_locations[ii] : ii,
                    opt_attribs[ii]);
            }
        }
        gl.linkProgram(program);

        // Check the link status
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            lastError = gl.getProgramInfoLog (program);
            console.log("Error in program linking:" + lastError);

            gl.deleteProgram(program);
            return null;
        }
        return program;
    };

    /**
     * Loads a shader from a script tag.
     * @param {!WebGLContext} gl The WebGLContext to use.
     * @param {string} scriptId The id of the script tag.
     * @param {number} opt_shaderType The type of shader. If not passed in it will
     *     be derived from the type of the script tag.
     * @param {function(string): void) opt_errorCallback callback for errors.
        * @return {!WebGLShader} The created shader.
     */
    var createShaderFromScript = function(
        gl, scriptId, opt_shaderType, opt_errorCallback) {
        var shaderSource = "";
        var shaderType;
        var shaderScript = document.getElementById(scriptId);
        if (!shaderScript) {
            throw("*** Error: unknown script element" + scriptId);
        }
        shaderSource = shaderScript.text;

        if (!opt_shaderType) {
            if (shaderScript.type == "x-shader/x-vertex") {
                shaderType = gl.VERTEX_SHADER;
            } else if (shaderScript.type == "x-shader/x-fragment") {
                shaderType = gl.FRAGMENT_SHADER;
            } else if (shaderType != gl.VERTEX_SHADER && shaderType != gl.FRAGMENT_SHADER) {
                throw("*** Error: unknown shader type");
                return null;
            }
        }

        return loadShader(
            gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
            opt_errorCallback);
    };

    function createAndSetupTexture(gl) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set up texture so we can render any size image and so we are
        // working with pixels.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return texture;
    };

    function createTextureFromImage(gl, image) {
        var texture = self.createAndSetupTexture(gl);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        return texture;
    }


    var hex2rgb = function(hex){
        var cmp = hex.replace('#', '').split('');
        var r = parseInt('' + cmp[0] + cmp[1], 16)/255;
        var g = parseInt('' + cmp[2] + cmp[3], 16)/255;
        var b = parseInt('' + cmp[4] + cmp[5], 16)/255;
        var a = cmp.length > 6 ? parseInt('' + cmp[6] + cmp[7], 16)/255 : 1;
        return {'r': r, 'g': g, 'b': b, 'a': a};
    };

    var random = function(min, max) {
        return Math.floor(Math.random()*((max-min)+1)) + min;
    };

    /* export functions */
    this.createProgram = loadProgram;
    this.createShaderFromScriptElement = createShaderFromScript;
    this.createAndSetupTexture = createAndSetupTexture;
    this.createTextureFromImage = createTextureFromImage;
    this.hex2rgb = hex2rgb;
    this.random = random;
})();