
var game = (function() {
    var WIDTH;
    var HEIGHT;

    var canvas; //game canvas
    var ctx;

    var stateStack = [];

    //timing variables
    var clock, frameClock; //frameClock is for the real time of 1 update call
    var leftOver; //left over ms that are smaller than timeStep each frame, pushed to next frame
    var FPS = 40//FPS count
    var timeStep = 5; //how many ms is each update
    var delay = 1 / FPS * 1000; //delay between frames in ms target

    return {

	//some constants
	MENU:0,
	GAME:1,
	LOADING:2,
	PAUSE:3,

	//public functions
	resize: function() {
	    WIDTH = $(window).width();
	    HEIGHT = $(window).height();
	    
	    $("#game_area")[0].width = WIDTH;
	    $("#game_area")[0].height = HEIGHT;	
	},
	
	init: function() {
	    //screen setup
	    $(window).bind("resize", game.resize);
	    game.resize();
	    
	    canvas = document.getElementById('game_area');
	    ctx = canvas.getContext("2d");

	    //setup game stack
	    stateStack.push(game.GAME);
	    stateStack.push(game.LOADING);

	    //load resources

	    rm.init( function() {},
		     function() { setTimeout(function () {stateStack.pop();}, 100); } );
	    rm.addResource("player", "resources/images/dr.png", "png", rm.ResourceType.IMAGE);
	    setTimeout( rm.startPreloading(), 5);
	    

	    //load a level
	    world.init(5, 1);


	    //setup the game loop
	    leftOver = 0;
	    clock = new Timer();
	    frameClock = new Timer();
	    lastTime = clock.getMilliseconds();
	    game.update();
	},

	update: function() {
	    //update clock
	    frameClock.update();
	    var last_time = clock.getMilliseconds();
	    var current_time = clock.update().getMilliseconds();
	    var dt = current_time - last_time; //delta time
	    
	    //add the time from lasttime that was left over
	    dt += leftOver;

	    //calculate new leftover time and the number of steps of size timeStep
	    leftOver = dt % timeStep;
	    var steps = Math.floor(dt / timeStep);

	    //update game in descrete, constant time steps with the given duration
	    for (var i = 0 ; i < steps ; i++) {
		game.updateState(timeStep);
	    }
	    

	    //draw game state
	    game.draw();
	    

	    //calculate how long we need to wait to maintain framerate
	    var frameTime = frameClock.update().getMilliseconds() - frameClock.getMilliseconds() ;
	    var extraDelay = delay - frameTime;

	    //shouldnt be very big for this example since we aren't doing much per frame
	    setTimeout(function() {
		game.update();
	    }, extraDelay);
	},

	updateState: function(dt) {
	    var state = stateStack[stateStack.length-1];

	    if (state === game.MENU) {
	    }
	    else if (state === game.LOADING) {
	    }
	    else if (state === game.GAME) {
    
	    }	    
	},

	draw: function() {  
	    //fill in background
	    ctx.fillStyle = "#CCCCDF";
	    ctx.fillRect(0,0,WIDTH,HEIGHT);	    
	    
	    var state = stateStack[stateStack.length-1];
	    if (state === game.MENU) {

		ctx.beginPath();
		ctx.fillStyle = "red";
		ctx.rect(0,0,WIDTH,HEIGHT);
		ctx.fill();

	    }
	    else if (state === game.LOADING) {
		rm.draw(ctx);
	    }
	    else if (state === game.GAME) {
		//draw the world
		world.draw(ctx);
	    }
	}
    }
})();
