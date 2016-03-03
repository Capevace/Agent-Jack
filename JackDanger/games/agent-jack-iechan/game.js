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
	this.possibleDirections = {
		UP: 0,
		DOWN: 1,
		LEFT: 2,
		RIGHT: 3
	};

	// Setup World + Physics
	this.main.world.setBounds(0, 0, 800, 1920);
	this.main.physics.startSystem(Phaser.Physics.ARCADE);
	
	this.backgroundLayer = this.main.add.group();
	this.playerLayer = this.main.add.group();

	// World Background
	this.background = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, "maze-bg");
	this.background.anchor.setTo(0.5, 0.5);
	this.background.scale.setTo(this.main.globalScale);
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
		forEach: function (callback) {
			if (this.bodies.length == 0)
				callback(null, -1, this.bodies);
			
			for (var i = 0; i < this.bodies.length; i++) {
				if (callback(this.bodies[i], i, this.bodies))
					i = this.bodies.length;
			}
		},
		bodies: []
	};

	// Debug Ball
	//	this.ball = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, 'bg');
	//	this.ball.scale.setTo(5, 5);

	// Setup Jack
	this.jack = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, 'jack'); // Setup Sprite
	this.playerLayer.add(this.jack);
	this.main.physics.arcade.enable(this.jack); // Enable physics
	this.jack.walkSpeed = 150; // Set Walk Speed
	this.jack.hitSpeed = 50;
	this.jack.fullSpeed = 150;
	this.jack.lastDirection = this.possibleDirections.RIGHT; // Declare last Direction
	this.jack.scale.setTo(this.main.globalScale); // Set Scale to global scale
	this.jack.anchor.setTo(0.5, 0.5); // Set Anchor to center
	this.jack.body.collideWorldBounds = true; // Enable collision with world bounds
	this.jack.shooting = false;
	this.jack.lockMovement = false;
	this.jack.lockActions = false;
	this.jack.isHitting = false;
	this.jack.xHittingDistance = {primary: 50, secondary: 50};
	this.jack.yHittingDistance = {primary: 50, secondary: 50};
	this.jack.sound = {
		hit: this.main.add.audio("jack-hit"),
		noHit: this.main.add.audio("jack-nohit")
	};

	this.jack.onHit = function (main) {
		this.walkAnimationBlocked = true; // Lock walk animation, so punch animation can be shown
		this.lockActions = true; // Disable anymore punches while one punch is happening
		this.isHitting = true; // Set hitting to true
		this.walkSpeed = this.hitSpeed; // Slow down player

		// Select and play punch animation for current direction
		if (this.lastDirection == main.possibleDirections.LEFT || this.lastDirection == main.possibleDirections.RIGHT) {
			this.animations.play("punch-lr");
		} else if (this.lastDirection == main.possibleDirections.UP) {
			this.animations.play("punch-up");			
		} else if (this.lastDirection == main.possibleDirections.DOWN) {
			this.animations.play("punch-down");			
		}

		// Add animation complete handler => hit complete
		this.animations.currentAnim.onComplete.add(this.onHitComplete, this);
		
		// Look through enemies if any are punchable
		main.enemies.forEach(function (enemy, index, enemies) {
			// Bodies are actually empty, play nohit
			if (index == -1) {
				main.jack.sound.noHit.play();
				return;
			}
			
			var distanceX = Math.abs(enemy.body.center.x - main.jack.body.center.x);
			var distanceY = Math.abs(enemy.body.center.y - main.jack.body.center.y);
			var totalDistance = Math.sqrt(distanceX*distanceX + distanceY*distanceY);
			
			if (totalDistance > main.jack.xHittingDistance.primary && totalDistance > main.jack.yHittingDistance.primary) {
				main.jack.sound.noHit.play();
				return;
			}
			
			if (main.jack.lastDirection == main.possibleDirections.LEFT || main.jack.lastDirection == main.possibleDirections.RIGHT) {
				if (distanceX <= main.jack.xHittingDistance.primary && distanceY <= main.jack.xHittingDistance.secondary) {
					// Can be hit
					main.jack.sound.hit.play();
					
					if (enemy.onJackHit != undefined)
						enemy.onJackHit();
					
					return true;
				} else {
					main.jack.sound.noHit.play();
				}
			} else { 
				if (distanceY <= main.jack.yHittingDistance.primary && distanceX <= main.jack.yHittingDistance.secondary) {
					// Can be hit
					main.jack.sound.hit.play();
					
					if (enemy.onJackHit != undefined)
						enemy.onJackHit();
					
					return true;
				} else {
					main.jack.sound.noHit.play();
				}
			}
			
			return false;
		});
	}

	this.jack.onHitComplete = function () {
		this.walkAnimationBlocked = false;
		this.lockActions = false;
		this.isHitting = false;
		this.walkSpeed = this.fullSpeed;
	};

	// Jack Animations
	// Jack Animation Run Left-Right
	this.jack.animations.add("run-lr-idle", Phaser.Animation.generateFrameNames('run-lr-idle-', 0, 0, '', 4), 1, true, false);
	this.jack.animations.add("run-lr", Phaser.Animation.generateFrameNames('run-lr-', 0, 16, '', 4), 40, true, false);

	// Jack Animation Run Up
	this.jack.animations.add("run-up-idle", Phaser.Animation.generateFrameNames('run-up-idle-', 0, 0, '', 4), 1, true, false);
	this.jack.animations.add("run-up", Phaser.Animation.generateFrameNames('run-up-', 0, 17, '', 4), 40, true, false);

	// Jack Animation Run Down
	this.jack.animations.add("run-down-idle", Phaser.Animation.generateFrameNames('run-down-idle-', 0, 0, '', 4), 1, true, false);
	this.jack.animations.add("run-down", Phaser.Animation.generateFrameNames('run-down-', 0, 17, '', 4), 40, true, false);

	// Jack Animation Punching
	this.jack.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 6, '', 4), 20, false, false);
	this.jack.animations.add("punch-up", Phaser.Animation.generateFrameNames('punch-up-', 0, 5, '', 4), 20, false, false);
	this.jack.animations.add("punch-down", Phaser.Animation.generateFrameNames('kick-down-', 0, 10, '', 4), 30, false, false);

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
	this.main.camera.follow(this.jack, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);

	//	this.main.raycasting.doRay(new Phaser.Point(0, 0), new Phaser.Point(0.75, 0.2), [], 100);
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.update = function (dt) {
	//	logInfo("Update Maze");
	this.updatePlayerControls(dt);
	this.updateJackAnimation(dt);
	this.sortDepth();
	
//	this.main.world.forEach(function (child, playerBottomY) {
//		if ((child.position.y - this.jack.height * 0.5) > )
//	}, this, true, this.jack.position.y - this.jack.height * 0.5);
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