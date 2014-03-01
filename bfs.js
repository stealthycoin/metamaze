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
			parents[u] = t;
		    }
		}
	    }
	    var size = 0;
	    parents.map(function(e) { size++; });
	    return {size:size,p:parents};
	}
    }
})();

