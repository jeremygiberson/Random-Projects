var Renderer = new (function(){
    var self = this;
    var paper;
    var cells;
    var barrels;
    var climbers;
    var scale = 40;
    var image;
    var colors = {
        boss: '#4262c7',
        player: '#ff5454',
        goal: '#d145c1',
        roller: '#ffb554',
        chaser: '#ffff54',
        beam: '#8c3fc0'
    };

    this.onInit = function(game){
        paper = Raphael(0, 0, 300, 300);
        cells = [];
        barrels = [];
        climbers = [];
        var imageScale = 40/8;
        var imageSize = 92 * imageScale;

        var stage = game.getStage();
        for(var i = 0; i < stage.length; i++) {
            var cell = stage[i];
            var rect = paper.rect(cell.x*scale, cell.y*scale, cell.width*scale, cell.height*scale);
            switch(true) {
                case (cell.type & game.cellTypes.up ? true:false):
                    rect.attr({'fill': '#0aa', 'stroke': '#aa0'});
                    break;
                default:
                    rect.attr({'fill': '#000', 'stroke': '#000'});
            }
            rect._cell = cell;
            cells.push(rect);
        }
    };

    this.onSpawnBarrel = function (barrel) {
        var x = (barrel.x + (barrel.width));
        var y = (barrel.y + (barrel.height));
        var r = (barrel.width/2);
        var circle = paper.circle(x*scale, y*scale, r*scale);
        circle.attr({'fill': colors.roller, 'stroke': colors.roller});
        circle._barrel = barrel;

        barrels.push(circle);
    };

    this.onDespawnBarrel = function(barrel) {
        var circle = barrels.shift();
        circle._barrel = null;
        circle.remove();
    };

    this.onSpawnClimber = function(climber) {
        var rect = paper.rect(climber.x*scale, climber.y*scale, climber.width*scale, climber.height*scale);
        rect.attr({'fill': colors.player, 'stroke': colors.player});
        rect._climber = climber;
        climbers.push(rect);
    };

    this.onThink = function(game) {
        for(var i = 0; i < barrels.length; i++) {
            var circle = barrels[i];
            var barrel = circle._barrel;
            // update visual
            var x = (barrel.x*scale) + ((barrel.width/2)*scale);
            var y = (barrel.y*scale) + ((barrel.height/2)*scale);
            circle.attr({cx: x, cy: y});
        }
        for(var i = 0; i < climbers.length; i++) {
            var rect = climbers[i];
            var climber = rect._climber;
            rect.attr({x: climber.x*scale, y: climber.y*scale});
        }
    };


    PubSub.subscribe('darkling.init', self.onInit);
    PubSub.subscribe('darkling.spawnBarrel', self.onSpawnBarrel);
    PubSub.subscribe('darkling.think', self.onThink);
    PubSub.subscribe('darkling.despawnBarrel', self.onDespawnBarrel);
    PubSub.subscribe('darkling.spawnClimber', self.onSpawnClimber);
})();
