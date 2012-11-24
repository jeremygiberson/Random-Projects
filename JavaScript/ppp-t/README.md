ppp
===

ppp is a pixel painting app for programmers powered by WebGL. I'm creating it to scratch an itch I had while using Paint.NET. While creating pixel art for my game, I found myself repeating a couple steps every time I created a new file--steps that I felt could easily be togglable settings in a dedicated pixel painting app.


Features
--------

The app is pretty minimal as far as tool set goes, but has a lot of common functionality to Paint.NET.

  * Tools -- pencil, eraser, eye dropper, fill.
  * Layers & Layer management -- add, clone, and remove layers. Also toggle visibility and link layers to move together.
  * Palettes -- integrated palette selector that pulls palettes from colourlovers.com [w/ search]
  * Publish -- allow user to save the image to their hard drive, eventually support export functionality to a simple format supporting layers (probably Paint.NET's .pdn)


How to Run
----------

At the moment, I'm loading texture files from the image folder which currently prevents the app from running correctly due to domain origin security issues. So for now, you'll need to place the app files on an actual server to run the app. Later, I'll convert any required assets to data urls and use those instead, that way the app can be run by simply opening the index.html file in your browser.

If you put the files on your webserver, just point your browser to http://<yourserver>/<pathToPpp>/index.html

If you happen to have node installed, you can use it to run a light static web server to serve the app

    node server.js
    
    ## ouput should look something like
    X:\git\ppp>node server.js
    Static file server running at
      => http://localhost:8888/
    CTRL + C to shutdown    
    
Then point your browser to http://localhost:8888/index.html

