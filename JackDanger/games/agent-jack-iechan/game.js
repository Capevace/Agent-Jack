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











//  __  __           ____________ 
// |  \/  |   /\    |___  /  ____|
// | \  / |  /  \      / /| |__   
// | |\/| | / /\ \    / / |  __|  
// | |  | |/ ____ \  / /__| |____ 
// |_|  |_/_/    \_\/_____|______|
//                                                          
JackDanger.AgentJackIEC.prototype.Maze = function (parent) {
	this.initialized = false;
	this.main = parent;
}

JackDanger.AgentJackIEC.prototype.Maze.prototype = {
	initLevel: function () {
		logInfo("Init Maze");
		this.initialized = true;

		// Setup World + Physics
		this.main.world.setBounds(0, 0, 800, 2848);
		this.main.physics.startSystem(Phaser.Physics.ARCADE);

		// Setup Sprite Layers
		this.backgroundLayer = this.main.add.group();
		this.entityLayer = this.main.add.group();

		// Setup Scene
		this.setupScene();

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
					var body = this.bodies[i];
					if (body.dead) {
						// Remove object out of array
						this.bodies.splice(i, 1);

						// go back one index. for loop would skip next item otherwise
						i--;
						continue;
					} else {
						if (callback(body, i, this.bodies, jack))
							i = this.bodies.length;
					}
				}
			},
			bodies: []
		};


		// Debug Ball
		//	this.ball = this.main.add.sprite(this.main.world.centerX, this.main.world.centerY, 'bg');
		//	this.ball.scale.setTo(5, 5);

		// Setup Jack
		this.jack = new this.Jack().init(this.main.world.centerX, this.main.world.height - 300, this.main);

		//		this.enemy = this.main.add.sprite(this.main.world.centerX + 2, this.main.world.centerY + 2, 'jack', 'run-lr-idle-0000');
		//		this.main.physics.arcade.enable(this.enemy);
		//		this.enemy.scale.setTo(this.main.globalScale, this.main.globalScale + 1); // Set Scale to global scale
		//		this.enemy.anchor.setTo(0.5, 0.5); // Set Anchor to center
		//		this.enemy.body.collideWorldBounds = true;
		//		this.enemy.onJackHit = function () {
		//			logInfo("I'm hit! Meeediiiic!!");
		//			this.body.enable = false;
		//			this.kill();
		////			this.enemyList.remove(this);
		//		};
		//		this.enemy.enemyList = this.enemies;
		//		this.enemies.push(this.enemy);
		//		this.entityLayer.add(this.enemy);

		// 

		// Set Camera to follow player
		this.main.camera.follow(this.jack.sprite, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
	},


	setupScene: function () {
		// Set World Background
		this.scene = {};

		this.scene.background = this.main.add.sprite(this.main.world.centerX, this.main.world.height, "maze-bg");
		this.scene.background.anchor.setTo(0.5, 1);
		this.scene.background.scale.setTo(this.main.globalScale);
		this.backgroundLayer.add(this.scene.background);

		this.scene.gate = {
			main: this.main,
			opened: false,
			moving: false
		};

		// Add Gate L
		this.scene.gate.gateDoorL = this.main.add.sprite(0, 0, "scenery", "gate/gate-door");
		this.main.physics.arcade.enable(this.scene.gate.gateDoorL);
		this.scene.gate.gateDoorL.anchor.setTo(0.5, 0);
		this.scene.gate.gateDoorL.scale.setTo(this.main.globalScale);
		this.scene.gate.gateDoorL.position.setTo(this.main.world.centerX + 16 - this.scene.gate.gateDoorL.width/2, this.main.world.height-568 - 64);
		this.scene.gate.gateDoorL.gate = this.scene.gate;
		this.scene.gate.gateDoorL.body.immovable = true;
		this.scene.gate.gateDoorL.body.sourceWidth = 25;
		this.scene.gate.gateDoorL.body.sourceHeight = 15;
		this.scene.gate.gateDoorL.depthUpdateSettings = {
			shouldUpdateCollider: true,
			sizePlayerUnderSprite: {width: 25, height: 15},
			sizePlayerOverSprite: {width: 25, height: 7}
		};
		this.entityLayer.add(this.scene.gate.gateDoorL);
		this.collidersWithPlayer.push(this.scene.gate.gateDoorL.body);

		// Add Gate L
		this.scene.gate.gateDoorR = this.main.add.sprite(0, 0, "scenery", "gate/gate-door");
		this.main.physics.arcade.enable(this.scene.gate.gateDoorR);
		this.scene.gate.gateDoorR.anchor.setTo(0.5, 0);
		this.scene.gate.gateDoorR.scale.setTo(-this.main.globalScale, this.main.globalScale);
		this.scene.gate.gateDoorR.position.setTo(this.main.world.centerX - 16 - this.scene.gate.gateDoorR.width/2, this.main.world.height-568 - 64);
		this.scene.gate.gateDoorR.gate = this.scene.gate;
		this.scene.gate.gateDoorR.body.immovable = true;
		this.scene.gate.gateDoorR.body.sourceWidth = 25;
		this.scene.gate.gateDoorR.body.sourceHeight = 15;
		this.scene.gate.gateDoorR.depthUpdateSettings = {
			shouldUpdateCollider: true,
			sizePlayerUnderSprite: {width: 25, height: 15},
			sizePlayerOverSprite: {width: 25, height: 7}
		};
		this.entityLayer.add(this.scene.gate.gateDoorR);
		this.collidersWithPlayer.push(this.scene.gate.gateDoorR.body);

		this.scene.gate.openGate = function () {
			if (this.opened || this.moving)
				return;

			this.moving = true;
			var gate = this;
			var gateL = this.gateDoorL;
			var gateR = this.gateDoorR;
			var closeGate = this.closeGate;

			gateL.body.velocity.x = -25;
			gateR.body.velocity.x = 25;


			setTimeout(function () {
				gateL.body.velocity.x = 0;
				gateR.body.velocity.x = 0;
				gate.opened = true;
				gate.moving = false;
			}, 3500);
		};

		this.scene.gate.closeGate = function () {
			if (!this.opened || this.moving)
				return;

			this.moving = true;
			var gate = this;
			var gateL = this.gateDoorL;
			var gateR = this.gateDoorR;

			gateL.body.velocity.x = 25;
			gateR.body.velocity.x = -25;

			setTimeout(function () {
				gateL.body.velocity.x = 0;
				gateR.body.velocity.x = 0;
				gate.opened = false;
				gate.moving = false;
			}, 3500);
		};

		this.main.input.keyboard.addKey(Phaser.Keyboard.L).onDown.add(function () {
			if (this.opened) {
				logInfo("closefd");
				this.closeGate();
			}
			else {
				console.log("open")
				this.openGate();
			}
		}, this.scene.gate); 
		//		this.scene.gate.openGate();
	},


	collidersWithPlayer: {
		push: function (body) {
			this.bodies.push(body);
		},
		remove: function (body) {
			var index = this.bodies.indexOf(body);

			if (index != -1)
				this.bodies.splice(index, 1);
		},
		forEach: function (callback, main) {
			if (this.bodies.length == 0)
				callback(null, -1, this.bodies, main);

			for (var i = 0; i < this.bodies.length; i++) {
				var body = this.bodies[i];
				if (body.dead) {
					// Remove object out of array
					this.bodies.splice(i, 1);

					// go back one index. for loop would skip next item otherwise
					i--;
					continue;
				} else {
					if (callback(body, i, this.bodies, main))
						i = this.bodies.length;
				}
			}
		},
		bodies: []
	},


	update: function (dt) {
		// Update Jack
		this.jack.update(dt);

		// Sort depth after all other code was run
		this.sortDepth();
		this.debug();
	},


	sortDepth: function () {
		this.entityLayer.customSort(function (a, b) {
			var aY = a.position.y + (a.height / 2);
			var bY = b.position.y + (b.height / 2);
			
			if (a.isPlayer === undefined && b.isPlayer === undefined) {
				if (aY > bY) {
					
				} else if (aY < bY) {
					
				}
			}

			return 0;
		}, this);
	},


	disposeLevel: function () {
		if (!this.initialized) return;

		logInfo("Dispose Maze");
	},


	debug: function () {
		//	this.main.game.debug.body(this.jack);
	}
};






//       _         _____ _  __
//      | |  /\   / ____| |/ /
//      | | /  \ | |    | ' / 
//  _   | |/ /\ \| |    |  <  
// | |__| / ____ \ |____| . \ 
//  \____/_/    \_\_____|_|\_\
//                                                                                    
JackDanger.AgentJackIEC.prototype.Maze.prototype.Jack = function () {return this;}
JackDanger.AgentJackIEC.prototype.Maze.prototype.Jack.prototype = {
	init: function (x, y, main) {
		// Set Jack + parent (main)
		this.sprite = main.add.sprite(x, y, 'jack'); // Setup Sprite
		this.main = main;
		this.main.maze.entityLayer.add(this.sprite);
		this.main.physics.arcade.enable(this.sprite); // Enable physics

		// Scale + anchor
		this.sprite.scale.setTo(this.main.globalScale); // Set Scale to global scale
		this.sprite.anchor.setTo(0.5, 0.5); // Set Anchor to center

		// Physics settings
		this.sprite.body.collideWorldBounds = true; // Enable collision with world bounds
		this.sprite.body.sourceWidth = 14;
		this.sprite.body.sourceHeight = 20;
		this.sprite.isPlayer = true; // To be able to identify player

		// Jack States
		this.shooting = false;
		this.lockMovement = false;
		this.lockActions = false;
		this.isHitting = false;
		this.lastDirection = 0;


		// Jack stats
		this.xHittingDistance = {primary: 50, secondary: 50};
		this.yHittingDistance = {primary: 50, secondary: 50};
		this.hitSpeed = 50;
		this.fullSpeed = 150;
		this.walkSpeed = this.fullSpeed;


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

		return this;
	},


	// Possible walking directions for jack
	possibleDirections: {
		LEFT: 0,
		RIGHT: 1,
		UP: 2,
		DOWN: 3
	},


	update: function (dt) {
		this.updateInput(dt);
		this.updateAnimation(dt);
		this.updateJackPhysics(dt);
		this.updateCollision(dt);
	},


	// Update for Jack's animation
	updateAnimation: function (dt) {	
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

	},


	// Update Input Controls
	updateInput: function (dt) {
		this.sprite.body.velocity = {x: 0, y: 0};

		if (!this.lockMovement) {
			if (Pad.isDown(Pad.UP)) {
				this.sprite.body.velocity.y -= this.walkSpeed;
				this.lastDirection = this.possibleDirections.UP;
			} else if (Pad.isDown(Pad.DOWN)) {
				this.sprite.body.velocity.y += this.walkSpeed;
				this.lastDirection = this.possibleDirections.DOWN;
			}

			if (Pad.isDown(Pad.LEFT)) {
				this.sprite.body.velocity.x -= this.walkSpeed;
				this.lastDirection = this.possibleDirections.LEFT;
			} else if (Pad.isDown(Pad.RIGHT)) {
				this.sprite.body.velocity.x += this.walkSpeed;
				this.lastDirection = this.possibleDirections.RIGHT;
			}

			if (this.sprite.body.velocity.x > 0 && this.sprite.scale.x < 0)
				this.sprite.scale.x *= -1;
			else if (this.sprite.body.velocity.x < 0 && this.sprite.scale.x > 0)
				this.sprite.scale.x *= -1;

			if ((this.lastDirection == this.possibleDirections.UP || this.lastDirection == this.possibleDirections.DOWN) && this.sprite.scale.x < 0)
				this.sprite.scale.x *= -1;
		}

		if (!this.lockActions) {
			if (Pad.justDown(Pad.SHOOT) && !this.isHitting) {
				logInfo("SHOOT");

				this.onHit(this);
			}

			if (Pad.justDown(Pad.JUMP)) {
				logInfo("JUMP");
				this.sprite.animations.play("run-down-idle");
			}
		}
	},


	updateCollision: function () {
		this.main.game.debug.body(this.sprite);
		this.main.maze.collidersWithPlayer.forEach(function (body, i, bodies, main) {
			main.game.debug.body(body.sprite);
			main.physics.arcade.collide(main.maze.jack.sprite, body.sprite);
		}, this.main);
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
}








//  ______ _   _ ______ __  ____     __
// |  ____| \ | |  ____|  \/  \ \   / /
// | |__  |  \| | |__  | \  / |\ \_/ / 
// |  __| | . ` |  __| | |\/| | \   /  
// | |____| |\  | |____| |  | |  | |   
// |______|_| \_|______|_|  |_|  |_|   
//                                     
JackDanger.AgentJackIEC.prototype.Maze.prototype.Enemy = function () {return this;}
JackDanger.AgentJackIEC.prototype.Maze.prototype.Enemy.prototype = {
	init: function (x, y, enemySettings, main) {
		this.sprite = main.add.sprite(x, y, enemySettings.spriteName); // Setup Sprite
		this.main = main;
		this.main.maze.entityLayer.add(this.sprite);
		this.main.physics.arcade.enable(this.sprite); // Enable physics

		// Scale + anchor
		this.sprite.scale.setTo(this.main.globalScale); // Set Scale to global scale
		this.sprite.anchor.setTo(0.5, 0.5); // Set Anchor to center

		// Physics settings
		this.sprite.body.collideWorldBounds = true; // Enable collision with world bounds

		// Enemy States
		this.walkAnimationBlocked = false;

		// Enemy Stats
		this.hitSpeed = enemySettings.hitSpeed;
		this.fullSpeed = enemySettings.fullSpeed;
		this.walkSpeed = this.fullSpeed;
		this.maxHealth = enemySettings.maxHealth;
		this.health = this.maxHealth;
		this.attackStrength = enemySettings.attackStrength;

		////
		// Enemy Animations
		////
		// Enemy Animation Run Left-Right
		this.sprite.animations.add("run-lr-idle", Phaser.Animation.generateFrameNames('run-lr-idle-', 0, 0, '', 4), 1, true, false);
		this.sprite.animations.add("run-lr", Phaser.Animation.generateFrameNames('run-lr-', 0, 16, '', 4), 40, true, false);

		// Enemy Animation Run Up
		this.sprite.animations.add("run-up-idle", Phaser.Animation.generateFrameNames('run-up-idle-', 0, 0, '', 4), 1, true, false);
		this.sprite.animations.add("run-up", Phaser.Animation.generateFrameNames('run-up-', 0, 17, '', 4), 40, true, false);

		// Enemy Animation Run Down
		this.sprite.animations.add("run-down-idle", Phaser.Animation.generateFrameNames('run-down-idle-', 0, 0, '', 4), 1, true, false);
		this.sprite.animations.add("run-down", Phaser.Animation.generateFrameNames('run-down-', 0, 17, '', 4), 40, true, false);

		// Enemy Animation Punching
		this.sprite.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 6, '', 4), 20, false, false);
		this.sprite.animations.add("punch-up", Phaser.Animation.generateFrameNames('punch-up-', 0, 5, '', 4), 20, false, false);
		this.sprite.animations.add("punch-down", Phaser.Animation.generateFrameNames('kick-down-', 0, 10, '', 4), 30, false, false);

		return this;
	},


	updateAnimation: function () {
		if (this.walkAnimationBlocked)
			return;

		// Play correct animation
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
			if (this.sprite.body.velocity.y == 0 && this.sprite.body.velocity.x < 0) {
				this.sprite.animations.play("run-lr");
			} else if (this.sprite.body.velocity.y == 0 && this.sprite.body.velocity.x < 0) {
				this.sprite.animations.play("run-lr");
			} else if (this.lastDirection == this.possibleDirections.UP) {
				this.sprite.animations.play("run-up");
			} else if (this.lastDirection == this.possibleDirections.DOWN) {
				this.sprite.animations.play("run-down");
			}
		}

		// Correct flip
		if (this.sprite.body.velocity.x > 0 && this.sprite.scale.x < 0)
			this.sprite.scale.x *= -1;
		else if (this.sprite.body.velocity.x < 0 && this.sprite.scale.x > 0)
			this.sprite.scale.x *= -1;

		if (this.sprite.body.velocity.y == 0 && this.jack.sprite.scale.x < 0)
			this.jack.sprite.scale.x *= -1;
	},


	updateAI: function () {

	},


	onHitByJack: function (attackStrength) {
		this.health -= attackStrength;

		if (this.health <= 0) {
			this.die();
		}
	},


	die: function () {
		this.dead = true;
	}
};










//  ____   ____   _____ _____ 
// |  _ \ / __ \ / ____/ ____|
// | |_) | |  | | (___| (___  
// |  _ <| |  | |\___ \\___ \ 
// | |_) | |__| |____) |___) |
// |____/ \____/|_____/_____/ 
//
JackDanger.AgentJackIEC.prototype.Boss = function () {
	this.initialized = false;
	this.main = parent;
}

JackDanger.AgentJackIEC.prototype.Boss.prototype.initLevel = function () {
	logInfo("Init Boss");
}

JackDanger.AgentJackIEC.prototype.Boss.prototype.update = function (dt) {
	//	logInfo("Update Boss");
}

JackDanger.AgentJackIEC.prototype.Boss.prototype.disposeLevel = function () {
	if (!this.initialized) return;

	logInfo("Dispose Boss");
}