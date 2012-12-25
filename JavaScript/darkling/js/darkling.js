var darkling = new (function(){
    var self = this;
    var scale = 1;
    var barrelSize = 0.20;
    var climberSize = 0.25;
    this.cellTypes = {
        block: 1,
        left: 2,
        right: 4,
        despawn: 8,
        ladder: 16,
        goal: 32
    };
    this.climberStates = {jumping: 1};
    var stage;
    var ladders;
    var barrels;
    var climber;
    var barrelSpeed = {'x': 4, 'y': 6};
    var climberSpeed = {'x': 4, 'y': 4};
    var gravitySpeed = 6;
    var jump = {duration: 0.4, height: 0.75, time: 0};
    var controls = {horizontal: 0, vertical: 0, jump: 0, keys: {},
        leftKey: 65, rightKey: 68, upKey: 87, downKey: 83, jumpKey: 32};

    this.init = function() {
        // init control keys
        for(var i = 0; i < 255; i++)
            controls.keys[i] = false;

        // todo: read from pixel data
        var data = [[1,0,0,0,0,0,1],
                    [1,5,5,21,0,0,1],
                    [1,0,0,16,0,0,1],
                    [1,0,19,3,3,0,1],
                    [1,0,16,0,0,0,1],
                    [1,5,5,21,0,0,1],
                    [1,0,0,16,0,0,1],
                    [1,9,3,3,3,1,1]];

        // build cells
        stage = [];
        ladders = [];
        for(var row = 0; row < data.length; row++) {
            for(var col = 0; col < data[0].length; col++) {
                if(data[row][col] == 0)
                    continue;
                var cell = new this.Cell(col*scale, row*scale, scale, scale, data[row][col]);
                stage.push(cell);
                // keep track of ladders by themselves
                if(cell.type & self.cellTypes.ladder)
                    ladders.push(cell);
            }
        }

        // empty barrel container
        barrels = [];
        // empty climber container
        climbers = [];

        // publish init event
        PubSub.publish('darkling.init', self);

        self.spawnClimber();

        setInterval(self.spawnBarrel, 3000);
    };

    this.onKeyDown = function(e) {
        if([controls.leftKey, controls.rightKey, controls.upKey, controls.downKey, controls.jumpKey].indexOf(e.keyCode) !== -1)
        {
            controls.keys[e.keyCode] = true;
        } else {
            console.log(e.keyCode);
        }
    };

    this.onKeyUp = function(e) {
        if([controls.leftKey, controls.rightKey, controls.upKey, controls.downKey, controls.jumpKey].indexOf(e.keyCode) !== -1)
        {
            controls.keys[e.keyCode] = false;
        } else {
            console.log(e.keyCode);
        }
    };

    this.parseKeys = function() {
        controls.horizontal = 0;
        controls.horizontal += controls.keys[controls.leftKey] ? -1 : 0;
        controls.horizontal += controls.keys[controls.rightKey] ? 1 : 0;
        controls.vertical = 0;
        controls.vertical += controls.keys[controls.downKey] ? 1 : 0;
        controls.vertical += controls.keys[controls.upKey] ? -1 : 0;
        controls.jump = controls.keys[controls.jumpKey] ? 1 : 0;
    };

    this.spawnBarrel = function() {
        var x = 1 + barrelSize;
        var y = 1-barrelSize;
        var barrel = new self.Barrel(x*scale,y*scale, barrelSize*scale, barrelSize*scale);
        // create a new barrel
        barrels.push(barrel);

        PubSub.publish('darkling.spawnBarrel', barrel);
    };

    this.despawnBarrel = function() {
        var barrel = barrels.shift();
        PubSub.publish('darkling.despawnBarrel', barrel);
    };

    this.spawnClimber = function() {
        var x = 1 + climberSize;
        var y = 6.5;
        climber = new self.Climber(x*scale,y*scale, climberSize*scale, climberSize*scale);
        PubSub.publish('darkling.spawnClimber', climber);
    };

    this.getStage = function() {
        return stage;
    };

    this.think = function (deltaTime) {
        var despawnBarrelCount = 0;
        for(var i = 0; i < barrels.length; i++) {
            var barrel = barrels[i];
            var force = {x: {count: 0, sum: 0}, y: {count: 0, sum: 0}};
            var hitNonDespawnBlock = false;
            var despawnBarrel = false;
            for(var j = 0; j < stage.length; j++) {
                var cell = stage[j];
                if(self.isOverlap(barrel, cell)) {
                    switch(true) {
                        case (cell.type & self.cellTypes.right ? true:false):
                            hitNonDespawnBlock = true;
                            force.x.sum += barrelSpeed.x;
                            force.x.count++;
                            break;
                        case (cell.type & self.cellTypes.left ? true:false):
                            hitNonDespawnBlock = true;
                            force.x.sum -= barrelSpeed.x;
                            force.x.count++;
                            break;
                        case (cell.type & self.cellTypes.despawn ? true:false):
                            despawnBarrel = true;
                            break;
                        default:
                            hitNonDespawnBlock = true;
                    }
                    // fix y position overlap
                    if(cell.y > barrel.y) {
                        barrel.y = cell.y - barrel.height;
                    }
                }
            }
            if(despawnBarrel && !hitNonDespawnBlock) {
                despawnBarrelCount++;
            }
            // if no actors in x, apply force in y
            if(force.x.count == 0) {
                force.y.sum += barrelSpeed.y;
                force.y.count++;
            }
            // apply forces
            var fx = force.x.count != 0 ? force.x.sum / force.x.count : 0;
            var fy = force.y.count != 0 ? force.y.sum / force.y.count : 0;

            // note y positions will be fixed in overlap check
            // x position is anticipating there will never be
            // colliding with a side wall as it should hit a gap
            // and reverse direction before it occurs
            barrel.x += fx * deltaTime;
            barrel.y += fy * deltaTime;
        }

        // remove barrels that made it to bottom
        for(var i = 0; i < despawnBarrelCount; i++) {
            self.despawnBarrel();
        }

        self.parseKeys();
        //
        // determine if climber is jumping or starting a jump
        if(!(climber.state & self.climberStates.jumping)
            && self.isOverlappingA(climber, stage, self.cellTypes.block)
            && controls.jump)
        {
            // start jump
            climber.state |= self.climberStates.jumping;
            jump.time = 0;
            console.log('start jumping');
        } else if(climber.state & self.climberStates.jumping
            && self.isOverlappingA(climber, stage, self.cellTypes.block | self.cellTypes.ladder))
        {
            // end jump
            climber.state ^= self.climberStates.jumping;
            console.log('end jumping');
        }

        // move player
        var fx = climberSpeed.x * controls.horizontal;
        var dx = fx * deltaTime;
        var fy = 0;
        var dy = 0;
        var hasGravity = false;

        if(climber.state & self.climberStates.jumping) {
            var prevY = Math.sin(((jump.time/jump.duration)*Math.PI))*jump.height*scale;
            jump.time+=deltaTime;
            var nextY = Math.sin(((jump.time/jump.duration)*Math.PI))*jump.height*scale;
            if(jump.time > jump.duration) {
                // end jump
                climber.state ^= self.climberStates.jumping;
            }
            console.log(jump.time, jump.duration);
            fy = -(nextY - prevY);
            dy = fy; // deltaTime already included
        } else if(self.isOverlapping(climber, ladders)) {
            // apply climbing
            fy = (climberSpeed.y * controls.vertical);
            dy = fy * deltaTime;
        } else {
            // apply gravity
            fy = gravitySpeed;
            dy = fy * deltaTime;
            hasGravity = true;
        }

        // check collisions in x first
        climber.x += dx;
        for(var j = 0; j < stage.length; j++) {
            var cell = stage[j];
            if(self.isOverlap(climber, cell)) {
                if(cell.type & self.cellTypes.ladder)
                    continue;
                if(cell.type & self.cellTypes.block) {
                    // only correct x if we are not on the surface of block
                    if((climber.y+climber.height) - cell.y == 0 || (cell.y+cell.height)-climber.y == 0 ) {
                        continue;
                    }
                    var shiftLeft = (cell.x-climber.width) - climber.x;
                    var shiftRight = (cell.x+cell.width) - climber.x;
                    if(Math.abs(shiftLeft) <= Math.abs(shiftRight)) {
                        climber.x += shiftLeft;
                    } else {
                        climber.x += shiftRight;
                    }
                }
            }
        }
        // check collisions in y
        climber.y += dy;
        for(var j = 0; j < stage.length; j++) {
            var cell = stage[j];
            if(self.isOverlap(climber, cell)) {
                if(cell.type & self.cellTypes.ladder) {
                    // if we just got off a ladder or are falling on top of
                    // a ladder, dont allow gravity to sink us into the ladder
                    // come to a rest at the top of it
                    var distanceToTop = (climber.y+climber.height)-cell.y;
                    if(hasGravity && distanceToTop <= dy)
                    {
                        climber.y = cell.y - climber.height;
                    }
                    continue;
                }
                if(cell.type & self.cellTypes.block) {
                    // only correct y if we are not on the face of block
                    if((climber.x+climber.width) - cell.x == 0 || climber.x - (cell.x+cell.width) == 0) {
                        continue;
                    }
                    var shiftUp = (cell.y-climber.height) - climber.y;
                    var shiftDown = (cell.y+cell.height) - climber.y;
                    if(Math.abs(shiftUp) <= Math.abs(shiftDown)) {
                        climber.y += shiftUp;
                    } else {
                        climber.y += shiftDown;
                    }
                }
            }
        }
        PubSub.publish('darkling.think', self);
    };

    // test if two boxes overlap
    this.isOverlap = function(objA, objB) {
        if((objA.x <= objB.x+objB.width && objA.x+objA.width >= objB.x)
         && (objA.y <= objB.y+objB.height && objA.y+objA.height >= objB.y))
            return true;
        return false;
    };
    // check if an object overlaps anything in the list
    this.isOverlapping = function (objA, listB) {
        for(var i in listB) {
            if(self.isOverlap(objA, listB[i]))
                return true;
        }
        return false;
    };
    // check if an object overlaps a type in the list
    this.isOverlappingA = function (objA, listB, type) {
        for(var i in listB) {
            if(!(listB[i].type & type))
                continue;
            if(self.isOverlap(objA, listB[i]))
                return true;
        }
        return false;
    };

    this.Cell = function(x,y,w,h,t) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.type = t;
    };

    this.Barrel = function(x,y,w,h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    };
    
    this.Climber = function(x,y,w,h) {
        this.state = 0;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    };
})();
