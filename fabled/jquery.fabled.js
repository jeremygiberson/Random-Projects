/*
Code: Jeremy Giberson
Design: Michael Schultz (http://forrst.com/posts/h1_Fable_Button_h1_I_had_this_idea_for_a_new_se-7tB)
*/
(function($)
{


    $.fn.fabled = function(options)
    {
        // event functions
        var mousedown = function(event, element)
        {
            // log when mousedown occured
            var data = $(element).data('fabled');
            // check if button is already clicked
            if($(element).hasClass(data.settings.clickedClass))
                return;
            // apply holding class
            $($(element).parent()).addClass('fabled-border-container-active');
            $(element).addClass(data.settings.activeClass);
            // begin hold anim
            animPhase1(element);
        }
    
    
        var mouseup = function(event, element)
        {
            animReset(element);
        }
        
        var animPhase1 = function(element)
        {
            var data = $(element).data('fabled');
            $(data.border1).width(data.settings.radius);
            $(data.border1).animate({'width': '50%'}, {'duration': parseInt(data.duration/8), 'queue': true, 'complete': function(){animPhase2(element)}});
        }
        var animPhase2 = function(element)
        {
            var data = $(element).data('fabled');
            $(data.border2).height(data.settings.radius);
            $(data.border2).animate({'height': '100%'}, {'duration': parseInt(data.duration/4), 'queue': true, 'complete': function(){animPhase3(element)}});
        }
        var animPhase3 = function(element)
        {
            var data = $(element).data('fabled');
            $(data.border3).width(data.settings.radius);
            $(data.border3).animate({'width': '100%'}, {'duration': parseInt(data.duration/4), 'queue': true, 'complete': function(){animPhase4(element)}});
        }
        var animPhase4 = function(element)
        {
            var data = $(element).data('fabled');
            $(data.border4).height(data.settings.radius);
            $(data.border4).animate({'height': '100%'}, {'duration': parseInt(data.duration/4), 'queue': true, 'complete': function(){animPhase5(element)}});
        }
        var animPhase5 = function(element)
        {
            var data = $(element).data('fabled');
            $(data.border5).width(data.settings.radius);
            $(data.border5).animate({'width': '60%'}, {'duration': parseInt(data.duration/8), 'queue': true, 'complete': function(){animPhase6(element)}});
        }
        var animPhase6 = function(element)
        {
            // animation is finished!
            // remove borders
            var data = $(element).data('fabled');
            $(data.border1).stop(true).width(0);
            $(data.border2).stop(true).height(0);
            $(data.border3).stop(true).width(0);
            $(data.border4).stop(true).height(0);
            $(data.border5).stop(true).width(0);
            $($(element).parent()).removeClass('fabled-border-container-active');
            $(element).removeClass(data.settings.activeClass);
            // apply clicked class
            $(element).addClass(data.settings.clickedClass);
            // clicked callback
            var func = data.settings.complete;
            if(func)
                func.apply(element);
        }
        var animReset = function(element)
        {
            var data = $(element).data('fabled');
            $(data.border1).stop(true).width(0);
            $(data.border2).stop(true).height(0);
            $(data.border3).stop(true).width(0);
            $(data.border4).stop(true).height(0);
            $(data.border5).stop(true).width(0);
            $($(element).parent()).removeClass('fabled-border-container-active');
            $(element).removeClass(data.settings.activeClass);
        }
    
        return this.each(function()
        {
            // default settings
            var settings = {
                'duration': 2500, // 1 second duration
                'radius': '12px', // border corner radius
                // css class 
                'activeClass': 'fabled-button-active', //applied while mouse active
                'clickedClass': 'fabled-button-clicked' //applied and end of hold
            }
            if(options) 
                $.extend(settings, options);
        
            // this = element, $this = jquery(element)
            var $this = $(this); 
        
            // bind mouse down and up to monitor click state
            $this.bind('mousedown', function(e){mousedown(e,this)});
            $this.bind('mouseup', function(e){mouseup(e,this)});
            $this.bind('mouseout', function(e){mouseup(e,this)});
    
            // apply fabled button style
            $this.addClass('fabled-button');
            // wrap the element with a container (for border animation)
            $this.wrap("<div class='fabled-border-container'/>");
            // add border elements
            $this.before("<div class='fabled-border fabled-border-top-start'/>");
            $this.before("<div class='fabled-border fabled-border-right'/>");
            $this.before("<div class='fabled-border fabled-border-bottom'/>");
            $this.before("<div class='fabled-border fabled-border-left'/>");
            $this.before("<div class='fabled-border fabled-border-top-end'/>");
    
            var $parent = $($this.parent());
    
            var data = $this.data('fabled',
                {
                    'duration': settings.duration,
                    'border1': $parent.find('.fabled-border-top-start').get(0),
                    'border2': $parent.find('.fabled-border-right').get(0),
                    'border3': $parent.find('.fabled-border-bottom').get(0),
                    'border4': $parent.find('.fabled-border-left').get(0),
                    'border5': $parent.find('.fabled-border-top-end').get(0),
                    'settings': settings
                });
        });
    };
})(jQuery);    