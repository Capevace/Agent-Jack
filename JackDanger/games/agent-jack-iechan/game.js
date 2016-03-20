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
//hier musst du deine Eintragungen vornhemen.
addMyGame("agent-jack-iechan", 
    "Agent Jack \"I. Chan\"", 
    "TriDev", 
    "Packe dicke moves aus und infiltriere die Basis.", 
    "Bewegen", //Steuerkreuz
    "Interagieren", //Jump button belegung
    "Kaempfen", //Shoot button belegung
    JackDanger.AgentJackIEC);


// Initialize Minigame Launching
JackDanger.AgentJackIEC.prototype.init = function() {
	// Show loading screen
	addLoadingScreen(this, true);
}

// Load assets for preload
JackDanger.AgentJackIEC.prototype.preload = function() {
	this.load.path = 'games/' + currentGameData.id + '/assets/';//nicht anfassen

	// Debug Ball
	this.load.image('bg','../assetsraw/ball.png');

	// Maze Scenery
	this.load.json("maze-scene", "scenes/maze-scene.json");
	
	// Maze Background
	this.load.image("maze-bg", "maze-bg.png");
	this.load.image("maze-bg-ground", "bg/maze-bg-ground.png");
	this.load.image("maze-bg-middle", "bg/maze-bg-middle.png");
	this.load.image("maze-bg-top", "bg/maze-bg-top.png");

	// Jack (Maze) Atlas
	this.load.atlas("jack", "spritesheets/jack.png", "spritesheets/jack.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH); // Jack Running

	// Enemy
	this.load.atlas("enemy", "spritesheets/enemy.png", "spritesheets/enemy.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

	// Entities (Scenery)
	this.load.atlas("scenery", "spritesheets/scenery.png", "spritesheets/scenery.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
	
	// Hack Sprites
	this.load.atlas("hack-circles", "hack/circles.png", "hack/circles.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

	// Jack (Maze) Sounds
	this.load.audio('jack-hit', 'sounds/punch-hit.wav');
	this.load.audio('jack-nohit', 'sounds/punch-nohit.wav');
}

// Executed after preload
JackDanger.AgentJackIEC.prototype.create = function() {
	// Init controls & remove loading screen
	Pad.init();
}

JackDanger.AgentJackIEC.prototype.mycreate = function() {
	// Init Minigame
	this.stage.smoothed = false;
	this.game.renderer.renderSession.roundPixels = true;

	this.currentLevel = this.availableLevels.Maze; // Set current level to maze
	this.timeToBeat = 0.0; // Time to beat game
	this.score = 0.0; // Score of game
	this.maze = new this.Maze(this); // Init Maze
	this.boss = new this.Boss(this); // Init Boss
	this.globalScale = 4; // Define global scale, every sprite gets scaled by that
	this.game.main = this;
	this.stopped = false;
	
	// Init Colider Editor (Deactivate for release)
	this.colliderEditor = new this.ColliderEditor(this.game); 
	this.game.input.onDown.add(this.colliderEditor.startColliderDrawing, this.colliderEditor, 0);
	this.game.input.onUp.add(this.colliderEditor.endColliderDrawing, this.colliderEditor, 0);
	
	// Debug
	main = this;

	// Load Level (Maze)
	this.loadLevel(this.availableLevels.Maze);
}

// Gets executed every frame
JackDanger.AgentJackIEC.prototype.update = function() {
	var dt = this.time.physicsElapsedMS * 0.001;

	if (this.stopped)
		return;

	if (this.currentLevel == this.availableLevels.Maze) {
		this.maze.update(dt);
	} else if (this.currentLevel == this.availableLevels.Boss) {
		this.boss.update(dt);
	}
	
	// Debug
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

JackDanger.AgentJackIEC.prototype.stop = function () {
	this.stopped = true;
}

JackDanger.AgentJackIEC.prototype.availableLevels = {
	Maze: 0,
	Boss: 1
};