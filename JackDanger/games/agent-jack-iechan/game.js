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

NEW COMMENT
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
	this.load.image('bg','../assetsraw/ball.png');
	this.load.image("maze-bg", "maze-bg.png");

	this.load.atlas('jack'); // Jack Running
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

	// Possible Directions for Jack
	this.possibleDirections = {
		UP: 0,
		DOWN: 1,
		LEFT: 2,
		RIGHT: 3
	};

	// Setup World + Physics
	this.main.world.setBounds(0, 0, 800, 1920);
	this.main.physics.startSystem(Phaser.Physics.ARCADE);

	// World Background
	this.background = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, "maze-bg");
	this.background.anchor.setTo(0.5, 0.5);
	this.background.scale.setTo(this.main.globalScale);

	// Debug Ball
	//	this.ball = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, 'bg');
	//	this.ball.scale.setTo(5, 5);

	// Setup Jack
	this.jack = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, 'jack'); // Setup Sprite
	this.main.physics.arcade.enable(this.jack); // Enable physics
	this.jack.walkSpeed = 175; // Set Walk Speed
	this.jack.hitSpeed = 50;
	this.jack.fullSpeed = 175;
	this.jack.lastDirection = this.possibleDirections.RIGHT; // Declare last Direction
	this.jack.scale.setTo(this.main.globalScale); // Set Scale to global scale
	this.jack.anchor.setTo(0.5, 0.5); // Set Anchor to center
	this.jack.body.collideWorldBounds = true; // Enable collision with world bounds
	this.jack.shooting = false;
	this.jack.lockMovement = false;
	this.jack.lockActions = false;
	this.jack.isHitting = false;
	
	this.jack.onHit = function (game) {
		this.walkAnimationBlocked = true;
		this.lockActions = true;
		this.isHitting = true;
		this.walkSpeed = this.hitSpeed;
		
		if (this.lastDirection == game.possibleDirections.LEFT || this.lastDirection == game.possibleDirections.RIGHT) {
			this.animations.play("punch-lr");
		} else if (this.lastDirection == game.possibleDirections.UP) {
			this.animations.play("punch-up");			
		} else if (this.lastDirection == game.possibleDirections.DOWN) {
			this.animations.play("punch-lr");			
		}
		
		this.animations.currentAnim.onComplete.add(this.onHitComplete, this);
	};
	
	this.jack.onHitComplete = function () {
		this.walkAnimationBlocked = false;
		this.lockActions = false;
		this.isHitting = false;
		this.walkSpeed = this.fullSpeed;
	};

	// Jack Animations
	// Jack Animation Run Left-Right
	this.jack.animations.add("run-lr-idle", Phaser.Animation.generateFrameNames('run-lr-idle-', 0, 0, '', 4), 1, true, false);
	this.jack.animations.add("run-lr", Phaser.Animation.generateFrameNames('run-lr-', 0, 16, '', 4), 30, true, false);

	// Jack Animation Run Up
	this.jack.animations.add("run-up-idle", Phaser.Animation.generateFrameNames('run-up-idle-', 0, 0, '', 4), 1, true, false);
	this.jack.animations.add("run-up", Phaser.Animation.generateFrameNames('run-up-', 0, 17, '', 4), 30, true, false);

	// Jack Animation Run Down
	this.jack.animations.add("run-down-idle", Phaser.Animation.generateFrameNames('run-down-idle-', 0, 0, '', 4), 1, true, false);
	this.jack.animations.add("run-down", Phaser.Animation.generateFrameNames('run-down-', 0, 17, '', 4), 30, true, false);

	this.jack.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 5, '', 4), 20, false, false);
	this.jack.animations.add("punch-up", Phaser.Animation.generateFrameNames('punch-up-', 0, 5, '', 4), 20, false, false);

	// Set Camera to follow player
	this.main.camera.follow(this.jack, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.update = function (dt) {
	//	logInfo("Update Maze");
	this.updatePlayerControls(dt);
	this.updateJackAnimation(dt);
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.updatePlayerControls = function (dt) {
	this.jack.body.velocity = {x: 0, y: 0};
	
	if (!this.jack.lockMovement) {
		if (Pad.isDown(Pad.UP)) {
			this.jack.body.velocity.y -= this.jack.walkSpeed;
			this.jack.lastDirection = this.possibleDirections.UP;
		} else if (Pad.isDown(Pad.DOWN)) {
			this.jack.body.velocity.y += this.jack.walkSpeed;
			this.jack.lastDirection = this.possibleDirections.DOWN;
		}

		if (Pad.isDown(Pad.LEFT)) {
			this.jack.body.velocity.x -= this.jack.walkSpeed;
			this.jack.lastDirection = this.possibleDirections.LEFT;
		} else if (Pad.isDown(Pad.RIGHT)) {
			this.jack.body.velocity.x += this.jack.walkSpeed;
			this.jack.lastDirection = this.possibleDirections.RIGHT;
		}

		if (this.jack.body.velocity.x > 0 && this.jack.scale.x < 0)
			this.jack.scale.x *= -1;
		else if (this.jack.body.velocity.x < 0 && this.jack.scale.x > 0)
			this.jack.scale.x *= -1;

		if ((this.jack.lastDirection == this.possibleDirections.UP || this.jack.lastDirection == this.possibleDirections.DOWN) && this.jack.scale.x < 0)
			this.jack.scale.x *= -1;
	}

	if (!this.jack.lockActions) {
		if (Pad.justDown(Pad.SHOOT) && !this.jack.isHitting) {
			logInfo("SHOOT");

			this.jack.onHit(this);
		}

		if (Pad.justDown(Pad.JUMP)) {
			logInfo("JUMP");
			this.jack.animations.play("run-down-idle");
		}
	}
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.updateJackAnimation = function (dt) {	
	if (this.jack.walkAnimationBlocked)
		return;

	if (this.jack.body.velocity.y === 0 && this.jack.body.velocity.x === 0) {
		// Idle Animations for last directions
		if (this.jack.lastDirection == this.possibleDirections.LEFT) {
			this.jack.animations.play("run-lr-idle");
		} else if (this.jack.lastDirection == this.possibleDirections.RIGHT) {
			this.jack.animations.play("run-lr-idle");
		} else if (this.jack.lastDirection == this.possibleDirections.UP) {
			this.jack.animations.play("run-up-idle");
		} else if (this.jack.lastDirection == this.possibleDirections.DOWN) {
			this.jack.animations.play("run-down-idle");
		}
	} else {
		// Walking animations for corresponding direcitons

		if (this.jack.lastDirection == this.possibleDirections.LEFT) {
			this.jack.animations.play("run-lr");
		} else if (this.jack.lastDirection == this.possibleDirections.RIGHT) {
			this.jack.animations.play("run-lr");
		} else if (this.jack.lastDirection == this.possibleDirections.UP) {
			this.jack.animations.play("run-up");
		} else if (this.jack.lastDirection == this.possibleDirections.DOWN) {
			this.jack.animations.play("run-down");
		}
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