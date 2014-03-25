
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
	DEAD: 4,
	BG_COLOR: "#CCCCDF",

	//public functions
	resize: function() {
	    WIDTH = $(window).width();
	    HEIGHT = $(window).height();
	    
	    $("#game_area")[0].width = WIDTH;
	    $("#game_area")[0].height = HEIGHT;	
	},

	getStateStack: function(){
	    return stateStack;
	},

	setStateStack: function(state){
	    stateStack.push(state);
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
	    setTimeout( function () {rm.init( function() {},
					      function() { 
						  setTimeout(function () { 
						      console.log("start it up bitches");
						      world.init(10, Math.round(Math.random() * 10000));
						      stateStack.pop(); 
				
						  }, 100); });
				     rm.addResource("player", "resources/images/dr.png",     "png", rm.ResourceType.IMAGE);
				     rm.addResource("exit",   "resources/images/stairs.png", "png", rm.ResourceType.IMAGE);
				     rm.addResource("tele",   "resources/images/tele.png",   "png", rm.ResourceType.IMAGE);
				     rm.addResource("eye",    "resources/images/eye.png",    "png", rm.ResourceType.IMAGE);
				     rm.addResource("bug",    "resources/images/bug.png",    "png", rm.ResourceType.IMAGE);
				     rm.addResource("pill",   "resources/images/pill-32.png","png", rm.ResourceType.IMAGE);
				     rm.addResource("pill-flip",   "resources/images/pill-flip.png","png", rm.ResourceType.IMAGE);
				     rm.addResource("shield", "resources/images/shield.png", "png", rm.ResourceType.IMAGE);
				     rm.addResource("dollar", "resources/images/money.png", "png", rm.ResourceType.IMAGE);
				     rm.addResource("music", "resources/images/music.png", "png", rm.ResourceType.IMAGE);


				     rm.addResource("tele",   "resources/music/teleport.mp3","mp3", rm.ResourceType.SOUND);
				     rm.addResource("stairs", "resources/music/stairs.mp3",  "mp3", rm.ResourceType.SOUND);
				     rm.addResource("armor",  "resources/music/armor.mp3",   "mp3", rm.ResourceType.SOUND);
				     rm.addResource("bite",   "resources/music/bite.mp3",    "mp3", rm.ResourceType.SOUND);
				     rm.addResource("chaching","resources/music/money.mp3","mp3", rm.ResourceType.SOUND);
				     rm.addResource("pill","resources/music/pill.mp3","mp3", rm.ResourceType.SOUND);

				     rm.addResource("angryrobot","resources/music/DST-AngryRobotIII.mp3","mp3", rm.ResourceType.SOUND);
				     //	    rm.addResource("cyber","resources/music/DST-CyberOps.mp3","mp3", rm.ResourceType.SOUND);
				     rm.addResource("danger","resources/music/DST-Dangeroz.mp3","mp3", rm.ResourceType.SOUND);
				     rm.addResource("glass","resources/music/DST-GlassView.mp3","mp3", rm.ResourceType.SOUND);
				     rm.addResource("half","resources/music/DST-Half-Life.mp3","mp3", rm.ResourceType.SOUND);
				     rm.addResource("mech","resources/music/DST-MechaNoir.mp3","mp3", rm.ResourceType.SOUND);
				     rm.addResource("mal","resources/music/DST-Malaise.mp3","mp3", rm.ResourceType.SOUND);
				     rm.addResource("moon","resources/music/DST-MoonBeach.mp3","mp3", rm.ResourceType.SOUND);
				     rm.addResource("sea","resources/music/DST-SeashoreMemory.mp3","mp3", rm.ResourceType.SOUND);

				     setTimeout(rm.startPreloading(), 0);
				    },0);

	    console.log("end of init");
	    game.start(); 
	    
	},
	start: function() {

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
		console.log("Update loading");
	    }
	    else if (state === game.GAME) {
		world.update(dt);
	    }
	    else if (state === game.PAUSE) {
		if (im.isKeyReleased(im.key['p'])) {
		    stateStack.pop();
		}
		im.update();
	    }
	    else if (state === game.DEAD){
		game.draw();
	    }
	},

	draw: function() {  
	    //fill in background
	    ctx.fillStyle = game.BG_COLOR;
	    ctx.fillRect(0,0,WIDTH,HEIGHT);	    

	    var state = stateStack[stateStack.length-1];
	    //console.log(state);
	    if (state === game.MENU) {
		ctx.beginPath();
		ctx.fillStyle = "red";
		ctx.rect(0,0,WIDTH,HEIGHT);
		ctx.fill();
	    }
	    else if (state === game.LOADING) {
		console.log("Draw loading");
		rm.draw(ctx);
	    }
	    else if (state === game.PAUSE) {
		world.draw(ctx);
		world.drawPause(ctx);
	    }
	    else if (state === game.GAME) {
		//draw the world
		world.draw(ctx);
	    }
	    else if (state === game.DEAD){
		
		ctx.fillStyle = "red";
		ctx.font = "25pt Arial";
		ctx.fillText("You've gone and gotten yerself dead mate", 400, 495)		
		
		ctx.fillStyle = "black";
		ctx.font = "25pt Arial";
		ctx.fillText("press space to continue", 400, 550)		

		if (world.getLives() <= 0){
		    ctx.fillText("You have lost all of your lives", 400, 400)		
		    if (im.isKeyReleased(im.key['space'])){
			stateStack.pop();
			world.getPointsBar().current = 0;
			world.getHealthBar().current = 100;
			world.getPillBar().current = 30;
			world.getShieldBar().current = 0;
			world.changeLives(1);

			if(world.getlvl() === 0){
			    world.nextLevel(1);
			}
			else{
			    while(world.getlvl() !== 1){
				world.nextLevel(-1);
			    }
			}
		    }
		    
		}
		else if (im.isKeyReleased(im.key['space'])){
		    stateStack.pop();

		    
		    world.getHealthBar().current = 100;
		    world.getPillBar().current = 30;

		    
		    if (world.getlvl() === 1){
			world.nextLevel(0);
		    }else{
			world.nextLevel(-1);
		    }
		    
		}
		im.update();
	    }
	},

	checkKeys: function() {
	    var up = im.isKeyDown(im.key['w']) || im.isKeyDown(im.key['arriba']);
	    var left = im.isKeyDown(im.key['a']) || im.isKeyDown(im.key['left']);
	    var down = im.isKeyDown(im.key['s']) || im.isKeyDown(im.key['abajo']);
	    var right = im.isKeyDown(im.key['d']) || im.isKeyDown(im.key['right']);
	    var use = im.isKeyReleased(im.key['e']);
	    var pause = im.isKeyReleased(im.key['p']);
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

	    //did the player pause the game?
	    if (pause) {
		stateStack.push(game.PAUSE);
	    }

	    im.update();
	}
    }
})();
