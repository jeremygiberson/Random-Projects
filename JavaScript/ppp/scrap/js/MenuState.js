var MenuState = function()
{
    this.playState = 'editor'; // can be overridden

    /** title element **/
    var title = 'PPP';
    var taTitle = new TextArea(title.length, 1, 64);
    taTitle.text = title;
    taTitle.position.x = GLES20.viewportWidth/2 - taTitle.getWidth()/2;
    taTitle.position.y = GLES20.viewportHeight/2 - taTitle.getHeight()/2 - 96;
    taTitle.quad.shaderProgram = 'textured';
    taTitle.quad.texture = 'font';
    taTitle.quad.setColor([1, 1, 1, 1]);
    
    // called when state is not active
    this.idle = function(){};

    // called when state is active
    this.run = function()
    {
        // render title element
        taTitle.render();
    };

    // called when state is made active
    this.onActive = function(){};
    
    this.onMouseClick = function(e) {
        var x = e.offsetX, y = e.offsetY;
        GameEngine.useState(this.playState);
    };
};