
var game = (function() {
    var WIDTH;
    var HEIGHT;
    var FPS = 40//FPS count
    var canvas; //game canvas
    var ctx;

    var bodies = [];

    //timing variables
    var clock;

    return {
	resize: function() {
	    WIDTH = $(window).width();
	    HEIGHT = $(window).height();
	    
	    $("#game_area")[0].width = WIDTH;
	    $("#game_area")[0].height = HEIGHT;	
	},
	
	init: function() {
	    console.log("init");

	    //screen setup
	    $(window).bind("resize", game.resize);
	    game.resize();
  
	    canvas = document.getElementById('game_area');
	    ctx = canvas.getContext("2d");

	    //add bodies
	    bodies.push(new Body($V([100,100]), 5, "red"));
	    bodies.push(new Body($V([200,200]), 13, "green"));

	    //setup the game loop
	    clock = new Timer();
	    lastTime = clock.getMilliseconds();
	    game.update();
	},

	update: function() {
	    //update clock
	    var last_time = clock.getMilliseconds();
	    var current_time = clock.update().getMilliseconds();
	    var dt = current_time - last_time; //delta time

	    //update bodies
	    //apply gravity between all object pairs
	    bodies.map(function (a) {
		bodies.map(function (b) {
		    a.applyForce(a.mass * b.mass / (a.p.distanceFrom(b.p) * a.p.distanceFrom(b.p)) );
		})});


	    bodies.map(function (e) { e.update(dt); });

	    //draw game state here
	    game.draw();

	    //call update again. Math to yield here based on FPS TODO
	    setTimeout(function() {
		game.update();
	    }, 20);
	},

	draw: function() {
	    //fill in background
	    ctx.fillStyle = "#CCCCDF";
	    ctx.fillRect(0,0,WIDTH,HEIGHT);
	    
	    //draw the bodies
	    bodies.map(function (e) { e.draw(ctx); });
	}
    }
})();
