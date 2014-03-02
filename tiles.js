
var specialTiles = (function() {

    var teleport_speed = 20;

    return {
	/*
	 * Expects two objects in the form { x: #, y: # }
	 * Color: How to modify the color of the base teleport graphic to make these unique
	 * color will be a rgb color vector. (0-255)
	 */
	generateTeleporterPair: function(a,b,color) {
	    //recolor
	    var img = rm.images["tele"];
	    var c = document.createElement("canvas");
	    c.width = img.width;
	    c.height = img.height;
	    var ctx = c.getContext("2d");
	    ctx.drawImage(img,0,0);
	
	    var data = ctx.getImageData(0,0,img.width,img.height);

	    for (var j = 0; j < img.height; j++) {
		for (var i = 0; i < img.width; i++) {
		    var index = i*4*data.width+j*4;
		    
		    var colorVector = $V([data.data[index],
					  data.data[index+1],
					  data.data[index+2]]);
		    //average the colors
		    colorVector = colorVector.add(color).x(0.5);
		    data.data[index] = colorVector.e(1);
		    data.data[index+1] = colorVector.e(2);
		    data.data[index+2] = colorVector.e(3);
		}
	    }

	    ctx.putImageData(data,0,0);
	    var newImg = document.createElement("img");
	    newImg.src = c.toDataURL("image/png");

	    var t1 = new GameObject(newImg,
				    function() {
					world.getPlayer().move(a,b,teleport_speed);
				    }, false);
	    t1.x = a.x;
	    t1.y = a.y;

	    var t2 = new GameObject(newImg,
				    function() {
					world.getPlayer().move(b,a,teleport_speed)
				    }, false);
	    t2.x = b.x;
	    t2.y = b.y;
	    return [t1,t2];
	},

	makeEye: function(loc, that) {
	    that.tiles[loc].content = new GameObject(rm.images["eye"], 
						     function () { 
							 world.getPlayer().vrange += 1; 
							 that.tiles[loc].content = undefined; 
						     });
	},

	makePills: function(loc, that) {
	    that.tiles[loc].content = new GameObject(rm.images["pill"],
						     function () {
							 world.getPillBar().update(10);
							 that.tiles[loc].content = undefined;
						     });
	}
    };
})();
