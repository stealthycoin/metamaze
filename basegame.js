
var game = (function() {
    var WIDTH;
    var HEIGHT;

    var canvas; //game canvas
    var ctx;
    var ctx2;
    var im;
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
	BG_COLOR: "#CCCCDF",

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
	    
	    //setup inputmanager
	    im = new InputManager();

	    //setup game stack
	    stateStack.push(game.GAME);
	    stateStack.push(game.LOADING);

	    //load resources
	    rm.init( function() {},
		     function() { setTimeout(function () { stateStack.pop(); game.start(); }, 100); } );
	    rm.addResource("player", "resources/images/dr.png",     "png", rm.ResourceType.IMAGE);
	    rm.addResource("exit",   "resources/images/stairs.png", "png", rm.ResourceType.IMAGE);
	    rm.addResource("tele",   "resources/images/tele.png", "png", rm.ResourceType.IMAGE);
	    rm.addResource("eye",   "resources/images/eye.png", "png", rm.ResourceType.IMAGE);
	    rm.addResource("bug",   "resources/images/bug.png", "png", rm.ResourceType.IMAGE);
	    rm.addResource("pill",   "resources/images/pill-32.png", "png", rm.ResourceType.IMAGE);
	    
	    setTimeout(rm.startPreloading(), 5);
	    
	},
	start: function() {
	    //load a level
	    world.init(5, Math.round(Math.random() * 10000));

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

	    //poll for input
	    game.checkKeys();


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
	    var frameTime = frameClock.update().getMilliseconds() - frameClock.getMilliseconds();
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
		world.update(dt);
	    }	    
	},

	draw: function() {  
	    //fill in background
	    ctx.fillStyle = game.BG_COLOR;
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
	},

	checkKeys: function() {
	    var up = im.isKeyDown(im.key['w']) || im.isKeyDown(im.key['arriba']);
	    var left = im.isKeyDown(im.key['a']) || im.isKeyDown(im.key['left']);
	    var down = im.isKeyDown(im.key['s']) || im.isKeyDown(im.key['abajo']);
	    var right = im.isKeyDown(im.key['d']) || im.isKeyDown(im.key['right']);
	    var use = im.isKeyReleased(im.key['e']);
	    var player = world.getPlayer();
	    
	    if (up) {
		player.nextStep = "up";
	    }
	    else if (down) {
		player.nextStep = "down";
	    }
	    else if (right) {
		player.nextStep = "right";
	    }
	    else if (left) {
		player.nextStep = "left";
	    }
	    
	    //did the player press use?
	    if (use) {
		player.use = true;
	    }

	    im.update();
	}
    }
})();
