// jquery.ready
$(function(){
    // application settings
    var ApplicationSettings = Backbone.Model.extend({
        localStorage: new Store('appsettings')
    });
    
    // id is required to make sure we dont create new model each time
    var settings = new ApplicationSettings({id: 1});
    // load data from storage
    settings.fetch();
    
    var FileModel = Backbone.Model.extend({
        defaults: function() { return {'name': 'new file', 'width': 128, 'height': 64} },
        initialize: function() { 
            if(!this.get('name'))
                this.set({'name': this.defaults.name});
            if(!this.get('width'))
                this.set({'width': this.defaults.width});
            if(!this.get('height'))
                this.set({'height': this.defaults.height});
        }
    });
    
    var LayerModel = Backbone.Model.extend({
        localStorage: new Store('layers'),
        defaults: function() { return {data: null, order: 1} },
        initialize: function(){
            if(!this.get('fileId'))
                throw 'A fileId must be specified';
            if(!this.get('order'))
                this.set({'order': this.defaults.order});
            if(!this.get('data'))
                this.set({'data': this.defaults.data});
        },
        clear: function() { this.destroy(); }
    });
    
    var LayerCollection = Backbone.Collection.extend({
        model: 'LayerModel',
        fileId: null,
        initialize: function(){
            if(!this.options.fileId)
                throw 'fileId must me provided';
            this.fileId = this.options.fileId;    
        },
        nextOrder: function() {
            if(!this.length) return 1;
            return this.last().get('order') + 1;
        },
        comparator: function(layer) { 
            return layer.get('order');
        },
    });
    
    /**
     LayerView is a canvas element
     */
    var LayerView = Backbone.View.extend({
        tagName: 'canvas',
        className: 'layer',
        events: {},
        initialize: function() {
            $(this.options.parent).append(this.el);
        },
        render: function(){ return this; }
    });
    
    //layer = new LayerView({'parent': $('#app').get(0)});
    //layer.render();
    
    var FileView = Backbone.View.extend({
        tagName: 'div',
        className: 'file',
        layers: null,
        initialize: function(){
            this.layers = new LayerCollection([], {'fileId': this.get('id')});
        }
    });
    
    var AppView = Backbone.View.extend({
        el: $('#app'),
        template: _.template($('#app-template').html()),
        activeFile: null,
        initialize: function(){
            this.$el.html(this.template());
        },
        events: {
            'click .toolbar .button': 'toolbarHandler'
        },
        toolbarHandler: function(e){
            var src = e.target;
            var action = $(src).attr('action');
            switch(action)
            {
                case 'new': this.newFile(); break;
            }
        },
        // new file dialog
        newFile: function(){
            this.activeFile = new FileView;
        }
    });
    
    
    app = new AppView;
});    