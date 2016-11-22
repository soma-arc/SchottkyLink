var BfsManager = function(schottkyCircles){
    this.schottkyCircles = schottkyCircles;
    console.log(schottkyCircles);
    this.maxLevel = 5;
}

BfsManager.prototype = {
    run: function(){
        this.orbits = [];
        this.orbits.push(this.schottkyCircles); // level 0
        for(var level = 1 ; level < this.maxLevel ; level++){
            this.orbits.push([]);
            for(var i = 0 ; i < this.orbits[level - 1].length ; i++){
                var orbitCircle = this.orbits[level-1][i];
                for(var j = 0 ; j < this.schottkyCircles.length ; j++){
                    var nc = this.schottkyCircles[j].applyTransformation(orbitCircle);
                    this.orbits[level].push(nc);
                }
            }
        }
        return this.orbits;
    }
}
