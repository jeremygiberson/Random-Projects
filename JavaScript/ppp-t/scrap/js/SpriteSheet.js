var SpriteSheet = function(cols, rows)
{
    this.rows = rows;
    this.cols = cols;
    var rratio = 1/this.rows;
    var cratio = 1/this.cols;
    
    this.getUvs = function(col, row, columns, rows, flipHoriz)
    {
        if(!columns) columns = 1;
        if(!rows) rows = 1;
        var left = col*cratio;
        var right = left + columns*cratio;
        var top = row*rratio;
        var bottom = top+rows*rratio;
        if(flipHoriz == true)
        {
            return [
                right,  bottom,
                right, top,
                left, top,
                left, bottom
            ];
        }
        return [
            left,  bottom,
            left, top,
            right, top,
            right, bottom
        ];
    }
    
    this.getUvsi = function(i, flipHoriz) {
        var r = Math.floor(i / this.cols);
        var c = i - (r * this.cols);
        return this.getUvs(c, r, 1, 1, flipHoriz);
    };

};