function Stroke(){
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
        var sy = this.start.y - this.centroid.y;
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

// user input class records strokes 
function StrokeReader() {
    // active stroke 
    this.stroke = null;
    // points on the stroke
    this.strokePoints = [];
    // strokes for the character
    this.charStrokes = [];

    // return stroke collection
    this.getStrokes = function() {
        return this.charStrokes;
    };


};

// process canvas mouse down events
// begin stroke by initializing new instance and
// setting start coordinates. Add start point to
// our path point list
StrokeReader.prototype.mouseDown = function(e) { 
    this.stroke = new Stroke();
    this.stroke.start(e.offsetX, e.offsetY);
    this.strokePoints.push({'x': e.offsetX, 'y': e.offsetY});        
};

// process canvas mouse up events    
// end stroke and calculate centroid of path points.
// Add finalized stroke to our list of character strokes
// reset our path points list
StrokeReader.prototype.mouseUp = function(e) { 
    if(this.stroke === null)
        return;

    this.stroke.end(e.offsetX, e.offsetY);   

    // compute centroid of all the visited points
    var centroid = {'x':0, 'y': 0};
    for(var i = 0; i < this.strokePoints.length; i++)
    {
        centroid.x += this.strokePoints[i].x;
        centroid.y += this.strokePoints[i].y;
    };    
    centroid.x /= this.strokePoints.length;
    centroid.y /= this.strokePoints.length;
    this.stroke.center(centroid.x, centroid.y);

    // add this stroke to list of character strokes
    this.charStrokes.push(this.stroke.normalize());

    // clear out stroke holder
    this.stroke = null;
    this.strokePoints = [];
};
    
// process canvas mouse move events
// if stroking, add current point to our path point list
// and render the portion of the stroke on the canvas.
StrokeReader.prototype.mouseMove = function(e) {
    // if stroke is not defined, we are not stroking
    if(this.stroke === null)
        return;
    // keep track of all the points we stroked through
    this.strokePoints.push({'x': e.offsetX, 'y': e.offsetY});
    // render stroke on canvas
    ctx.beginPath();
    ctx.moveTo(this.strokePoints[this.strokePoints.length-2].x, this.strokePoints[this.strokePoints.length-2].y);
    ctx.lineTo(this.strokePoints[this.strokePoints.length-1].x, this.strokePoints[this.strokePoints.length-1].y);
    ctx.stroke();
};

// bind the input from canvas into this instance
StrokeReader.prototype.bind = function(canvas) {
    var self = this;
    canvas.onmousedown = function(e) { self.mouseDown(e); };
    canvas.onmouseup = function(e) { self.mouseUp(e); };
    canvas.onmousemove = function(e) { self.mouseMove(e); };
};  


// Training wrapper class for stroke reader
var Trainer = function() {
    // super constructor
    StrokeReader.call(this);
};
// inheritance stuff
Trainer.prototype = new StrokeReader();
Trainer.prototype.constructor = Trainer;
// get the json data for this trainer
Trainer.prototype.data = function() {
    return JSON.stringify(this.getStrokes());
};


// Recognition wrapper class for stroke reader
function Recognizer () {
    // super constructor
    StrokeReader.call(this);
    // symbol ranking
    this.symbolRanking = null;
    var self = this;
};    

// inheritance stuff
Recognizer.prototype = new StrokeReader();
Recognizer.prototype.constructor = Recognizer;
Recognizer.prototype.getSuggestion = function() {
    if(this.symbolRanking == null)
        return null;
    return this.symbolRanking.ranking[0];
};
Recognizer.prototype.mouseUp = function(e) {
    StrokeReader.prototype.mouseUp.call(this, e);
    this.symbolRanking = new SymbolRank(this.getStrokes());
    var bm = this.getSuggestion();
    console.log('Best match: ' + bm.romaji + ', ' + bm.rank);
    document.getElementById('guess').innerHTML = bm.romaji + '?';
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    for(var i = 0; i < trainingData[bm.romaji].length; i++)
    {
        ctx.moveTo(trainingData[bm.romaji][i].start.x * 1000,
                   trainingData[bm.romaji][i].start.y * 1000);
        ctx.lineTo(trainingData[bm.romaji][i].end.x * 1000,
                   trainingData[bm.romaji][i].end.y * 1000);
    }
    ctx.stroke();
    ctx.restore();
};



function SymbolRank(strokeList) {
    var strokes = strokeList;
    this.ranking = [];
    
    // return sum of points as a point
    this.pointSum = function(pt1, pt2) {
        return {'x': pt1.x+pt2.x, 'y': pt1.y+pt2.y};
    };
    // return scaled point
    this.pointScale = function(pt, scale) {
        return {'x': pt.x *scale, 'y': pt.y*scale};
    };
    // return distance between points
    this.pointDist = function(pt1, pt2) {
        return Math.sqrt((pt1.x-pt2.x)*(pt1.x-pt2.x)+(pt1.y-pt2.y)*(pt1.y-pt2.y));
    };
    // return distance between stroke points
    this.strokeDist = function(stroke1, stroke2) {
     return this.pointDist(stroke1.start, stroke2.start) + this.pointDist(stroke1.end, stroke2.end);
    };
    // sort callback to order rankings
    this.sortfunc = function(a,b) {
        return a.rank-b.rank;
    };    
    
    // compare strokes against training set
    for(var i in trainingData) {
        // if character is fewer strokes than provided it can't match
        if(trainingData[i].length < strokes.length)
            continue;
           
        var sum = 0;   
        for(var j = 0; j < strokes.length; j++)    
            sum += this.strokeDist(strokes[j], trainingData[i][j]);
        // add stroke diff as an offset
        sum += trainingData[i].length - strokes.length;
        this.ranking.push({'romaji': i, 'rank': sum});
    }
    // ascend the rankings
    this.ranking = this.ranking.sort(this.sortfunc);
};