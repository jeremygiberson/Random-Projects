var EditorState = function()
{
    // pan&zoom
    var size = { 'width': 64, 'height': 64 };
    var mode = 'pencil';
    var position = {'x': 0, 'y': 0};
    var pan = {'x': 0, 'y': 0};
    var scale = 1.0;
    var zoom = 0;
    var drag = null;
    
    // cursor
    var ssAssets = new SpriteSheet(2, 8);    
    var qCursor = new Quad(0, 0, 16, 16, 0.9);
    qCursor.texture = 'assets';
    qCursor.setColor([1,1,1,1]);
    qCursor.position = {'x': 0, 'y': 0};
    qCursor.setUvs(ssAssets.getUvsi(0));    
    
    // make relevant textures
    var cvs = document.createElement('canvas');
    var ctx = cvs.getContext('2d');
    cvs.setAttribute('width',1);
    cvs.setAttribute('height',1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1, 1);
    
    TextureManager.loadFromCanvas('pixel', cvs);

    // make new palette
    var palette = new Palette(["69D2E7","A7DBD8","E0E4CC","F38630","FA6900"]);
    
    // canvas quad
    var qCanvas = new Quad(0, 0, size.width, size.height, 0);
    qCanvas.setColor([1,1,1,1]);
    qCanvas.texture = 'pixel';
    qCanvas.setUvs([0, 1, 0, 0, 1, 0, 1, 1]);    
    
    // canvas pixels
    var qPixels = new QuadBatch();
    qPixels.texture = 'pixel';
    
    for(var y = 0; y < size.height; y++) {
        for(var x = 0; x < size.width; x++) {
            var qPixel = new Quad(x, y, 1, 1, 0.5);
            qPixel.setColor([1,1,1,0]);
            qPixel.texture = 'pixel';
            qPixel.setUvs([0, 1, 0, 0, 1, 0, 1, 1]);  
            qPixels.addQuad(qPixel);
        }    
    }
    
    this.localize = function(x, y) {
        // take global x,y coordinate and localiz it by inverting current transforms
        return {'x': Math.floor(((x-position.x)*(1/scale))), 
                'y': Math.floor(((y-position.y)*(1/scale)))};
    };
    
    // called when state is not active
    this.idle = function(){};

    // called when state is active
    this.run = function()
    {
        // update render space with pan&zoom
        MvMatrix.push();
        MvMatrix.translate(position.x + pan.x, position.y + pan.y);
        MvMatrix.scale(scale + zoom, scale + zoom);
        
        // render canvas
        //qCanvas.render();
        // render pixels
        qPixels.render();
        
        MvMatrix.pop();
        
        // render cursor
        MvMatrix.push();
        MvMatrix.translate(qCursor.position.x, qCursor.position.y);
        qCursor.render();
        MvMatrix.pop();
    };
    

    // called when state is made active
    this.onActive = function(){
    };
    
    // keyboard tools
    this.onKeyUp = function(e) {
        switch(e.keyCode) {
            case 72: // h
                mode = 'pan';
                qCursor.setUvs(ssAssets.getUvsi(0));
                break;
            case 80: // p
                mode = 'pencil';
                qCursor.setUvs(ssAssets.getUvsi(2));
                break;
            case 90: // z
                mode = 'zoom';
                qCursor.setUvs(ssAssets.getUvsi(5));
                break;
            default:
                console.log(e.keyCode);
        }
    };
    
    //
    this.onMouseClick = function(e) {
        var x = e.offsetX, y = e.offsetY;
        drag = null;        
        
        var l = this.localize(x,y);
        x = l.x;
        y = l.y;
        if(x >= 0 && x < size.width && y >= 0 && y < size.height) {
            var ci = (y * size.width) + x;
            console.log(ci);
            qPixels.setColor(ci, [1, 0, 0, 1]);
        }    
    };
    
    // begin drag
    this.onMouseDown = function(e) {
        var x = e.offsetX, y = e.offsetY;
        
        drag = {'start': {'x': x, 'y': y}, 'lastPosition': {'x': x, 'y': y}, 'end': null};
    };
    
    // drag
    this.onMouseMove = function(e) {
        var x = e.offsetX, y = e.offsetY;
        
        // reposition cursor
        qCursor.position.x = x;
        qCursor.position.y = y-16;
        
        if(drag) {
            if(mode == 'pan') {
                pan.x = x - drag.start.x;
                pan.y = y - drag.start.y;
            } else if(mode == 'zoom') {
                var yd = y - drag.start.y;
                var xd = Math.abs(x - drag.start.x) + 1;
                zoom = (yd/100) ;//* xd;
            } else if(mode == 'pencil') {
                var l = this.localize(x,y);
                x = l.x;
                y = l.y;
                if(x >= 0 && x < size.width && y >= 0 && y < size.height) {
                    var ci = y * size.height + x;
                    qPixels.setColor(ci, [1,1,1,1]);
                }    
            }
            
            // update last position
            drag.lastPosition = {'x': x, 'y': y};
        }
    };
    
    // end drag
    this.onMouseUp = function(e) {
        // end stuff
        if(drag) {
            if(mode == 'pan') {
                position.x += pan.x;
                position.y += pan.y;
                pan = {'x':0, 'y': 0};
            } else if(mode == 'zoom') {
                scale += zoom;
                zoom = 0;
            }    
            
            drag = null;
        }    
    };
    


};