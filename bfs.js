var bfs = (function() {

    return {
	bfs: function(start, level, depth) {
	    var depth = depth || Infinity;
	    var parents = [];
	    var depths = [];
	    var Q = []; //search queue
	    var V = []; //found
	    V.push(start);
	    Q.push(start);
	    depths.push(1);
	    parents[start] = undefined;
	    while (Q.length !== 0) {
		var t = Q.shift();
		var d = depths.shift();
		if (d > depth) continue;//hit max depth ignore and keep going
		var adjacent = level.getAdjacentTiles(t);
		for (var i = 0 ; i < adjacent.length ; i++) {
		    var u = adjacent[i];
		    if (V.indexOf(u) <= -1) {
			V.push(u);
			Q.push(u);
			depths.push(d+1);
			console.log(u);
			parents[u] = t;
		    }
		}
	    }
	   
	    return parents; //length of parents should be how many tiles were found
	}
    }
})();
