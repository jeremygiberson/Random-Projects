var TimeManager = new (function(){
    var fps = 0;
    var frames = 0;
    var now = (new Date()).getTime();
    var lastUpdate = now;
    var lastReport = now;
    var lastTime = 0;
    var frameTime = 0;

    this.update = function() {
        frames++;
        now = (new Date()).getTime();
        if(now - lastUpdate > 1000)
        {
            fps = frames;
            frames = 0;
            lastUpdate = now;
        }
        if(now - lastReport > 10000)
        {
            console.log("FPS: " + fps);
            lastReport = now;
        }
        // keep track of time between update frames
        frameTime = now - lastTime;
        lastTime = now;
    };

    this.getFps = function() { return fps; };
    
    // scale value to pixels per second (or value per second) 
    // based on immediate frames per second
    this.scale = function(value) {
        var iFps = 1000 / frameTime;
        return value * (1/iFps);
    };
})();