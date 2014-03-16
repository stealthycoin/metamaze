
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
					rm.playSound("tele");
				    }, false);
	    t1.x = a.x;
	    t1.y = a.y;

	    var t2 = new GameObject(newImg,
				    function() {
					world.getPlayer().move(b,a,teleport_speed);
					rm.playSound("tele");					
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
	    var color = world.random() % 10;
	    if (color !== 0) color = 1;
	    
	    if (color === 0) {
		var image = rm.images["pill-flip"];
		image = recolorImage(image, $V([255,0,0]));
	    }
	    else {
		var image = rm.images["pill"];
		image = recolorImage(image, $V([148,0,211]));
	    }

	    that.tiles[loc].content = new GameObject(image,
						     function () {
							 rm.playSound("pill");
							 if (color === 1) {
							     world.getPillBar().update(5);
							 }
							 else {
							     world.getHealthBar().update(10);
							 }
							 if (world.getHealthBar().current === 100 && color !=1){ 
							     
							     world.getPointsBar().update(10);
							 }
							 else if(world.getPillBar().current === 100 && color === 1){
							     
							     console.log(world.getPillBar().current);
							     world.getPointsBar().update(10);
							 }
							 that.tiles[loc].content = undefined;
						     });
	},

	makeEnemy: function(loc, that) {
	    that.tiles[loc].content = new GameObject(rm.images["bug"],
						     function () {
							 var leftover = world.getShieldBar().update(-1);
							 leftover *= 15;
							 if (leftover < 0){
							     rm.playSound("bite");
							 }else{
							     rm.playSound("armor");
							 }

							 world.getHealthBar().update(leftover);
							 that.tiles[loc].content = undefined;
						     });
	},

	makeShield: function(loc, that) {
	    that.tiles[loc].content = new GameObject(rm.images["shield"],
						     function () {
							 rm.playSound("armor");
							 world.getShieldBar().update(1);
							 
							 world.getPointsBar().update(50);
							 
							 
							 that.tiles[loc].content = undefined;
						     });
	    
	},
	
	makeDollars: function(loc,that) {
	    that.tiles[loc].content = new GameObject(recolorImage(rm.images["dollar"], $V([100,200,100])),
						     function () {
							 rm.playSound("chaching");
							 world.getPointsBar().update(100);
							 that.tiles[loc].content = undefined;
						     });
	},
	
	makeMusic: function(loc, that){
	    that.tiles[loc].content = new GameObject(rm.images["music"],
						     function () {
							 rm.playRandomMusic();
						     }, false);
	    
	}
    };
})();
