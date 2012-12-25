// namespace our additions
Raphael.util = {};
// shortcut wrapper to convert hex to hsb
Raphael.util.hex2hsb = function(hex) {
    return Raphael.rgb2hsb(Raphael.getRGB(hex));
};
// define function for animating gradients [needs to be applied to custom attribute of paper
// angle, startcolor [sh,ss,sb], endcolor [eh, es, eb]
Raphael.util.animGradient = function (angle, sh, ss, sb, eh, es, eb) {
    var s = 'hsb(' + [sh,ss,sb].join(',') + ')';
    var e = 'hsb(' + [eh,es,eb].join(',') + ')';
    return {gradient: [angle,s,e].join('-')};
};

// shortcut wrapper to provide parameter to animGradient customAttrib
Raphael.util.toAnimGradientParam = function (angle, startColorHex, stopColorHex) {
    var s = Raphael.util.hex2hsb(startColorHex);
    var e = Raphael.util.hex2hsb(stopColorHex);
    return [angle ,s.h, s.s, s.b, e.h, e.s, e.b];
};

Raphael.util.getTransformX = function(transform) {
    for(var i in transform) {
        if(transform[i][0] == 'T') {
            return transform[i][1];
        }
    }
    return 0;
};
Raphael.util.getTransformY = function(transform) {
    for(var i in transform) {
        if(transform[i][0] == 'T') {
            return transform[i][2];
        }
    }
    return 0;
};
Raphael.util.getTransformR = function(transform, cx, cy) {
    for(var i in transform) {
        if(transform[i][0] == 'R') {
            // if cx,cy were defined, find matching r
            if((typeof cx !== 'undefined' && typeof cy !== 'undefined')
                && transform[i].length == 4 && transform[i][2] == cx && transform[i][3] == cy) {
                return transform[i][1];
            } else if((typeof cx === 'undefined' && typeof cy === 'undefined')
                && transform[i].length == 2) {
                return transform[i][1];
            }
        }
    }
    return 0;
};
Raphael.util.getTransformS = function(transform, cx, cy) {
    for(var i in transform) {
        if(transform[i][0] == 'S') {
            // if cx,cy were defined, find matching r
            if((typeof cx !== 'undefined' && typeof cy !== 'undefined')
                && transform[i].length == 4 && transform[i][2] == cx && transform[i][3] == cy) {
                return transform[i][1];
            } else if((typeof cx === 'undefined' && typeof cy === 'undefined')
                && transform[i].length == 2) {
                return transform[i][1];
            }
        }
    }
    return 0;
};

// add group to raphael
Raphael.fn.group = function() {
    var out = Raphael._engine.group(this);
    this.__set__ && this.__set__.push(out);
    return out;
};
(function(R, e) {
    e.group = function(svg) {
        $ = R.get$();
        var el = $("g");
        svg.canvas && svg.canvas.appendChild(el);
        var Element = R.getElementClass();
        var res = new Element(el, svg);
        res.type = "group";
        return res;
    }
})(window.Raphael, window.Raphael._engine);