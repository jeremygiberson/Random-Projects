var GameEngine = new (function()
{
    var states = [];
    var activeState = null;

    /** Game Initiation **/
    this.init = function()
    {
        MvMatrix.init(0, GLES20.viewportWidth, GLES20.viewportHeight, 0, -2, 2);
        TextureManager.load('assets', 'images/assets.png');
        ShaderManager.load("textured", "vs", "fs");
        
        // bind events
        canvas.onmousemove = GameEngine.onMouseMove;
        canvas.onclick = GameEngine.onMouseClick;
        canvas.onmousedown = GameEngine.onMouseDown;
        canvas.onmouseup = GameEngine.onMouseUp;
        canvas.onkeyup = GameEngine.onKeyUp;
        canvas.onkeydown = GameEngine.onKeyDown;
    };

    this.resize = function() {
        MvMatrix.init(0, GLES20.viewportWidth, GLES20.viewportHeight, 0, -2, 2);
    };

    /** Game Loop **/
    this.main = function()
    {
        // Update Timer
        TimeManager.update();
        // Reset Mv Matrix
        MvMatrix.reset();
        // clear the screen
        GLES20.clear(GLES20.COLOR_BUFFER_BIT | GLES20.DEPTH_BUFFER_BIT);

        // until resources have finished loading, don't do anything
        if(TextureManager.isLoading()) // || OtherResources.isloading?
            return;

        // idle inactive states
        for(var i in states)
        {
            if(states[i] != activeState && states[i].idle != undefined)
                states[i].idle();
        }

        // run activate state
        if(activeState)
            activeState.run();

    };
    
    // pass mouse move events to gamestate handlers
    this.onMouseMove = function(e) { 
        if(activeState.onMouseMove != undefined)
            activeState.onMouseMove(e);
    };
    
    // pass mouse click events to gamestate handlers
    this.onMouseClick = function(e) { 
        if(activeState.onMouseClick != undefined)
            activeState.onMouseClick(e);
    };
    
    // pass mouse down events to gamestate handlers
    this.onMouseDown = function(e) {
        if(activeState.onMouseDown != undefined)
            activeState.onMouseDown(e);
    };
    
    // pass mouse up events to gamestate handlers
    this.onMouseUp = function(e) {
        if(activeState.onMouseUp != undefined)
            activeState.onMouseUp(e);
    };
    
    // pass key events to gamestate handlers
    this.onKeyDown = function(e) { 
        if(activeState.onKeyDown != undefined)
            activeState.onKeyDown(e);
    };
    
    // pass key events to gamestate handlers
    this.onKeyUp = function(e) {
        if(activeState.onKeyUp != undefined)
            activeState.onKeyUp(e);
    };
    
    // add state to callable state list
    this.addState = function(key, state) 
    {
        states[key] = state;
    };
    
    // set active game state, optionally calling activation handler
    this.useState = function(key) 
    {
        activeState = states[key];
        // if reset was passed, attempt to call reset on state
        if(activeState.onActive != undefined)
            activeState.onActive();
    };
    
    // used for debuggin
    this.getState = function(key) {
        return states[key];
    };
})();
