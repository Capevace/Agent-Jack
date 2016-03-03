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

	this.load.audio('jack-hit', 'sounds/punch-hit.wav');
	this.load.audio('jack-nohit', 'sounds/punch-nohit.wav');
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

// Raycasting disabled for now
//JackDanger.AgentJackIEC.prototype.raycasting = {
//	doRay: function (start, direction, bodies, distance, self) {
//		distance = distance || 99999;
//		direction = direction.normalize();
//
//		var ray = direction.multiply(distance, distance);
//		var endPoint = start;
//		endPoint.add(direction.x, direction.y);
//
//		console.log(start);
//		console.log(ray);
//		console.log(endPoint);
//
//		var behindCaster = endPoint.x < start.x;
//		var underCaster = endPoint.y < start.y;
//		for (var bodyIndex = 0; bodyIndex < bodies.length; bodyIndex++) {
//			var body = bodies[bodyIndex];
//			var bodyIsIn = (function (body, underCaster, behindCaster, start, endPoint) {
//				// Make range
//				var lowerPointX = (behindCaster) ? endPoint.x : start.x;
//				var higherPointX = (behindCaster) ? start.x : endPoint.x;
//				var lowerPointY = (underCaster) ? endPoint.y : start.y;
//				var higherPointY = (underCaster) ? start.y : endPoint.y;
//				
//				// if is in X range
//				if (body.center.x > lowerPointX && body.center.x < higherPointX) {
//					// if is in Y range => in full range
//					if (body.center.y > lowerPointY && body.center.y < higherPointY) {
//						var leftTopCorner = body.center;
//						var rightTopCorner = body.center;
//						var leftBottomCorner = body.center;
//						var rightBottomCorner = body.center;
//						
//						leftTopCorner.add(-body.halfWidth, body.halfHeight);
//						rightTopCorner.add(body.halfWidth, body.halfHeight);
//						leftBottomCorner.add(-body.halfWidth, -body.halfHeight);
//						rightBottomCorner.add(body.halfWidth, -body.halfHeight);
//						
//						var isOnRay
//					}
//				}
//			})(body, underCaster, behindCaster, start, endPoint);
//		}
//	}
//};

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


	// Setup World + Physics
	this.main.world.setBounds(0, 0, 800, 2527);
	this.main.physics.startSystem(Phaser.Physics.ARCADE);

	this.backgroundLayer = this.main.add.group();
	this.playerLayer = this.main.add.group();

	// World Background
	this.background = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, "maze-bg");
	this.background.anchor.setTo(0.5, 0.5);
	this.background.scale.setTo(3.55);
	this.backgroundLayer.add(this.background);

	// Hittable Enemies
	this.enemies = {
		push: function (body) {
			this.bodies.push(body);
		},
		remove: function (body) {
			var index = this.bodies.indexOf(body);

			if (index != -1)
				this.bodies.splice(index, 1);
		},
		forEach: function (callback, jack) {
			if (this.bodies.length == 0)
				callback(null, -1, this.bodies, jack);

			for (var i = 0; i < this.bodies.length; i++) {
				if (callback(this.bodies[i], i, this.bodies, jack))
					i = this.bodies.length;
			}
		},
		bodies: []
	};

	// Debug Ball
	//	this.ball = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, 'bg');
	//	this.ball.scale.setTo(5, 5);

	// Setup Jack
	this.jack = new this.Jack(this.main.world.centerX, this.main.world.height - 300, this.main);

	this.enemy = this.main.add.sprite(this.main.world.centerX + 2, this.main.world.centerY + 2, 'jack', 'run-lr-idle-0000');
	this.playerLayer.add(this.enemy);
	this.main.physics.arcade.enable(this.enemy);
	this.enemy.scale.setTo(this.main.globalScale, this.main.globalScale + 1); // Set Scale to global scale
	this.enemy.anchor.setTo(0.5, 0.5); // Set Anchor to center
	this.enemy.body.collideWorldBounds = true;
	this.enemy.onJackHit = function () {
		logInfo("I'm hit! Meeediiiic!!");
		this.body.enable = false;
		this.kill();
		this.enemyList.remove(this);
	};
	this.enemy.enemyList = this.enemies;
	this.enemies.push(this.enemy);

	// Set Camera to follow player
	this.main.camera.follow(this.jack.sprite, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
	console.log(this.main.game);

	//	this.main.raycasting.doRay(new Phaser.Point(0, 0), new Phaser.Point(0.75, 0.2), [], 100);
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.update = function (dt) {
	//	logInfo("Update Maze");
	this.updatePlayerControls(dt);
	this.jack.updateJackAnimation(dt);

	this.jack.updateJackPhysics(dt);
	this.sortDepth();
	this.debug();
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.sortDepth = function () {
	this.playerLayer.customSort(function (a, b) {
		var aY = a.position.y + a.height/2;
		var bY = b.position.y + b.height/2;

		if (aY > bY)
			return 1;
		else if (aY < bY)
			return -1;

		return 0;
	}, this);
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.updatePlayerControls = function (dt) {
	this.jack.sprite.body.velocity = {x: 0, y: 0};

	if (!this.jack.lockMovement) {
		if (Pad.isDown(Pad.UP)) {
			this.jack.sprite.body.velocity.y -= this.jack.walkSpeed;
			this.jack.lastDirection = this.jack.possibleDirections.UP;
		} else if (Pad.isDown(Pad.DOWN)) {
			this.jack.sprite.body.velocity.y += this.jack.walkSpeed;
			this.jack.lastDirection = this.jack.possibleDirections.DOWN;
		}

		if (Pad.isDown(Pad.LEFT)) {
			this.jack.sprite.body.velocity.x -= this.jack.walkSpeed;
			this.jack.lastDirection = this.jack.possibleDirections.LEFT;
		} else if (Pad.isDown(Pad.RIGHT)) {
			this.jack.sprite.body.velocity.x += this.jack.walkSpeed;
			this.jack.lastDirection = this.jack.possibleDirections.RIGHT;
		}

		if (this.jack.sprite.body.velocity.x > 0 && this.jack.sprite.scale.x < 0)
			this.jack.sprite.scale.x *= -1;
		else if (this.jack.sprite.body.velocity.x < 0 && this.jack.sprite.scale.x > 0)
			this.jack.sprite.scale.x *= -1;

		if ((this.jack.lastDirection == this.jack.possibleDirections.UP || this.jack.lastDirection == this.jack.possibleDirections.DOWN) && this.jack.sprite.scale.x < 0)
			this.jack.sprite.scale.x *= -1;
	}

	if (!this.jack.lockActions) {
		if (Pad.justDown(Pad.SHOOT) && !this.jack.isHitting) {
			logInfo("SHOOT");

			this.jack.onHit(this);
		}

		if (Pad.justDown(Pad.JUMP)) {
			logInfo("JUMP");
			this.jack.sprite.animations.play("run-down-idle");
		}
	}
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.debug = function () {
	//	this.main.game.debug.body(this.jack);
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.disposeLevel = function () {
	if (!this.initialized) return;

	logInfo("Dispose Maze");
};

//////////////
// JACK [Maze]
//////////////

JackDanger.AgentJackIEC.prototype.Maze.prototype.Jack = function (x, y, main) {
	// Set Jack + parent (main)
	this.sprite = main.add.sprite(x, y, 'jack'); // Setup Sprite
	this.main = main;
	this.main.maze.playerLayer.add(this.sprite);
	this.main.physics.arcade.enable(this.sprite); // Enable physics
	
	// Scale + anchor
	this.sprite.scale.setTo(this.main.globalScale); // Set Scale to global scale
	this.sprite.anchor.setTo(0.5, 0.5); // Set Anchor to center
	
	// Physics settings
	this.sprite.body.collideWorldBounds = true; // Enable collision with world bounds
	
	// Jack States
	this.shooting = false;
	this.lockMovement = false;
	this.lockActions = false;
	this.isHitting = false;
	this.lastDirection = 0;

	
	// Jack stats
	this.xHittingDistance = {primary: 50, secondary: 50};
	this.yHittingDistance = {primary: 50, secondary: 50};
	this.walkSpeed = 150;
	this.hitSpeed = 50;
	this.fullSpeed = 150;
	
	// Jack's sounds
	this.sound = {
		hit: this.main.add.audio("jack-hit"),
		noHit: this.main.add.audio("jack-nohit")
	};

	
	////
	// Jack Animations
	////
	
	// Jack Animation Run Left-Right
	this.sprite.animations.add("run-lr-idle", Phaser.Animation.generateFrameNames('run-lr-idle-', 0, 0, '', 4), 1, true, false);
	this.sprite.animations.add("run-lr", Phaser.Animation.generateFrameNames('run-lr-', 0, 16, '', 4), 40, true, false);

	// Jack Animation Run Up
	this.sprite.animations.add("run-up-idle", Phaser.Animation.generateFrameNames('run-up-idle-', 0, 0, '', 4), 1, true, false);
	this.sprite.animations.add("run-up", Phaser.Animation.generateFrameNames('run-up-', 0, 17, '', 4), 40, true, false);

	// Jack Animation Run Down
	this.sprite.animations.add("run-down-idle", Phaser.Animation.generateFrameNames('run-down-idle-', 0, 0, '', 4), 1, true, false);
	this.sprite.animations.add("run-down", Phaser.Animation.generateFrameNames('run-down-', 0, 17, '', 4), 40, true, false);

	// Jack Animation Punching
	this.sprite.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 6, '', 4), 20, false, false);
	this.sprite.animations.add("punch-up", Phaser.Animation.generateFrameNames('punch-up-', 0, 5, '', 4), 20, false, false);
	this.sprite.animations.add("punch-down", Phaser.Animation.generateFrameNames('kick-down-', 0, 10, '', 4), 30, false, false);
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.Jack.prototype = {
	// Possible walking directions for jack
	possibleDirections: {
		LEFT: 0,
		RIGHT: 1,
		UP: 2,
		DOWN: 3
	},
	
	// Update for Jack's animation
	updateJackAnimation: function (dt) {	
		if (this.walkAnimationBlocked)
			return;

		if (this.sprite.body.velocity.y === 0 && this.sprite.body.velocity.x === 0) {
			// Idle Animations for last directions
			if (this.lastDirection == this.possibleDirections.LEFT) {
				this.sprite.animations.play("run-lr-idle");
			} else if (this.lastDirection == this.possibleDirections.RIGHT) {
				this.sprite.animations.play("run-lr-idle");
			} else if (this.lastDirection == this.possibleDirections.UP) {
				this.sprite.animations.play("run-up-idle");
			} else if (this.lastDirection == this.possibleDirections.DOWN) {
				this.sprite.animations.play("run-down-idle");
			}
		} else {
			// Walking animations for corresponding direcitons

			if (this.lastDirection == this.possibleDirections.LEFT) {
				this.sprite.animations.play("run-lr");
			} else if (this.lastDirection == this.possibleDirections.RIGHT) {
				this.sprite.animations.play("run-lr");
			} else if (this.lastDirection == this.possibleDirections.UP) {
				this.sprite.animations.play("run-up");
			} else if (this.lastDirection == this.possibleDirections.DOWN) {
				this.sprite.animations.play("run-down");
			}
		}
	},
	
	// Update Physics for Jack
	updateJackPhysics: function (dt) {
		this.sprite.body.width = 70;
		this.sprite.body.height = 80;
	},
	
	// On Player press punch
	onHit: function () {
		this.walkAnimationBlocked = true; // Lock walk animation, so punch animation can be shown
		this.lockActions = true; // Disable anymore punches while one punch is happening
		this.isHitting = true; // Set hitting to true
		this.walkSpeed = this.hitSpeed; // Slow down player

		// Select and play punch animation for current direction
		if (this.lastDirection == this.possibleDirections.LEFT || this.lastDirection == this.possibleDirections.RIGHT) {
			this.sprite.animations.play("punch-lr");
		} else if (this.lastDirection == this.possibleDirections.UP) {
			this.sprite.animations.play("punch-up");			
		} else if (this.lastDirection == this.possibleDirections.DOWN) {
			this.sprite.animations.play("punch-down");			
		}

		// Add animation complete handler => hit complete
		this.sprite.animations.currentAnim.onComplete.add(this.onHitComplete, this);

		// Look through enemies if any are punchable
		this.main.maze.enemies.forEach(function (enemy, index, enemies, jack) {
			// Bodies are actually empty, play nohit
			if (index == -1) {
				jack.sound.noHit.play();
				return;
			}

			var distanceX = Math.abs(enemy.body.center.x - jack.sprite.body.center.x);
			var distanceY = Math.abs(enemy.body.center.y - jack.sprite.body.center.y);
			var totalDistance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);

			if (totalDistance > jack.xHittingDistance.primary && totalDistance > jack.yHittingDistance.primary) {
				jack.sound.noHit.play();
				return;
			}

			if (jack.lastDirection == jack.possibleDirections.LEFT || jack.lastDirection == jack.possibleDirections.RIGHT) {
				if (distanceX <= jack.xHittingDistance.primary && distanceY <= jack.xHittingDistance.secondary) {
					// Can be hit
					jack.sound.hit.play();

					if (enemy.onJackHit != undefined)
						enemy.onJackHit();

					return true;
				} else {
					jack.sound.noHit.play();
				}
			} else { 
				if (distanceY <= jack.yHittingDistance.primary && distanceX <= jack.yHittingDistance.secondary) {
					// Can be hit
					jack.sound.hit.play();

					if (enemy.onJackHit != undefined)
						enemy.onJackHit();

					return true;
				} else {
					jack.sound.noHit.play();
				}
			}
			// This is en comment
			return false;
		}, this);
	},
	
	// On hit animation complete
	onHitComplete: function () {
		this.walkAnimationBlocked = false;
		this.lockActions = false;
		this.isHitting = false;
		this.walkSpeed = this.fullSpeed;
	}
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