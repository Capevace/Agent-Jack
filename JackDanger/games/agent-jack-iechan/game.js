/*
Game Name: Agent Jack "I. Chan" Danger
Game type: Fighting Game
*/



//   _____          __  __ ______ 
//  / ____|   /\   |  \/  |  ____|
// | |  __   /  \  | \  / | |__   
// | | |_ | / /\ \ | |\/| |  __|  
// | |__| |/ ____ \| |  | | |____ 
//  \_____/_/    \_\_|  |_|______|
// 
JackDanger.AgentJackIEC = function() {};

// Add Game to game register
addMyGame("agent-jack-iechan", "Agent Jack \"I. Chan\" Danger", "TriDev", "Packe dicke moves aus und infiltriere die Basis.", JackDanger.AgentJackIEC);

// Initialize Minigame Launching
JackDanger.AgentJackIEC.prototype.init = function() {
	// Show loading screen
	addLoadingScreen(this);
}

// Load assets for preload
JackDanger.AgentJackIEC.prototype.preload = function() {
	this.load.path = 'games/' + currentGameData.id + '/assets/';//nicht anfassen

	// Debug Ball
	this.load.image('bg','../assetsraw/ball.png');

	// Maze Background
	this.load.image("maze-bg", "maze-bg.png");

	// Jack (Maze) Atlas
	this.load.atlas("jack", "jack.png", "jack.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH); // Jack Running

	// Enemy
	this.load.atlas("enemy", "enemy.png", "enemy.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

	// Entities (Scenery)
	this.load.atlas("scenery", "scenery.png", "scenery.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

	// Jack (Maze) Sounds
	this.load.audio('jack-hit', 'sounds/punch-hit.wav');
	this.load.audio('jack-nohit', 'sounds/punch-nohit.wav');
}

// Executed after preload
JackDanger.AgentJackIEC.prototype.create = function() {
	// Init controls & remove loading screen
	Pad.init();
	removeLoadingScreen();

	// Init Minigame
	this.stage.smoothed = false;

	this.currentLevel = this.availableLevels.Maze;
	this.timeToBeat = 0.0;
	this.score = 0.0;
	this.maze = new this.Maze(this);
	this.boss = new this.Boss(this);
	this.globalScale = 4;
	this.colliderEditor = new this.ColliderEditor(this.game);
	this.game.input.onDown.add(this.colliderEditor.startColliderDrawing, this.colliderEditor, 0);
	this.game.input.onUp.add(this.colliderEditor.endColliderDrawing, this.colliderEditor, 0);

	this.loadLevel(this.availableLevels.Maze);
}

// Gets executed every frame
JackDanger.AgentJackIEC.prototype.update = function() {
	var dt = this.time.physicsElapsedMS * 0.001;

	if (this.currentLevel == this.availableLevels.Maze) {
		this.maze.update(dt);
	} else if (this.currentLevel == this.availableLevels.Boss) {
		this.boss.update(dt);
	}
	
	this.colliderEditor.updateColliderDrawing();
}

JackDanger.AgentJackIEC.prototype.loadLevel = function (level) {
	if (level == this.availableLevels.Maze) {
		this.boss.disposeLevel();

		this.currentLevel = this.availableLevels.Maze;

		this.maze.initLevel();
	} else if (level == this.availableLevels.Boss) {
		this.maze.disposeLevel();

		this.currentLevel = this.availableLevels.Boss;

		this.boss.initLevel();
	} else {
		logInfo("Dafuq m8. Pass a valid level bitsch");
	}
}

JackDanger.AgentJackIEC.prototype.availableLevels = {
	Maze: 0,
	Boss: 1
};




JackDanger.AgentJackIEC.prototype.ColliderEditor = function (game) {
	this.isDrawing = false;
	this.startingPoint = new Phaser.Point(0, 0);
	this.endPoint = new Phaser.Point(0, 0);
	this.game = game;
};

JackDanger.AgentJackIEC.prototype.ColliderEditor.prototype = {
	startColliderDrawing: function () {
		if (this.isDrawing)
			return;
		
		logInfo(this);
		
		this.isDrawing = true;
		this.startingPoint = new Phaser.Point(this.game.input.worldX, this.game.input.worldY);
	},
	
	updateColliderDrawing: function () {
		if (!this.isDrawing)
			return;
		
		this.endPoint = new Phaser.Point(this.game.input.worldX, this.game.input.worldY);
		logInfo("DRAW");
		this.game.debug.geom(new Phaser.Rectangle(this.startingPoint.x, this.startingPoint.y, this.endPoint.x - this.startingPoint.x, this.endPoint.y - this.startingPoint.y));
	},
	
	endColliderDrawing: function () {
		if (!this.isDrawing)
			return;
		
		this.isDrawing = false;
		this.endPoint = new Phaser.Point(this.game.input.worldX, this.game.input.worldY);
		
		var x = (this.startingPoint.x < this.endPoint.x) ? this.startingPoint.x : this.endPoint.x;
		var y = (this.startingPoint.y < this.endPoint.y) ? this.startingPoint.y : this.endPoint.y;
		var width = (this.startingPoint.x < this.endPoint.x) ? this.endPoint.x - this.startingPoint.x : this.startingPoint.x - this.endPoint.x;
		var height = (this.startingPoint.y < this.endPoint.y) ? this.endPoint.y - this.startingPoint.y : this.startingPoint.y - this.endPoint.y;
		
		logInfo(JSON.stringify({
			x: x,
			y: this.game.world.height - y,
			width: width,
			height: height
		}));
	}
};