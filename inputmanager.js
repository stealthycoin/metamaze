

//input manager. Read in all the keys

function im (){

    this.keyState = [];
    this.currentKey = [];
    this.keyLast = [];

    var self = this;

    window.addEventListener('keydown', function(ev){
	self.keyCurrent[ev.which] = true;
	self.keyState[ev.which] = true;

    });

    window.addEventListener('keyup', function(ev){
	self.keyState[ev.which] = false;

    });

}


im.prototype.update = function(){

    this.keyLast = this.keyCurrent;
    this.keyCurrent = this.keyState.slice(0);

};

im.prototype.isKeyDown = function(key){

    return !!this.keyCurrent[key];

};


im.prototype.isKeyReleased = function(key){
    
    return !this.keyCurrent[key] && this.keyLast[key];
}
