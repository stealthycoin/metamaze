
var world = (function() {
    
    var currentLevel = undefined;
    var seed = 1;
    var player;
    var BORDER = 100;
    var player_speed = 250; //player move speed
    var countlvl;
    
    return {
	//a few global variables
	MAZE_VIEWPORT_T: { 
	    x: BORDER,
	    y: BORDER,
	    w: $(window).width() -2*BORDER,
	    h: $(window).height()-BORDER
	},

	TILE_SIZE: 32,
	RIGHT: 0x1,
	BOTTOM:0x2,
	LEFT: 0x4,
	TOP: 0x8,

	//public functions
	init: function(size, newSeed) {
	    countlvl = 1;
	    seed = newSeed;
	    currentLevel = new Level(size,player);
	    world.setViewport(size);
	    player = new Player();
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

	nextLevel: function() {
	    countlvl++;
	    world.init(currentLevel.width+1,seed);
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
	    
	    

	    var adjtiles = bfs.bfs(player.i(), currentLevel, player.vrange)

	    if (player.moved === true){
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
	    
	},

	getPlayer: function() {
	    return player;
	},

	getLevel: function() {
	    return currentLevel;
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
	    ctx.strokeRect(world.MAZE_VIEWPORT.x,
			   world.MAZE_VIEWPORT.y,
			   world.MAZE_VIEWPORT.w,
			   world.MAZE_VIEWPORT.h);

	    
	    ctx.fillStyle = "black";
	    ctx.font = "25pt Arial";
	    ctx.fillText(countlvl, world.MAZE_VIEWPORT.x, world.MAZE_VIEWPORT.y - 5)
/*
	    ctx.fillStyle = "black";
	    ctx.fillRect(world.MAZE_VIEWPORT.x,
			   world.MAZE_VIEWPORT.y,
			   world.MAZE_VIEWPORT.w,
			   world.MAZE_VIEWPORT.h);
*/	    
	    ctx.closePath();
	    ctx.restore();
	},

	//we want predictable random numbers to regenerate levels with the same seed
	//really its a noise function but it will work for this purpose just fine
	random: function() {
	    var x = Math.sin(seed++) * 10000;
	    x -= Math.floor(x);
	    return Math.round(x * 90000000000000); //big but less than intmax

	}
    };

})();

/* 
 * Begin definition of player object
 *
 */

function Player() {
    //player always starts at upper left for now
    this.moved = true;
    this.dx = 0;
    this.dy = 0;
    this.rx = this.x = 0;
    this.ry = this.y = 0;
    this.img = rm.images["player"];
    this.nextStep = false;
    this.use = false;
    this.listening = true;
    this.vrange = 4;
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

function GameObject(image, activate, auto) {
    if (auto === false)
	this.auto = false;
    else
	this.auto = true;
    this.img = image;
    this.activate = activate;
}

GameObject.prototype.steppedOn = function() {
    if (this.activate !== undefined && typeof this.activate === "function") {
	this.activate();
    }
}

GameObject.prototype.draw = function(ctx) {
    ctx.save();
    ctx.drawImage(this.img,0,0);
    ctx.restore();
}

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
    var opposite = function(wall) {
	if (wall === world.RIGHT)  return world.LEFT;
	if (wall === world.LEFT)   return world.RIGHT;
	if (wall === world.BOTTOM) return world.TOP;
	if (wall === world.TOP)    return world.BOTTOM;
    };

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


    //make an array of the tile coordiantes
    var cMap = [];
    for(var i=0; i<width; i++){
	for(var j=0;j<width;j++){
	    cMap.push({x:i,y:j})
	}
    }
    
    cMap.splice((this.width*this.width)-1,1);
    cMap.splice(0,1);
    
    //currently does not work, teles still appear on the origin places of the player position and the exit tile. I don't know why.
   // console.log(cMap[world.random() % (this.width * this.width)].x)

    

    //place the player in 0,0
    player = new Player();
    
    //place the stairs at the exit
    this.tiles[this.tiles.length-1].content = new GameObject(rm.images["exit"], 
							     world.nextLevel);

    //place two teleporters

    var rand1 = cMap[world.random() % ((this.width * this.width) -2)];
    var rand2 = cMap[world.random() % ((this.width * this.width) -2)];
    while(rand1 === rand2){
	rand2 = cMap[world.random() % ((this.width * this.width) -2)];
    }
    
    var teles = specialTiles.generateTeleporterPair({x: rand1.x,
						     y: rand1.y
						    },
						    {x: rand2.x,
						     y: rand2.y
						    }, $V([world.random() % 255,//give it a random color (for now)
							   world.random() % 255,
							   world.random() % 255]));
    var that = this;
    teles.map(function (e) {
	that.tiles[e.y * width + e.x].content = e;
    });

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
	this.tiles[i].drawcontent(ctx);
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

Tile.prototype.drawcontent = function(ctx){
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
    if (this.explored ===false){
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,world.TILE_SIZE,world.TILE_SIZE);
    }

    ctx.restore();
};

Tile.prototype.draw = function(ctx) {
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
        
    if (this.explored === true){
	ctx.fillStyle = "grey";
	ctx.fillRect(0,0,world.TILE_SIZE,world.TILE_SIZE);
	
    }
    if (this.isvisible){
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,world.TILE_SIZE,world.TILE_SIZE);
	
    }
    
    
    
    
    //if(this.)
    ctx.stroke();
    ctx.restore();
};

