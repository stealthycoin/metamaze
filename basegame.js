
var game = (function() {
    var WIDTH;
    var HEIGHT;
    var FPS = 40//FPS count
    var canvas; //game canvas
    var ctx;

    //timing variables
    var clock;

    return {
	init: function() {
	    console.log("init");

	    //attach canvas variable to the canvas thingy
	    canvas = $("#game_area")[0];
	    ctx = canvas.getContext("2d");
	    WIDTH = canvas.width;
	    HEIGHT = canvas.height;
	    
	    console.log(WIDTH + ":" + HEIGHT);

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


	    //update game state here


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

	    
	}
    }
})();
