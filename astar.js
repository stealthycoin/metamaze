//A* bitches


var astar = (function(start, end, neighbor_nodes) {

//neighbor_nodes an array of pointers to other tiles that it is nxt to

    var blackset = []; //nodes already evaluated 
    var openset = {start}; //coordinates to be evaulated and all of the coordinates around it
    var came_from = {};
    var i = 0;
    gscore = 0; //cost from start to end along best known path
    //fscore = gscore //est. total cost from start to end player position?
    
    while (openset !== null){

	current = openset[i]; //player starting position initially?
	if (current === end){
	    return reconstruct_path(came_from,end); 
	}

	openset[i] = null;
	blackset[i] = current;
	for(neighbor_nodes[current] !== null){
	    
	    if (blackset.indexOf(current) !== undefined){
		continue;
	    }

	    tentative_gscore = gscore[current] + dist_between[current,neighbor]

	    if (blackset.indexOf(current) === undefined || tentative_gscore < gscore[neighbor]){
		
		gscore[neighbor] = tentative_gscore;
		//fscore[neighbor] = gscore[neighbor]; 
		if (openset.indexOf(neighbor) === undefined){
		    openset[i] = neighbor;
		}


	    }


	}
	
    } 
    return false;

}); 

function reconstruct_path(came_from, current){

    if (came_from.indexOf(current) !== undefined){
	p = reconstruct_path(came_from, came_from[current]);
	return (p+current);
    }else{
	return current;
    }
    
};