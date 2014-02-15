
//load resources in for Dr. Yermaze game

var rm = (function(){
    
    

    var resources;
    var resourcesLoaded;

    return{

	ResourceType:{ 
	    IMAGE: 0,
	    SOUND: 1,
	},


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
	
	addResource: function(filePath, fileType, resourceType){
	    var res = {
		filePath: filePath,
		fileType: fileType,
		resourceType: resourceType
	    };

	    resources.push(res);
	},
	
	startPreloading: function(){
	  
	    console.log("it works?");
	    
	    for(var i =0, len = resources.length; i<len; i++){
		switch(resources[i].resourceType){
		    
		case rm.ResourceType.IMAGE:
		    var img = new Image();
		    
		    img.src = resources[i].filePath;
		    img.addEventListener('load', function() { rm.onResourceLoaded(); }, false);
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

	    if(resources.onPartial != undefined){
		resources.onPartial();
	    }

	    if(resourcesLoaded == resources.length){
		if(resources.onComplete != undefined){
		    resources.onComplete();
		}
	    }
	    return;
	},
	
	isloadComplete: function(){
	    
	    if(resource.length == resourcesLoaded){
		return true;
	    }
	    
	    return false;
	}

    };
	  
})();





