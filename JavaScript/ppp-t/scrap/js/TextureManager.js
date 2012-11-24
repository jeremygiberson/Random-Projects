var TextureManager = new (function(){
    var textures = [];
    var activeTexture;

    this.load = function(key, path) {
        textures[key] = {'loaded': false, 'textureId': -1, 'image': new Image()};
        textures[key].image.onload = function(){ TextureManager.onloaded(key); };
        textures[key].image.src = path;
        console.log(textures);
    };
    
    this.loadFromCanvas = function(key, cvs) {
        textures[key] = {'loaded': false, 'textureId': -1, 'image': new Image()};
        textures[key].image.onload = function(){ TextureManager.onloaded(key); };
        textures[key].image.src = cvs.toDataURL("image/png");
        console.log(textures);
    };

    this.onloaded = function(key) {
        // enable textures
        var texture = GLES20.createTexture();
        GLES20.bindTexture(GLES20.TEXTURE_2D, texture);
        //GLES20.pixelStorei(GLES20.UNPACK_FLIP_Y_WEBGL, true);
        GLES20.texImage2D(GLES20.TEXTURE_2D, 0, GLES20.RGBA, GLES20.RGBA, GLES20.UNSIGNED_BYTE, this.getTextures()[key].image);
        GLES20.texParameteri ( GLES20.TEXTURE_2D, GLES20.TEXTURE_MIN_FILTER, GLES20.NEAREST);
        GLES20.texParameteri ( GLES20.TEXTURE_2D, GLES20.TEXTURE_MAG_FILTER, GLES20.NEAREST);
        GLES20.texParameteri ( GLES20.TEXTURE_2D, GLES20.TEXTURE_WRAP_S, GLES20.CLAMP_TO_EDGE );
        GLES20.texParameteri ( GLES20.TEXTURE_2D, GLES20.TEXTURE_WRAP_T, GLES20.CLAMP_TO_EDGE );

        textures[key].textureId = texture;
        textures[key].loaded = true;
        activeTexture = key;
    };

    this.register = function(key, texId) {
        textures[key] = { 'loaded': true, 'textureId': texId, 'image': null };
    };

    this.use = function(key) {
        //console.log(textures[key]);
        GLES20.bindTexture(GLES20.TEXTURE_2D, textures[key].textureId);
        activeTexture = key;
    };

    this.getActiveTexture = function() { return activeTexture; }

    this.isLoading = function() {
        for(var key in textures)
            if(textures[key].loaded == false)
                return true;
        return false;
    };

    this.getTextures = function() { return textures; };
})();