// Collider Editor enables quick getting coordinates for Colliders
JackDanger.AgentJackIEC.prototype.ColliderEditor = function (game) {
	this.isDrawing = false;
	this.startingPoint = new Phaser.Point(0, 0);
	this.endPoint = new Phaser.Point(0, 0);
	this.game = game;
};

JackDanger.AgentJackIEC.prototype.ColliderEditor.prototype = {
	
	// Start Collider Drawing
	startColliderDrawing: function () {
		if (this.isDrawing)
			return;
				
		this.isDrawing = true;
		this.startingPoint = new Phaser.Point(this.game.input.worldX, this.game.input.worldY);
	},
	
	// Update Collider Size
	updateColliderDrawing: function () {
		if (!this.isDrawing)
			return;
		
		this.endPoint = new Phaser.Point(this.game.input.worldX, this.game.input.worldY);
		this.game.debug.geom(new Phaser.Rectangle(this.startingPoint.x, this.startingPoint.y, this.endPoint.x - this.startingPoint.x, this.endPoint.y - this.startingPoint.y));
	},
	
	// End Collider Drawing
	endColliderDrawing: function () {
		if (!this.isDrawing)
			return;
		
		this.isDrawing = false;
		this.endPoint = new Phaser.Point(this.game.input.worldX, this.game.input.worldY);
		
		var x = (this.startingPoint.x < this.endPoint.x) ? this.startingPoint.x : this.endPoint.x;
		var y = (this.startingPoint.y < this.endPoint.y) ? this.startingPoint.y : this.endPoint.y;
		var width = (this.startingPoint.x < this.endPoint.x) ? this.endPoint.x - this.startingPoint.x : this.startingPoint.x - this.endPoint.x;
		var height = (this.startingPoint.y < this.endPoint.y) ? this.endPoint.y - this.startingPoint.y : this.startingPoint.y - this.endPoint.y;
		
		logInfo(this.game);
		
		logInfo(JSON.stringify({
			x: x - 113,
			y: this.game.world.height - y,
			width: width/this.game.main.globalScale,
			height: height/this.game.main.globalScale
		}));
	}
};