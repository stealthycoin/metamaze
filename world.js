
var world = (function() {
    
    var currentLevel = undefined;
    var seed = 1;
    var player;
    var points = 0;
    var lives = 1;
    var BORDER = 100;
    var player_speed = 250; //player move speed
    var countlvl=1;
    var bugs = [];
    
    var healthBar = new Bar(50, 8, 100, "#dd2222", "red");
    healthBar.current = 100;
    var pillBar = new Bar(50, 8, 100, "#9400d3", "black");

    pillBar.current = 30;

    var shieldBar = new Bar(50, 8, 8, "#565", "black");

    function rhex() {
	return "0123456789ABCDEF"[world.random() % 16];
    }

    var pointsBar = new Bar($(window).width()/2, 25, 1000, "yellow", "black");
    pointsBar.oldUpdate = pointsBar.update;
    pointsBar.update = function(qty) {
	var extra =  (qty + pointsBar.current) - pointsBar.max;
	if (extra >= 0){
	    lives += 1;
	    pointsBar.color = "#"+rhex()+rhex()+rhex()+rhex()+rhex()+rhex();
	    pointsBar.current = 0;
	    pointsBar.update(extra);
       
	}
	else {
	    pointsBar.oldUpdate(qty);
	}
    };

    return {
	//a few global variables
	MAZE_VIEWPORT_T: { 
	    x: BORDER,
	    y: BORDER,
	    w: $(window).width() -2*BORDER,
	    h: $(window).height()-2*BORDER
	},
	TILE_SIZE: 32,
	RIGHT: 0x1,
	BOTTOM:0x2,
	LEFT: 0x4,
	TOP: 0x8,

	getlvl: function(){
	    return countlvl;
	},
	    
        getBugs: function(){
	    return bugs;
	},
   
	pushBug: function(x){
	    bugs.push(x);
	},

	getLives: function(){
	    return lives;
	},
	
	changeLives: function(delta){
	    lives = lives + delta;
	},
	
	//public functions
	init: function(size, newSeed) {
	    seed = newSeed;
	    currentLevel = new Level(size,player);
	    world.setViewport(size);
	},

	setViewport: function(size) {
	    var viewport = {
		w: Math.min(currentLevel.getWidth(),world.MAZE_VIEWPORT_T.w),
		h: Math.min(currentLevel.getHeight(),world.MAZE_VIEWPORT_T.h)		
	    };
	    
	    viewport.x = ($(window).width() - viewport.w) / 2;
	    viewport.y = ($(window).height() - viewport.h) / 2;

	    viewport.x = Math.max(viewport.x, world.MAZE_VIEWPORT_T.x);
	    viewport.y = Math.max(viewport.y, world.MAZE_VIEWPORT_T.y);

	    world.MAZE_VIEWPORT = viewport;
	},

	nextLevel: function(delta) {
	    countlvl+=delta;
	    world.init(currentLevel.width+delta,seed);
	},

	update: function(dt) {
	    if (player.nextStep === "up" && 
		!currentLevel.tiles[player.i()].hasWall(world.TOP)) {
		player.move(player.loc(),
			    {x:player.x,y:player.y-1},
			    player_speed);

	    }
	    if (player.nextStep === "down" && 
		!currentLevel.tiles[player.i()].hasWall(world.BOTTOM)) {
		player.move(player.loc(),
			    {x:player.x,y:player.y+1},
			    player_speed);

	    }
	    if (player.nextStep === "left" && 
		!currentLevel.tiles[player.i()].hasWall(world.LEFT)) {
		player.move(player.loc(),
			    {x:player.x-1,y:player.y},
			    player_speed);

	    }
	    if (player.nextStep === "right" && 
		!currentLevel.tiles[player.i()].hasWall(world.RIGHT)) {
		player.move(player.loc(),
			    {x:player.x+1,y:player.y},
			    player_speed);

	    }
	    //trigger any action on the tile if it exists
	    if (currentLevel.tiles[player.i()].content !== undefined &&
		currentLevel.tiles[player.i()].content.auto === true) {
		currentLevel.tiles[player.i()].content.steppedOn();
	    }

	    //use the item we are standing on
	    if (player.use === true) {
		player.use = false;
		if (currentLevel.tiles[player.i()].content !== undefined) {
		    currentLevel.tiles[player.i()].content.steppedOn();
		}
	    }
	    
	    //gather tiles the player can activly see
	    var adjtiles = bfs.bfs(player.i(), currentLevel, player.vrange);



	    if (player.moved === true){
		//scan for bugs that are "bugsight" away from the player
		//those should follow the player, otherwise they should move randomly.
		
		//tell bugs they need to move
		for (var i = 0 ; i < bugs.length ; i++) {
		    bugs[i].shouldMove = true;
		}

		//find bugs that have knowledge of the player
		var bugSight = bfs.bfs(player.i(), currentLevel, 4);
		for (var i = 0; i < bugSight.m.length ; i++) {
		    if (currentLevel.tiles[bugSight.m[i]].content !== undefined &&
			currentLevel.tiles[bugSight.m[i]].content.bug === true) {
			currentLevel.tiles[bugSight.m[i]].content.map = bugSight.p; //CHASE
		    }
		}


		for(var j = 0; j<currentLevel.tiles.length; j++){
		    if (currentLevel.tiles[j].isvisible === true){
			currentLevel.tiles[j].isvisible = false;
		    } 
		}	

		player.moved = false;
		for(var i =0; i<adjtiles.size; i++){
		    
		    currentLevel.tiles[adjtiles.m[i]].explored = true;
		    currentLevel.tiles[adjtiles.m[i]].isvisible = true;
		    
		}
	    }
	    
	    //player doesn't need to be marked as moving anymore
	    player.nextStep = undefined;
	    //update player
	    player.update(dt);
	    
	    //update dem bugs
	    for (var b in bugs) {
		bugs[b].bugupdate(dt);
	    }
	    
	},

	getPlayer: function() {
	    return player;
	},

	setPlayer: function(p) {
	    player = p;
	},
	
	getPointsBar: function(){
	    return pointsBar;
	},

	getPillBar: function() {
	    return pillBar;
	},
	
	getHealthBar: function() {
	    return healthBar;
	},

	getShieldBar: function() {
	    return shieldBar;
	},
	
	getLevel: function() {
	    return currentLevel;
	},

	drawPause: function(ctx) {
	    ctx.save();
	    
	    ctx.translate($(window).width() / 2,
			  $(window).height() / 3);
	    ctx.fillStyle = "red";
	    ctx.font = "50pt Arial";
	    var txt = "Paused";
	    var offset = -ctx.measureText(txt).width / 2;
	    ctx.fillText("Paused",offset,0);
	    ctx.restore();
	},

	draw: function(ctx) {
	    currentLevel.draw(ctx);
	    //draw boundary
	    ctx.save();
	    ctx.beginPath();

	    ctx.lineWidth = 4;
	    ctx.fillStyle = game.BG_COLOR;
	    //ctx.strokeStyle =  

	    //cover outside of maze up because I am lazy
	    ctx.fillRect(0,0,$(window).width(),world.MAZE_VIEWPORT.y);
	    ctx.fillRect(0,world.MAZE_VIEWPORT.y,world.MAZE_VIEWPORT.x,$(window).height());
	    ctx.fillRect($(window).width()-world.MAZE_VIEWPORT.x,world.MAZE_VIEWPORT.y,world.MAZE_VIEWPORT.x,$(window).height());
	    ctx.fillRect(world.MAZE_VIEWPORT.x,world.MAZE_VIEWPORT.y+world.MAZE_VIEWPORT.h,world.MAZE_VIEWPORT.w,$(window).height());
	    ctx.strokeRect(world.MAZE_VIEWPORT.x,
			   world.MAZE_VIEWPORT.y,
			   world.MAZE_VIEWPORT.w,
			   world.MAZE_VIEWPORT.h);

	    
	    
		
	    //title
	    ctx.fillStyle = "teal";
	    ctx.font = "34pt Trebuchet MS";
	    ctx.fillText("MetaMaze", world.MAZE_VIEWPORT.x, world.MAZE_VIEWPORT.y - 100);
	    ctx.drawImage(rm.images["player"],world.MAZE_VIEWPORT.x+200,world.MAZE_VIEWPORT.y - 130);
	    //instructions	    
	    ctx.fillStyle = "white";
	    ctx.fillRect(world.MAZE_VIEWPORT.x - 255,world.MAZE_VIEWPORT.y,245,325);
	    ctx.strokeStyle = "black";
	    ctx.strokeRect(world.MAZE_VIEWPORT.x - 255,world.MAZE_VIEWPORT.y,245,325);
	    //ctx.fillRect(world.MAZE_VIEWPORT.x + 325,world.MAZE_VIEWPORT.y,245,325);
	    //ctx.strokeRect(world.MAZE_VIEWPORT.x + 325,world.MAZE_VIEWPORT.y,245,325);
	    ctx.fillStyle = "black";
	    ctx.font = "14pt Arial";
	    ctx.fillText("How to Play",world.MAZE_VIEWPORT.x-245,world.MAZE_VIEWPORT.y + 20);
	    
	    ctx.font = "10pt Arial";
	    ctx.fillText("Use WASD or Arrow keys to move",world.MAZE_VIEWPORT.x-245,world.MAZE_VIEWPORT.y + 35);
	    
	    //music
	    ctx.drawImage(rm.images["music"],world.MAZE_VIEWPORT.x-250,world.MAZE_VIEWPORT.y + 35);
	    ctx.fillText("Press 'e' to play random music",world.MAZE_VIEWPORT.x-220,world.MAZE_VIEWPORT.y + 55);
	    //player
	    ctx.drawImage(rm.images["player"],world.MAZE_VIEWPORT.x-253,world.MAZE_VIEWPORT.y + 65);
	    ctx.fillText("This is you: Dr. Yermaze, Esquire",world.MAZE_VIEWPORT.x-220,world.MAZE_VIEWPORT.y + 80);
	    //pills
	    ctx.drawImage(rm.images["pill"],world.MAZE_VIEWPORT.x-252,world.MAZE_VIEWPORT.y + 100);
	    ctx.fillText("Red pills heal. @100%, Points +10",world.MAZE_VIEWPORT.x-220,world.MAZE_VIEWPORT.y + 110);
	    ctx.fillText("Purple pills keep you high.",world.MAZE_VIEWPORT.x-220,world.MAZE_VIEWPORT.y + 125);
	    ctx.fillText("You will lose health if you aren't high",world.MAZE_VIEWPORT.x-250,world.MAZE_VIEWPORT.y + 145);
	    //eyes
	    ctx.drawImage(rm.images["eye"],world.MAZE_VIEWPORT.x-250,world.MAZE_VIEWPORT.y + 150);
	    ctx.fillText("Eyes increase your vision by one",world.MAZE_VIEWPORT.x-220,world.MAZE_VIEWPORT.y + 170);
	    //money
	    ctx.drawImage(rm.images["dollar"],world.MAZE_VIEWPORT.x-250,world.MAZE_VIEWPORT.y + 175);
	    ctx.fillText("points +100. 1000 points = 1 life.",world.MAZE_VIEWPORT.x-220,world.MAZE_VIEWPORT.y + 195);
	    //shields
	    ctx.drawImage(rm.images["shield"],world.MAZE_VIEWPORT.x-250,world.MAZE_VIEWPORT.y + 200);
	    ctx.fillText("armor +1, points +50",world.MAZE_VIEWPORT.x-220,world.MAZE_VIEWPORT.y + 220);
	    //bugs
	    ctx.drawImage(rm.images["bug"],world.MAZE_VIEWPORT.x-250,world.MAZE_VIEWPORT.y + 230);
	    ctx.fillText("armor -1 or -15 health",world.MAZE_VIEWPORT.x-220,world.MAZE_VIEWPORT.y + 250);
	    //teles
	    ctx.drawImage(rm.images["tele"],world.MAZE_VIEWPORT.x-250,world.MAZE_VIEWPORT.y + 260);
	    ctx.fillText("Teleporters - Press 'e' to use",world.MAZE_VIEWPORT.x-218,world.MAZE_VIEWPORT.y + 275);
	    //stairs
	    ctx.drawImage(rm.images["exit"],world.MAZE_VIEWPORT.x-252,world.MAZE_VIEWPORT.y + 290);
	    ctx.fillText("Stairs to next level - Press 'e' to use",world.MAZE_VIEWPORT.x-223,world.MAZE_VIEWPORT.y + 306);

	    
	    ctx.translate(world.MAZE_VIEWPORT.w/4 + world.MAZE_VIEWPORT.x/2, world.MAZE_VIEWPORT.h +world.MAZE_VIEWPORT.y + 50);

	    pointsBar.draw(ctx);
	    ctx.fillStyle = "black";
	    ctx.font = "25pt Arial";
	    ctx.fillText("POINTS!!!",0, +55);
	    ctx.font = "15pt Arial";
	    ctx.fillText("Lives:", 0, -5);
	    ctx.fillText(lives, 60, -5);
	    
	    
	    ctx.translate(-world.MAZE_VIEWPORT.w/4 - world.MAZE_VIEWPORT.x/2, -world.MAZE_VIEWPORT.h -world.MAZE_VIEWPORT.y - 50);
	    ctx.translate(world.MAZE_VIEWPORT.x, world.MAZE_VIEWPORT.y - healthBar.height - 40);
	    ctx.fillStyle = "black";
	    ctx.font = "10px Arial";
	    ctx.fillText("Health",0,-5);
	    ctx.fillText("Pills",120,-5);
	    ctx.fillText("Shield",240,-5);
	    ctx.fillStyle = "black";
	    ctx.font = "25pt Arial";
	    ctx.fillText("lvl:" + countlvl, -120, 10);	    
	    
	    healthBar.draw(ctx);
	    ctx.translate(120,0);
	    pillBar.draw(ctx);
	    ctx.translate(120,0);
	    shieldBar.draw(ctx);
	    
	    


	    ctx.closePath();
	    ctx.restore();
	    
	},

	//we want predictable random numbers to regenerate levels with the same seed
	//really its a noise function but it will work for this purpose just fine

  	random: function() {
//	    return Math.round(Math.random() * 90000000000000);
	    seed += 1;
	    var x = Math.sin(Math.cos(Math.sin(seed))) * 10000;
	    x -= Math.floor(x);
	    return Math.round(x * 90000000000000); //big but less than intmax

	}
    };

})();

/* 
 * Begin definition of player object
 *
 */

function Player(a,b) {
    //player always starts at upper left for now
    this.moved = true;
    this.dx = 0;
    this.dy = 0;
    this.rx = 0;
    this.ry = 0;
    this.x = a;
    this.y = b;
    this.img = rm.images["player"];
    this.nextStep = false;
    this.use = false;
    this.listening = true;
    
    //extra counters
    this.health = 100
    this.pillTime = 0;
    this.vrange = 2;
};

Player.prototype.i = function() {
    return this.y * world.getLevel().width + this.x;
};

Player.prototype.move = function(from,to,time) {
    if (this.listening === true) {
	this.listening = false;
	this.dx = ((to.x * world.TILE_SIZE) - (from.x * world.TILE_SIZE)) / time;
	this.dy = ((to.y * world.TILE_SIZE) - (from.y * world.TILE_SIZE)) / time;
	this.rx = 0;
	this.ry = 0;
	this.dstx = to.x;
	this.dsty = to.y;
	this.time = time;
    }
    
};

Player.prototype.stop = function() {
    this.dx = 0;
    this.dy = 0;
    this.rx = 0;
    this.ry = 0;
    this.moved = true;
    this.x = this.dstx;
    this.y = this.dsty;
    this.listening = true;
};

Player.prototype.update = function(dt) {
    this.pillTime += dt;
    var stack;
    if (this.pillTime > 1200) {
	this.pillTime = this.pillTime - 1200;
	var leftover = world.getPillBar().update(-1) * 10;
	world.getHealthBar().update(leftover);
	if (world.getHealthBar().current <= 0){
	
	    world.changeLives(-1);
	    game.setStateStack(game.DEAD);
	} 
    }
    this.rx += this.dx * dt;
    this.ry += this.dy * dt;
    this.time -= dt;
    if (this.time <= 0) {
	this.stop();
	this.time = 0;
    }
};

Player.prototype.loc = function() {
    return {x:this.x,y:this.y};
};

Player.prototype.draw = function(ctx) {
    ctx.save();
    ctx.drawImage(this.img,this.rx,this.ry);
    ctx.restore();
};

/*
 * Begin definition of an object to interact with
 */

function GameObject(image, activate, auto, a, b) {
    if (auto === false)
	this.auto = false;
    else
	this.auto = true;
    this.img = image;
    this.activate = activate;
    
    this.moved = true;
    this.dx = 0;
    this.dy = 0;
    this.rx = 0;
    this.ry = 0;
    this.x = a;
    this.y = b;
}

GameObject.prototype.i = function() {
    return this.y * world.getLevel().width + this.x;
};

GameObject.prototype.loc = function() {
    return {x:this.x,y:this.y};
};

GameObject.prototype.steppedOn = function() {
    if (this.activate !== undefined && typeof this.activate === "function") {
	this.activate();
    }
};


GameObject.prototype.update = function(dt) {
    console.log(this.dx, this.dy);
    this.rx += this.dx * dt;
    this.ry += this.dy * dt;
    this.time -= dt;
    if (this.time <= 0) {
	this.stop();
	this.time = 0;
    }
};


GameObject.prototype.stop = function() {
    this.dx = 0;
    this.dy = 0;
    this.rx = 0;
    this.ry = 0;
    this.moved = true;
    var me = this.tiles[this.i()];
    this.tiles[this.i()].content = undefined;
    console.log("before",this.x,this.y);
    this.x = this.dstx;
    this.y = this.dsty;
    console.log("After",this.x,this.y);
    this.tiles[this.i()].content = me;
    
};

GameObject.prototype.move = function(from,to,time) {
    console.log("move");
    this.dx = ((to.x * world.TILE_SIZE) - (from.x * world.TILE_SIZE)) / time;
    this.dy = ((to.y * world.TILE_SIZE) - (from.y * world.TILE_SIZE)) / time;
    this.rx = 0;
    this.ry = 0;
    this.dstx = to.x;
    this.dsty = to.y;
    this.time = time;
};

GameObject.prototype.draw = function(ctx) {
    ctx.save();
    ctx.drawImage(this.img,this.rx,this.ry);
    ctx.restore();
};

/*
 * Begin Level object definition
 *
 * A level is a grid with a certain width of tiles as well as definitions
 * of puzzle element locations
 */

function Level(width) {
    this.width = width;
    this.height = width; //square
    this.size = width*width;
    this.tiles = [];
    this.uf = new UnionFind();
    

    //setup maze with 100% walls
    var x = 0;
    var y = 0;
    for (var i = 0 ; i < this.size ; i++) {
	this.tiles[i] = new Tile(i,x,y,0xF);
	x++;
	if (x === width) {
	    x = 0;
	    y++;
	}
    }
    
    //build objects for generating the maze
    this.uf.makeSet(this.size);

    //makes handling walls easier
    walls = [world.RIGHT, world.BOTTOM, world.LEFT, world.TOP];


    //pregenerate all possible walls
    var wallList = [];
    for (var i = 0 ; i < this.size ; i++) {
	for (var j = 0 ; j < 4 ; j++) {
	    wallList.push(i+","+j);
	}
    }

    //start removing walls and generating the maze
    while (this.uf.count !== 1) {

	//pick a random tile to remove a wall from
	var choice = wallList.splice(world.random() % wallList.length,1)[0];
	choice = choice.split(",");
	var t1 = choice[0];
	var w = choice[1];
	
	//try to remove the wall if it exists
	if (this.tiles[t1].hasWall(walls[w])) {
	    var t2 = this.tiles[t1].throughWall(walls[w], width);
	    if (t2 !== undefined) {
		//check to see if t1 and t2 already have a path between them
		if (this.uf.find(t1) !== this.uf.find(t2)) {		    
		    //remove w from t1 and remove opposite(w) from t2
		    this.tiles[t1].removeWall(walls[w]);
		    this.tiles[t2].removeWall(opposite(walls[w]))
		    this.uf.union(t1,t2);
		}
	    }
	}
    }

    var baseSet = [];
    for (var i = 0 ; i < this.size ; i++) {
	baseSet.push(i);
    }

    var r = divideMaze(baseSet, this.tiles, this);
    this.tiles = r.tiles;
    var sets = r.sets;


    function randomLocation() {
	var s = world.random() % sets.length;
	var loc = sets[s].splice(world.random() % sets[s].length, 1)[0];
	if (loc === undefined) //didn't have any space left in a partition
	    return randomLocation();
	return loc;
    }
    

    function randomLocationFromSet(s) {
	if (sets[s].length === 0) return undefined;
	return sets[s].splice(world.random() % sets[s].length, 1)[0];
    }
    
    var ploc = randomLocation();
    world.setPlayer(new Player(ploc % width,Math.floor(ploc / width)));
    
    
    //place exit
    var eloc = randomLocation();
    this.tiles[eloc].content = new GameObject(rm.images["exit"], 
 					      function () { 
						  rm.playSound("stairs");
 						  world.nextLevel(1);
 					      },
 					      false);  

    //place teleporters

    var teles = [];
    this.uf.makeSet(sets.length);

    while (this.uf.count !== 1) {
	//link set a and set b if unlinked
	var sa = world.random() % sets.length;
	var sb = world.random() % sets.length;
	
	if(this.uf.find(sa) !== this.uf.find(sb)) {
	    var la = randomLocationFromSet(sa);
	    var lb = randomLocationFromSet(sb);
	    if (la === undefined || lb === undefined) continue;
	    
	    var rand1 = {
    		x: la % width,
    		y: Math.floor(la / width)
	    };
	    var rand2 = {
    		x: lb % width,
    		y: Math.floor(lb / width)
	    };

	    teles = teles.concat(specialTiles.generateTeleporterPair(rand1, rand2,
    								     $V([world.random() % 255,//give it a random color (for now)
    									 world.random() % 255,
    									 world.random() % 255])));
	    

	    this.uf.union(sa,sb);
	}
    }
    

    //place the teleporters
    var that = this;    
    teles.map(function (e) {
	that.tiles[e.y * width + e.x].content = e;
    });


    //place eyes
    for (var i = 0 ; i < sets.length ; i++) { //1 per partition at least
	var loc = randomLocationFromSet(i);
	if (loc === undefined) continue;
	specialTiles.makeEye(loc, that);
    }
    var eyes = world.random() % Math.ceil(width / 2.5);//a few extras
    for (var i = 0 ; i < eyes ; i++) {
	specialTiles.makeEye(randomLocation(), that);
    }
    
    //add pills
    for (var i = 0 ; i < width * (Math.log(width)/Math.log(2))/3; i++) {
	specialTiles.makePills(randomLocation(), that);
    }

    //add enemies and shields 1-1 proportion
    var combatStuff = world.random() % Math.ceil(Math.sqrt(width));
    for (var i = 0 ; i < combatStuff ; i++) {
	x = randomLocation();
	specialTiles.makeEnemy(x, that);
	console.log("adding", this.tiles[x].content);
	
	world.pushBug(this.tiles[x].content);
    }
    for (var i = 0 ; i < combatStuff - 1; i++) {
	specialTiles.makeShield(randomLocation(), that);
    }

    //dollar, yo
    for (var i = 0 ; i < Math.ceil(width/10) ; i++) {
	specialTiles.makeDollars(randomLocation(), that);
    }

    //music
    for (var i = 0 ; i < (width/4) ; i++) {
	specialTiles.makeMusic(randomLocation(), that);
    }
}

Level.prototype.getAdjacentTiles = function(i) {
    var results = [];
    var tile = this.tiles[i];
    for (var i = 0 ; i < 4 ; i++) {
	var wall = Math.pow(2,i);
	if (tile.hasWall(wall) === false) {
	    var target = tile.throughWall(wall, this.width);
	    if (target !== undefined) {
		results.push(target);
	    }
	}
    }
    return results;
};

Level.prototype.test = function() {
    for (var i = 0 ; i < this.tiles.length ; i++) {
	console.log(i, this.getAdjacentTiles(i));
    }
}

Level.prototype.getWidth = function() {
    return this.width * world.TILE_SIZE;
};

Level.prototype.getIFromXY = function(x,y) {
    return x * this.width + y;
};

Level.prototype.getHeight = function() {
    return this.height * world.TILE_SIZE;
};

Level.prototype.log = function() {
    var str = "";
    var c = 0;
    for (var i = 0 ; i < this.size ; i++) {
	str += this.tiles[i].hex.toString(16);
	c++;
	if (c === this.width) {
	    c = 0;
	    console.log(str.toUpperCase());
	    str = "";
	}
    }
};

Level.prototype.draw = function(ctx) {
    ctx.save();

    var camerax = Math.min(this.getWidth() - world.MAZE_VIEWPORT.w,
			   Math.max(0,(world.getPlayer().x * world.TILE_SIZE + world.getPlayer().rx + 16) - (world.MAZE_VIEWPORT.w / 2)));
    var cameray = Math.min(this.getHeight() - world.MAZE_VIEWPORT.h,
			   Math.max(0,(world.getPlayer().y * world.TILE_SIZE + world.getPlayer().ry + 16) - (world.MAZE_VIEWPORT.h / 2)));

    ctx.translate(world.MAZE_VIEWPORT.x,
		  world.MAZE_VIEWPORT.y);

    ctx.translate(-camerax,-cameray);

    ctx.strokeStyle = "black";    

    for (var i = 0 ; i < this.size ; i++) {
	this.tiles[i].draw(ctx);
    }

    for (var i = 0 ; i < this.size ; i++) {
	this.tiles[i].drawContent(ctx);
    }

    for (var i = 0 ; i < this.size ; i++) {
	this.tiles[i].drawWalls(ctx);
    }

    
    ctx.restore();
};


/*
 * Begin Tile object definition
 *
 * A tile is an element of the maze that may contain other elements
 * It also defines its own walls.
 */

function Tile(i,x,y,hex) {
    this.x = x;
    this.y = y;
    this.i = i;
    this.hex = hex;
    this.explored = false;
    this.isvisible = false;
    this.content = undefined;
}

Tile.prototype.hasWall = function(wall) {
    return ((this.hex & wall) === wall);
};

Tile.prototype.removeWall = function(wall) {
    this.hex -= wall;
};

Tile.prototype.addWall = function(wall) {
    this.hex += wall;
};


Tile.prototype.throughWall = function(wall, width) {
    if (wall === world.LEFT) {
	if (this.x === 0) return undefined;
	return this.i - 1;
    }
    if (wall === world.RIGHT) {
	if (this.x === width - 1) return undefined;
	return this.i + 1;
    }
    if (wall === world.BOTTOM) {
	if (this.y === width - 1) return undefined;
	return this.i + width;
    }
    if (wall === world.TOP) {
	if (this.y === 0) return undefined;
	return this.i - width;
    }
};


Tile.prototype.draw = function(ctx) {
    ctx.save();
    ctx.translate(this.x*world.TILE_SIZE,this.y*world.TILE_SIZE);

    if (this.explored === true){
	ctx.fillStyle = "grey";
	ctx.fillRect(0,0,world.TILE_SIZE+1,world.TILE_SIZE+1);
	
    }
    if (this.isvisible){
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,world.TILE_SIZE+1,world.TILE_SIZE+1);
    }

    ctx.restore();
};

Tile.prototype.drawContent = function(ctx){
    ctx.save();
    ctx.translate(this.x*world.TILE_SIZE,this.y*world.TILE_SIZE);
    
    ctx.beginPath();
    if (this.content !== undefined) {
	this.content.draw(ctx);
    }
    if (this.x === world.getPlayer().x &&
	this.y === world.getPlayer().y) {
	this.explored = true;
	world.getPlayer().draw(ctx);
    }


    ctx.restore();
};

Tile.prototype.drawWalls = function(ctx) {
    ctx.save();
    ctx.translate(this.x*world.TILE_SIZE,this.y*world.TILE_SIZE);
    
    ctx.beginPath();
    if (this.hasWall(world.RIGHT)) { //has a right wall
	ctx.moveTo(world.TILE_SIZE,
		   0);
	ctx.lineTo(world.TILE_SIZE,
		   world.TILE_SIZE);
    }
    if (this.hasWall(world.BOTTOM)) { //has a bottom
	ctx.moveTo(0,
		   world.TILE_SIZE);
	ctx.lineTo(world.TILE_SIZE,
		   world.TILE_SIZE);   
    }
    if (this.hasWall(world.LEFT)) { //has left wall
	ctx.moveTo(0,
		   0);
	ctx.lineTo(0,
		   world.TILE_SIZE);
    }
    if (this.hasWall(world.TOP)) { //has top wall
	ctx.moveTo(0,
		   0);
	ctx.lineTo(world.TILE_SIZE,
		   0);	    
    }
    
    ctx.stroke();

    
    //lastly draw black fog
    if (this.explored ===false){
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,world.TILE_SIZE+1,world.TILE_SIZE+1);
    }    
    ctx.restore();
};
