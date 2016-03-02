/*
Hallo!
Das hir ist deine Spielevorlage!
Ich hoffe, ich habe alles gut genug dokumentiert.

Alles was hier MyGame heißt musst du umbennen in etwas sehr
individuelles. So wie KotzeMannGRKDM
Die wirren Buchstaben können wichtig sein, falls jemand anderes
auch KotzeMann entwickelt!

WICHTIG

Wenn dein Spiel geschafft ist, dann rufe

onVictory();

auf! Später wird da dann ein richtiger Gewonnenbildschrim erscheinen!

Wenn man in deinem Spiel verliert dann rufe

onLose()

auf, dardurch wird dein Spiel neugestartet.

Wärend du an deinem Spiel arbeitest, arbeite ich am Drumherum.
So dass es dann alles auch supi aussieht!
*/

JackDanger.AgentJackIEC = function() {

};

//hier musst du deine Eintragungen vornhemen.
addMyGame("agent-jack-iechan", "Agent Jack ieChan", "TriDev", "Packe deine moves aus und infiltriere die Basis.", JackDanger.AgentJackIEC);


JackDanger.AgentJackIEC.prototype.init = function() {
    logInfo("init Game");
    addLoadingScreen(this);//nicht anfassen
}

JackDanger.AgentJackIEC.prototype.preload = function() {
	this.load.path = 'games/' + currentGameData.id + '/assets/';//nicht anfassen
	
    //füge hie rein was du alles laden musst.
    this.load.atlas("mygame");
	this.load.image('player','../assetsraw/face.png');
	this.load.image('bg','../assetsraw/ball.png');
	
//	this.load.spritesheet('jack_run', 'jack/jack_run.png', 14, 20);
	this.load.atlasJSONHash('jack_run', 'jack/jack_run.png', 'jack/jack_run.json');
}

//wird nach dem laden gestartet
JackDanger.AgentJackIEC.prototype.create = function() {
    Pad.init();//nicht anfassen
    removeLoadingScreen();//nicht anfassen

    this.initAJIEC();
}

//wird jeden Frame aufgerufen
JackDanger.AgentJackIEC.prototype.update = function() {
    var dt = this.time.physicsElapsedMS * 0.001;

   	if (this.currentLevel == this.availableLevels.Maze) {
		this.maze.update(dt);
	} else if (this.currentLevel == this.availableLevels.Boss) {
		this.boss.update(dt);
	}
}

JackDanger.AgentJackIEC.prototype.initAJIEC = function () {
	this.stage.smoothed = false;
	
	this.currentLevel = this.availableLevels.Maze;
	this.timeToBeat = 0.0;
	this.score = 0.0;
	this.maze = new this.Maze(this);
	this.boss = new this.Boss(this);
	this.globalScale = 4;
	
	this.loadLevel(this.availableLevels.Maze);
};

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

JackDanger.AgentJackIEC.prototype.getFrames = function (from, to, prefix) {
	if (from > to)
		return [];
	
	var frames = [];
	var toListIndex = function (i) {
		i = parseInt(i);
		
		if (i < 10)
			return "000" + i;
		else if (i < 100)
			return "00" + i;
		else if (i < 1000)
			return "0" + i;
		else if (i < 10000)
			return i;
	};
	
	for (var i = from; i <= to; i++) {
		if (prefix === undefined)
			frames.push(parseInt(i));
		else
			frames.push(prefix + toListIndex(i));
	}
	
	return frames;
};

/////////////////
// _MAZE Level //
/////////////////
JackDanger.AgentJackIEC.prototype.Maze = function (parent) {
	this.initialized = false;
	this.main = parent;
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.initLevel = function () {
	logInfo("Init Maze");
	this.initialized = true;
		
	this.main.world.setBounds(0, 0, 1920, 1920);
	this.main.physics.startSystem(Phaser.Physics.ARCADE);
	
	this.jack = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, 'jack_run');
	this.jack.frame = 0;
	this.jack.scale.setTo(this.main.globalScale);
	this.jack.anchor.setTo(0.5, 0.5);
	
	this.jack.animations.add("run_left_right", Phaser.Animation.generateFrameNames('run-lr-', 0, 16, '', 4), 25, true, false);
	this.jack.animations.add("idle_anim", Phaser.Animation.generateFrameNames('idle', 0, 0, '', 4), 1, true, false);
		
	this.background = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, 'bg');
	this.background.scale.setTo(5, 5);
	
	this.main.physics.enable(this.jack, Phaser.Physics.ARCADE);
	this.jack.body.collideWorldBounds = true;
	
    this.main.camera.follow(this.jack);
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.update = function (dt) {
//	logInfo("Update Maze");
	this.updatePlayerControls(dt);
	this.updateJackAnimation(dt);
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.updatePlayerControls = function (dt) {
//	logInfo("Update Player Controls (Maze)");
	
	this.jack.body.velocity = {x: 0, y: 0};
	
	if (Pad.isDown(Pad.LEFT)) {
		this.jack.body.velocity.x = -200;
	} else if (Pad.isDown(Pad.RIGHT)) {
		this.jack.body.velocity.x = 200;
	}
	
	if (Pad.isDown(Pad.UP)) {
		this.jack.body.velocity.y = -200;
	} else if (Pad.isDown(Pad.DOWN)) {
		this.jack.body.velocity.y = 200;
	}
	
	if (this.jack.body.velocity.x > 0 && this.jack.scale.x < 0)
		this.jack.scale.x *= -1;
	else if (this.jack.body.velocity.x < 0 && this.jack.scale.x > 0)
		this.jack.scale.x *= -1;
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.updateJackAnimation = function (dt) {
	if (this.jack.body.velocity.y === 0 && this.jack.body.velocity.x === 0) {
		this.jack.animations.play("idle_anim");
	} else {
		this.jack.animations.play("run_left_right");
	}
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.disposeLevel = function () {
	if (!this.initialized) return;
	
	logInfo("Dispose Maze");
};


/////////////////
// _BOSS Level //
/////////////////
JackDanger.AgentJackIEC.prototype.Boss = function () {
	this.initialized = false;
	this.main = parent;
};

JackDanger.AgentJackIEC.prototype.Boss.prototype.initLevel = function () {
	logInfo("Init Boss");
};

JackDanger.AgentJackIEC.prototype.Boss.prototype.update = function (dt) {
//	logInfo("Update Boss");
};

JackDanger.AgentJackIEC.prototype.Boss.prototype.disposeLevel = function () {
	if (!this.initialized) return;
	
	logInfo("Dispose Boss");
};