
//load resources in for Dr. Yermaze game

var rm = (function(){
    var resources;
    var resourcesLoaded;
    var loadingBar;

    return{

	ResourceType:{ 
	    IMAGE: 0,
	    SOUND: 1,
	},


	images: {},
	sounds: {},

	init: function(onPartial, onComplete){
	    resources = [];
	    resourcesLoaded = 0;

	    if (onPartial !== undefined && typeof(onPartial) === "function") {
		rm.onPartial = onPartial;
	    }

	    if (onComplete !== undefined && typeof(onComplete) === "function") {
		rm.onComplete = onComplete;
	    }
	},
	
	addResource: function(name, filePath, fileType, resourceType){
	    var res = {
		name: name,
		filePath: filePath,
		fileType: fileType,
		resourceType: resourceType
	    };

	    resources.push(res);
	},
	
	startPreloading: function(){
	    //generate loading bar

	    loadingBar = new Bar($(window).width() / 2, 25, 
				 resources.length, "red", "black");

	    for(var i = 0 ; i < resources.length ; i++){
		switch(resources[i].resourceType){
		    
		case rm.ResourceType.IMAGE:
		    var img = new Image();
		    
		    img.src = resources[i].filePath;
		    img.addEventListener('load', function() { rm.onResourceLoaded(); }, false);
		    rm.images[resources[i].name] = img;
		    break;

		case rm.ResourceType.SOUND:
		    var a = newAudio();

		    //load files we can play only
		    if(a.canPlayType(resources[i].fileType) === "maybe" || 
		       a.canPlayType(resources[i].fileType) === "probably"){
			
			a.src = resources[i].filePath;
			a.type = resources[i].fileType;

			
			a.addEventListener('canplaythrough', function(){
			    a.removeEventListener('canplaythrough', arguments.callee, false);
			    rm.onResourceLoaded();
			}, false);

			rm.sounds[name] = a;
		    }else{
			//assume resource is loaded even if it doesn't load
			rm.onResourceLoaded();
		    }
		    break;
		}
		
	    }
	
	},
	
	onResourceLoaded: function(){
	    resourcesLoaded++;
	    loadingBar.update(1);
	    
	    if(rm.onPartial != undefined){
		rm.onPartial();
	    }

	    if(resourcesLoaded == resources.length){
		if(rm.onComplete != undefined){
		    rm.onComplete();
		}
	    }
	},
	
	isloadComplete: function(){	    
	    return (resource.length == resourcesLoaded);
	},
	
	draw: function(ctx) {
	    ctx.save();
	    ctx.translate($(window).width() / 4,
			  $(window).height() / 3);
	    ctx.fillStyle = "black";
	    ctx.font = "50pt Arial";
	    var txt = "Loading!";
	    var offset = loadingBar.width / 2 - ctx.measureText(txt).width / 2;

	    ctx.fillText("Loading!",offset,0);

	    ctx.translate(0,$(window).height() / 3);
	    loadingBar.draw(ctx);
	    ctx.restore();
	},

    };
	  
})();





