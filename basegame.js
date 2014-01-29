
var game = (function() {
    var WIDTH = 500; //globals that set the width and height of the game area
    var HEIGHT = 500;
    var FPS = 40//FPS count
    var canvas; //game canvas
    var ctx;

    //timing variables
    var last_time;    
    var game_loop;

    return {
	init: function() {
	    console.log("init");

	    //attach canvas variable to the canvas thingy
	    canvas = $("#game_area")[0];

	    //set the size of the canvas
	    canvas.style.width = WIDTH + "px";
	    canvas.style.height = HEIGHT + "px";
	    ctx = canvas.getContext("2d");

	    //setup the game loop
	    last_time = (new Date).getTime();
	    game_loop = setInterval(game.update, 1/FPS*1000);
	},

	update: function() {
	    //update clock
	    var current_time = (new Date).getTime();
	    var dt = current_time - last_time; //delta time
	    last_time = current_time;

	    //done updating time to draw
	    game.draw();
	},

	draw: function() {
	    //fill in background
	    ctx.fillStyle = "#CCCCDF";
	    ctx.fillRect(0,0,WIDTH,HEIGHT);

	    
	}
    }
})();
