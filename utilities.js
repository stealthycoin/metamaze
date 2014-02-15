//A simple timer class
var Timer = function() {
    this.date = new Date();
}

Timer.prototype.update = function() {
    var d = new Date();
    this.date = d;
    return this;
}

Timer.prototype.getMilliseconds = function() {
    return this.date.getTime();
}

Timer.prototype.getSeconds = function() {
    return Math.round(this.date.getTime() / 1000);
}


//basic body object
var Body = function(p, m, r, c) {
    this.p = p || p$V([0,0]);
    this.v = $V([0,0]);
    this.a = $V([0,0]);
    this.mass = m;
    this.forces = [];
    this.color = c;
    this.r = r;
}

Body.prototype.setVelocity = function(v) {
    this.v = v;
}

Body.prototype.update = function(dt) {
    //sum the forces
    var total = this.forces.reduce(function(pv,cv,i,a) { 
	return pv.add(cv); 
    }, $V([0,0]));

    // F = ma -> a = F/m
    this.a = total.multiply(1/this.mass);

    //scale acceleration with respect to time
    var scaledA = this.a.multiply(dt);

    //add accel to velocity then velocity to position
    this.v = this.v.add(scaledA);
    this.p = this.p.add(this.v);


    //clear the forces
    this.forces = [];
}

Body.prototype.applyForce = function(v) {
    this.forces.push(v);
}

Body.prototype.draw = function(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.p.elements[0], 
	    this.p.elements[1], 
	    this.r, 0, 2 * Math.PI, false);
    
    ctx.strokeStyle = "black"
    ctx.fill();
    ctx.stroke();
}

/*
 * Begin Union-Find for maze generation
 * Naieve implementation because the timeframe I have to make this
 */

function UnionFind() {
    this.count = 0;
    this.sets = [];
}

UnionFind.prototype.makeSet = function(x) {
    this.sets = new Array(x);
    for (var i = 0 ; i < x ; i++) {
	this.sets[i] = i;
    }
    this.count = x;
};

UnionFind.prototype.find = function(x) {
    if (x === this.sets[x]) {
	return x;
    }
    return this.find(this.sets[x]);
};

UnionFind.prototype.union = function(x,y) {
    xroot = this.find(x);
    yroot = this.find(y);
    this.sets[xroot] = yroot;
    this.count--;
};

UnionFind.prototype.log = function() {
    console.log(this.sets);
}

/*
 * Begin Bar object
 * Bars simple represent a percentange of something
 */

function Bar(width, height, max, color, border) {
    this.width = width;
    this.height = height;
    this.max = max;
    this.color = color;
    this.border = border;
    this.current = 0;
    this.borderWidth = 2;
}

Bar.prototype.update = function(qty) {
    this.current += qty;
    this.current = Math.min(this.current, this.max);
};

Bar.prototype.draw = function(ctx) {
    var progress = this.current / this.max * this.width;
    ctx.lineWidth = this.borderWidth;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.border;

    ctx.beginPath();
    ctx.rect(0,0,progress,this.height);
    ctx.fill();

    ctx.beginPath();
    ctx.rect(0,0,this.width,this.height);
    ctx.stroke();
};
