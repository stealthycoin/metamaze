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
var Body = function(p, m, c) {
    this.p = p || p$V([0,0]);
    this.v = $V([0,0]);
    this.a = $V([0,0]);
    this.mass = m;
    this.forces = [];
    this.color = c;
}

Body.prototype.setVelocity = function(v) {
    this.v = v;
}

Body.prototype.update = function(dt) {
    console.log(this.forces);
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
	    this.mass, 0, 2 * Math.PI, false);
    ctx.fill();
}
