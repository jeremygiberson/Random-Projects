var PubSub = {
    subscribers: {},
    subscribe: function(event, callback) {
        if(typeof this.subscribers[event] === 'undefined')
            this.subscribers[event] =[]
        this.subscribers[event].push(callback);
    },
    unsubscribe: function(event, callback) {
        if(typeof this.subscribers[event] === 'undefined')
            return;
        var remove = [];
        for(var i = 0; i < this.subscribers[event].length; i++) {
            if(this.subscribers[event][i] === callback)
                remove.push(i);
        }
        for(var i in remove) {
            this.subscribers[event] = this.subscribers[event].splice(i, 1);
        }
    },
    publish: function(event, options) {
        if(typeof this.subscribers[event] === 'undefined')
            return;
        for(var i in this.subscribers[event]) {
            this.subscribers[event][i](options);
        }
    }
};
