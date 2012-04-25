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
    
    // test setting manipulation
    console.log(settings.get('title'));
    settings.set('title', 'application');
    //settings.unset('title');
    console.log(settings.get('title'));
    
    // save all the settings
    settings.save();
});    