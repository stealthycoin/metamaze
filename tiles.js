
var specialTiles = (function() {

    var teleport_speed = 20;

    return {
	/*
	 * Expects two objects in the form { x: #, y: # }
	 * Color: How to modify the color of the base teleport graphic to make these unique
	 */
	generateTeleporterPair: function(a,b,color) {
	    var p = world.getPlayer();
	    var t1 = new GameObject(rm.images["tele"],
				    function() {
					p.move(a,b,teleport_speed);
				    });
	    t1.x = a.x;
	    t1.y = a.y;

	    var t2 = new GameObject(rm.images["tele"],
				    function() {
					p.move(b,a,teleport_speed)
				    });
	    t2.x = b.x;
	    t2.y = b.y;
	    return [t1,t2];
	},
    };
})();
