

var world = (function() {
    
    var currentLevel = undefined;
    var seed = 1;
    var player;

    return {
	//a few global variables
	MAZE_VIEWPORT_OFFSET: { 
	    x: 100, 
	    y: 100 
	},

	TILE_SIZE: 32,
	RIGHT: 0x1,
	BOTTOM:0x2,
	LEFT: 0x4,
	TOP: 0x8,

	//public functions
	init: function(size, newSeed) {
	    seed = newSeed;
	    currentLevel = new Level(size);
	    player = new Player();
	},

	nextLevel: function() {
	    world.init(currentLevel.width+1,seed);
	},

	update: function(dt) {
	    console.log(player.nextStep);
	    if (player.nextStep === "up" && 
		!currentLevel.tiles[player.i].hasWall(world.TOP)) {
		player.nextStep = undefined;
		player.y -= 1;
		currentLevel.tiles[player.i].content = undefined;
		player.i -= currentLevel.width;
		if (currentLevel.tiles[player.i].content !== undefined)
		    currentLevel.tiles[player.i].content.steppedOn();
		currentLevel.tiles[player.i].content = player;
		
	    }
	    if (player.nextStep === "down" && 
		!currentLevel.tiles[player.i].hasWall(world.BOTTOM)) {
		player.nextStep = undefined;
		player.y += 1;
		currentLevel.tiles[player.i].content = undefined;
		player.i += currentLevel.width;
		if (currentLevel.tiles[player.i].content !== undefined)
		    currentLevel.tiles[player.i].content.steppedOn();
		currentLevel.tiles[player.i].content = player;
	    }
	    if (player.nextStep === "left" && 
		!currentLevel.tiles[player.i].hasWall(world.LEFT)) {
		player.nextStep = undefined;
		player.x -= 1;
		currentLevel.tiles[player.i].content = undefined;
		player.i -= 1;
		if (currentLevel.tiles[player.i].content !== undefined)
		    currentLevel.tiles[player.i].content.steppedOn();
		currentLevel.tiles[player.i].content = player;
	    }
	    if (player.nextStep === "right" && 
		!currentLevel.tiles[player.i].hasWall(world.RIGHT)) {
		player.nextStep = undefined;
		player.x += 1;
		currentLevel.tiles[player.i].content = undefined;
		player.i += 1;
		if (currentLevel.tiles[player.i].content !== undefined)
		    currentLevel.tiles[player.i].content.steppedOn();
		currentLevel.tiles[player.i].content = player;
	    }
	    
	},

	getPlayer: function() {
	    return player;
	},

	draw: function(ctx) {
	    currentLevel.draw(ctx);
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
    this.x = 0;
    this.y = 0;
    this.i = 0;
    this.img = rm.images["player"];
    this.nextStep = undefined;
}

Player.prototype.draw = function(ctx) {
    ctx.save();
    ctx.drawImage(this.img,0,0);
    ctx.restore();
}

/*
 * Begin definition of an object to interact with
 */

function GameObject(image, activate) {
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
    

    //start removing walls and generating the maze
    while (this.uf.count !== 1) {
	//pick a random tile to remove a wall from

	var t1 = world.random() % this.size; //cell to start from
	var w = world.random() % 4; //wall to remove
	
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

    //place the player in 0,0
    player = new Player();
    this.tiles[0].content = player;

    //place the stairs at the exit
    this.tiles[this.tiles.length-1].content = new GameObject(rm.images["exit"], 
							     world.nextLevel);
    
}

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
    ctx.translate(world.MAZE_VIEWPORT_OFFSET['x'],
		  world.MAZE_VIEWPORT_OFFSET['y']);
    ctx.strokeStyle = "black";    

    for (var i = 0 ; i < this.size ; i++) {
	this.tiles[i].draw(ctx);
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
    this.content = undefined;
}

Tile.prototype.hasWall = function(wall) {
    return ((this.hex & wall) === wall);
};

Tile.prototype.removeWall = function(wall) {
    this.hex -= wall;
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
    if (this.content !== undefined) {
	this.content.draw(ctx);
    }
    ctx.stroke();
    ctx.restore();
};

