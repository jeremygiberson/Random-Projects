var Stroke = function() {
    this.start = null;
    this.centroid = null;
    this.end = null;
    // initialize stroke setting start xy tuple
    this.start = function(x,y) { this.start = {'x': x, 'y': y}; };
    // finalize stroke setting ending xy tuple    
    this.end = function(x,y) { this.end = {'x': x, 'y': y}; };
    // set centroid
    this.center = function(x,y) { this.centroid = {'x': x, 'y': y}; };
    // return a normalized stroke in a JSON structure
    this.normalize = function(){
        if(this.start === null || this.centroid === null || this.end === null)
            return {'start': {'x': 0, 'y': 0}, 'end': {'x': 0, 'y': 0}, 'centroid': {'x': 0, 'y': 0}};
            
        var sx = this.start.x - this.centroid.x;
        var sy = this.start.y - this.cendroid.y;
        var ex = this.end.x - this.centroid.x;
        var ey = this.end.y - this.centroid.y;
        var smag = sx*sx + sy*sy;
        var emag = ex*ex + ey*ey;
        sx /= smag;
        sy /= smag;
        ex /= emag;
        ey /= emag;
        return {'start': {'x': sx, 'y': sy}, 'end': {'x': ex, 'y': ey}, 'centroid': {'x': 0, 'y': 0}};
    };
};

var Trainer = function() {
    // active stroke 
    var stroke = null;
    // points on the stroke
    var strokePoints = [];
    // strokes for the character
    var charStrokes = [];

    // get the json data for this trainer
    this.data = function() {
        return JSON.stringify(charStrokes);
    };

    // event handlers
    //
    
    this.mouseDown = function(e) { 
        // start a new stroke
        stroke = new Stroke();
        stroke.start(e.offsetX, e.offsetY);
        // keep track of all the points we stroked through
        strokePoints.push({'x': e.offsetX, 'y': e.offsetY});        
    };
    
    this.mouseUp = function(e) { 
        // if stroke is not defined, we are not stroking
        if(stroke === null)
            return;
        // end of stroke    
        stroke.end(e.offsetX, e.offsetY);   
        // compute centroid of all the visited points
        var centroid = {'x':0, 'y': 0};
        for(var i = 0; i < strokePoints.length; i++)
        {
            centroid.x += strokePoints[i].x;
            centroid.y += strokePoints[i].y;
        };    
        stroke.center(centroid.x, centroid.y);
        // add this stroke to list of character strokes
        charStrokes.push(stroke);
        // clear out stroke holder
        stroke = null;
        strokePoints = [];
    };
    
    this.mouseMove = function(e) {
        // if stroke is not defined, we are not stroking
        if(stroke === null)
            return;
        // keep track of all the points we stroked through
        strokePoints.push({'x': e.offsetX, 'y': e.offsetY});
        // render stroke on canvas
        ctx.beginPath();
        ctx.moveTo(strokePoints[strokePoints.length-2].x, strokePoints[strokePoints.length-2].y);
        ctx.lineTo(strokePoints[strokePoints.length-1].x, strokePoints[strokePoints.length-1].y);
        ctx.stroke();
    };
};