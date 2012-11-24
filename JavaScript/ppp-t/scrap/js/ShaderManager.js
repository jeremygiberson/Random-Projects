var ShaderManager = new (function()
{
    var programs = [];
    var activeShader;
    var uniforms = [];
    var attribs = [];


    this.getProgram = function(name) {
        return programs[name];
    };
    // gets a shader from a named script element
    var getShader = function (id) {
        var shaderScript = document.getElementById(id);
        if(!shaderScript)
            return null;
        // read content of script
        var str = '';
        var k = shaderScript.firstChild;
        while(k) {
            if(k.nodeType == 3)
                str += k.textContent;
            k = k.nextSibling;
        }

        // compile source based on script type
        var shader;
        if (shaderScript.type == "x-shader/x-fragment")
            shader = GLES20.createShader(GLES20.FRAGMENT_SHADER);
        else if (shaderScript.type == "x-shader/x-vertex")
            shader = GLES20.createShader(GLES20.VERTEX_SHADER);
        else
            return null;

        GLES20.shaderSource(shader, str);
        GLES20.compileShader(shader);
        if (!GLES20.getShaderParameter(shader, GLES20.COMPILE_STATUS)) {
            alert(GLES20.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    };

    // load shader from script element @id
    // and save it under @key
    this.load = function(key, vertexId, fragmentId) {
        var vertexShader = getShader(vertexId);
        var fragmentShader = getShader(fragmentId);
        // create a new program
        var program = GLES20.createProgram();
        GLES20.attachShader(program, vertexShader);
        GLES20.attachShader(program, fragmentShader);
        GLES20.linkProgram(program);
        console.log(program, vertexShader, fragmentShader);
        if(!GLES20.getProgramParameter(program, GLES20.LINK_STATUS)) {
            alert("Could not load shader " + key);
        }
        // save shader program
        programs[key] = program;
        uniforms[key] = [];
        attribs[key] = [];
        // set active shader
        this.use(key);
    };

    // activate specified shader program
    this.use = function(key) {
        GLES20.useProgram(programs[key]);
        activeShader = key;
    };

    // get an attribute pointer in the specified program
    this.getAttribPointer = function(key, name) {
        if(attribs[key][name] != undefined)
            return attribs[key][name];
        attribs[key][name] = GLES20.getAttribLocation(programs[key], name);
        return attribs[key][name];
    };

    this.hasAttribPointer = function(key, name) {
        if(attribs[key][name] != undefined)
            return true;
        if(GLES20.getAttribLocation(programs[key], name) > -1)
            return true;
        return false;
    };

    // get a uniform pointer in the specified program
    this.getUniformLocation = function(key, name) {
        if(uniforms[key][name] != undefined)
            return uniforms[key][name];
        uniforms[key][name] = GLES20.getUniformLocation(programs[key], name);
        return uniforms[key][name];
    };

    this.hasUniformLocation = function(key, name) {
        if(uniforms[key][name] != undefined)
            return true;
        if(GLES20.getUniformLocation(programs[key], name) > -1)
            return true;
        return false;
    };

    this.getActiveProgram = function() { return activeShader; };
})();