
var specialTiles = (function() {

    var teleport_speed = 20;

    return {
	/*
	 * Expects two objects in the form { x: #, y: # }
	 * Color: How to modify the color of the base teleport graphic to make these unique
	 */
	generateTeleporterPair: function(a,b,color) {
	    console.log(rm.isloadComplete());
	    while (rm.isloadComplete() === false) { console.log("waiting"); }
	    //recolor
	    var img = rm.images["tele"];
	    var c = document.createElement("canvas");
	    c.width = img.width;
	    c.height = img.height;
	    var ctx = c.getContext("2d");
	    ctx.drawImage(img,0,0);
	
	    console.log(img.width,img.height);
    
	    var data = ctx.getImageData(0,0,img.width,img.height);

	    for (var j = 0; j < img.height; j++) {
		for (var i = 0; i < img.width; i++) {
		    var index = i*4*data.width+j*4;
		    var red = data.data[index];
		    var green = data.data[index+1];
		    var blue = data.data[index+2];
		    var alpha = data.data[index+3];
		}
	    }
	    var newImage = document.createElement("img");
	    newimg.src = c.toDataURL("image/png");


	    var t1 = new GameObject(newImage,
				    function() {
					world.getPlayer().move(a,b,teleport_speed);
				    });
	    t1.x = a.x;
	    t1.y = a.y;

	    var t2 = new GameObject(newImage,
				    function() {
					world.getPlayer().move(b,a,teleport_speed)
				    });
	    t2.x = b.x;
	    t2.y = b.y;
	    return [t1,t2];
	},
    };
})();
