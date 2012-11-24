function Palette(colors) {
    // original source colors
    this.baseColors = colors;
    // computed colors
    this.colors = [];
    
    this.computeColors = function() {
        var cvs = document.createElement('canvas');
        var ctx = cvs.getContext('2d');
        var swatches = 10; // 5 whites, 5 blacks
        // total colors we'll create
        var total = this.baseColors.length * swatches;
        // expand canvas to fit our palette
        cvs.width = total;
        cvs.height = 1;
        // paint our base colors
        for(var i = 0; i < this.baseColors.length; i++) {
            ctx.fillStyle = '#' + this.baseColors[i];
            ctx.fillRect(i * swatches, 0, swatches, 1);
            // paint our blacks & whites
            // 100% black --> 0% black, 0% white  --> 100% white
            for(var p = 5; p >= 0; p--) {
                var alpha = p/5;
                // black
                ctx.fillStyle = 'rgba(0,0,0,'+alpha+');';
                ctx.fillRect(i * swatches + (5-p), 0, 1, 1);
                // white
                ctx.fillStyle = 'rgba(255,255,255,'+alpha+');';
                ctx.fillRect(i * swatches + (10-p), 0, 1, 1);                
            };
        };
        
        var imageData = ctx.getImageData(0, 0, total, 1);
        for(var i = 0; i < total; i++) {
            var r = imageData.data[(i*4)];
            var g = imageData.data[(i*4)+1];
            var b = imageData.data[(i*4)+2];
            this.colors.push({'octet': {'r': r, 'g': g, 'b': b}, 'float': {'r': r/255, 'g': g/255, 'b': b/255}});
        };
        
        // place in palette window
        var w = document.getElementById('palette');
        for(var i in this.colors) {
            var c = this.colors[i].octet;
            var html = "<div class='color' style='background: rgba("+c.r+","+c.g+","+c.b+",1);'>&nbsp;</div>";
            console.log(html);
            w.innerHTML = w.innerHTML + html;
        };
    };    
    
    this.computeColors();
};