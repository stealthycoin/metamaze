
var game = (function() {
    var WIDTH;
    var HEIGHT;

    var canvas; //game canvas
    var ctx;

    var bodies = [];
    var cm;
    //timing variables
    var clock, frameClock; //frameClock is for the real time of 1 update call
    var leftOver; //left over ms that are smaller than timeStep each frame, pushed to next frame
    var FPS = 40//FPS count
    var timeStep = 5; //how many ms is each update
    var delay = 1 / FPS * 1000; //delay between frames in ms target

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
	    
/*	    
	    //hyperbola
	    bodies.push(new Body($V([100,300]), 1, 5, "red"));
	    bodies[0].setVelocity($V([4,4]));
	    bodies.push(new Body($V([600,600]), 1000, 13, "green"));
*/
            

	    //pretty cool ellipse
	    bodies.push(new Body($V([400,100]), 1, 5, "red"));
	    bodies[0].setVelocity($V([1,0]));
	    bodies.push(new Body($V([600,600]), 1000, 13, "green"));
	    


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
	    

	    //calculate center of mass
	    cm = $V([0,0]);
	    var bigM = 0;
	    bodies.map(function(e){
		cm = cm.add(e.p.multiply(e.mass));
		bigM += e.mass;
	    });
	    cm = cm.multiply(1/bigM);


	    //draw game state
	    game.draw();
	    

	    //calculate how long we need to wait to maintain framerate
	    var frameTime = frameClock.update().getMilliseconds() - frameClock.getMilliseconds() ;
	    var extraDelay = delay - frameTime;

	    //shouldnt be very big for this example since we aren't doing much per frame
	    setTimeout(function() {
		game.update();
	    }, extraDelay);

	    /*ctx.fillstyle = "black";
	    ctx.arc(this.p.elements[0],
		    this.p.elements[1]
		    1, 0, 2*Math.PI, false);
	    ctx.fill();
	    */
	},

	updateState: function(dt) {
	    //update bodies
	    //apply gravity between all object pairs
	    bodies.map(function (a) {
		bodies.map(function (b) {
		    if (a !== b) { //unless you like infinite force vectors
			var mag = a.mass * b.mass / (a.p.distanceFrom(b.p) * a.p.distanceFrom(b.p)); //clearly
			var v = a.p.subtract(b.p).toUnitVector().multiply(-mag); //I think this is obvious
			a.applyForce(v);
			
			if (a.p.distanceFrom(b.p) <= (a.r + b.r))
			{
			    alert("Collision detected");
			}

		    }
		})});


	    bodies.map(function (e) { e.update(dt); });
	},

	draw: function() {
	    //fill in background
	    ctx.fillStyle = "#CCCCDF";
	    ctx.fillRect(0,0,WIDTH,HEIGHT);
	    //draw the bodies
	    bodies.map(function (e) { e.draw(ctx); });
	    ctx.beginPath();
	    ctx.fillStyle = "black"
	    ctx.arc(cm.elements[0], 
		    cm.elements[1], 
		    3, 0, 2 * Math.PI, false);
	    ctx.fill();
	}
    }
})();
