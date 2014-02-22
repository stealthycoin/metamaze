

//input manager. Read in all the keys

function InputManager (){

    this.keyState = [];
    this.keyCurrent = [];
    this.keyLast = [];
    this.key = {
	'e': 69,
	'w':87,
	'a':65,
	's':83,
	'd':68,
	'left':37,
	'right':39,
	'arriba':38,
	'abajo':40
    };

    var self = this;

    window.addEventListener('keydown', function(ev){
	self.keyCurrent[ev.which] = true;
	self.keyState[ev.which] = true;

    });

    window.addEventListener('keyup', function(ev){
	self.keyState[ev.which] = false;

    });
}


InputManager.prototype.update = function(){

    this.keyLast = this.keyCurrent;
    this.keyCurrent = this.keyState.slice(0);

};

InputManager.prototype.isKeyDown = function(key){

    return !!this.keyCurrent[key];

};


InputManager.prototype.isKeyReleased = function(key){
    
    return !this.keyCurrent[key] && !!this.keyLast[key];
}
