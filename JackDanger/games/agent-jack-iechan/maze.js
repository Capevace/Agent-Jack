//  __  __           ____________ 
// |  \/  |   /\    |___  /  ____|
// | \  / |  /  \      / /| |__   
// | |\/| | / /\ \    / / |  __|  
// | |  | |/ ____ \  / /__| |____ 
// |_|  |_/_/    \_\/_____|______|
//     


function setX (y) {
	jackPlayer.sprite.position.x = x;
}    

function setY (y) {
	jackPlayer.sprite.position.y = y;
}        

var jackPlayer;
var main;
JackDanger.AgentJackIEC.prototype.Maze = function(parent) {
	this.initialized = false;
	this.main = parent;
}

JackDanger.AgentJackIEC.prototype.Maze.prototype = {
	initLevel: function() {
		logInfo("Init Maze");
		this.initialized = true; // Used to avoid double initializing

		// Setup Sprite Layers
		this.backgroundLayer = this.main.add.group();
		this.entityLayer = this.main.add.group();
		this.foregroundLayer = this.main.add.group();
		this.uiLayer = this.main.add.group();
		this.hackLayer = this.main.add.group();

		this.activeHack = null; // Set active Hack to null
		this.currentSector = 0;

		this.borderOffsetX = 112; // Offset, which is removed from background because of scale

		// Setup Scene
		this.setupScene();

		// UI
		this.ui = new this.UserInterface(this.main);


		// Setup Jack
		this.jack = new this.Jack().init(this.main.world.centerX, this.main.world.height - 1000, this.main);

		jackPlayer = this.jack; // Debug!
		console.warn("Remove global var jackPlayer + main before release!! Just for debug!!");

		// this.enemy = this.main.add.sprite(200, 200, 'jack');
		// this.main.physics.arcade.enable(this.enemy);
		// this.enemy.scale.setTo(this.main.globalScale, this.main.globalScale + 1); // Set Scale to global scale
		// this.enemy.anchor.setTo(0.5, 0.5); // Set Anchor to center
		// this.enemy.body.collideWorldBounds = true;
		// this.enemy.onJackHit = function() {
		// 	logInfo("I'm hit! Meeediiiic!!");
		// 	this.body.enable = false;
		// 	this.kill();
		// 	this.enemyList.remove(this);
		// };

		// var enemy = this.main.add.sprite(this.jack.sprite.position.x, this.jack.sprite.position.y, "jack");
		// this.main.physics.arcade.enable(enemy);
		// enemy.scale.setTo(this.main.globalScale, this.main.globalScale + 1);
		// enemy.anchor.setTo(0.5);
		// enemy.body.collideWorldBounds = true;
		// enemy.body.setSize(15, 25, 0, 0);
		// enemy.isEnemy = true;
		// enemy.onJackHit = function() {
		// 	logInfo("I'm hit! Meeediiiic!!");
		// };
		// this.enemies.push(enemy);
		// this.entityLayer.add(enemy);


		// Set Camera to follow player
		this.main.camera.follow(this.jack.sprite, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
	},


	// Setup scene (Add all Top Layer Entities)
	setupScene: function() {
		// Define Scene Object
		this.scene = {};
		this.sceneData = this.main.cache.getJSON("maze-scene");

		// Setup World + Physics
		this.main.world.setBounds(0, 0, this.sceneData.worldSize.x, this.sceneData.worldSize.y);
		this.main.physics.startSystem(Phaser.Physics.ARCADE);

		// Set World Background
		this.scene.background = this.main.add.sprite(this.main.world.centerX, this.main.world.height, "maze-bg");
		this.scene.background.anchor.setTo(0.5, 1);
		this.scene.background.scale.setTo(this.main.globalScale);
		this.backgroundLayer.add(this.scene.background);

		this.debugAll = this.sceneData.debugAll;

		this.enemies = [];

		// Define Gate
		this.scene.gate = {
			main: this.main,
			opened: false,
			moving: false,
			openGate: function() {
				if (this.opened ||  this.moving)
					return;

				this.moving = true;
				var gate = this;
				var gateL = this.gateDoorL;
				var gateR = this.gateDoorR;
				var closeGate = this.closeGate;

				gateL.body.velocity.x = -25;
				gateR.body.velocity.x = 25;

				setTimeout(function() {
					gateL.body.velocity.x = 0;
					gateR.body.velocity.x = 0;
					gate.opened = true;
					gate.moving = false;
				}, 3500);
			},
			closeGate: function() {
				if (!this.opened ||  this.moving)
					return;

				this.moving = true;
				var gate = this;
				var gateL = this.gateDoorL;
				var gateR = this.gateDoorR;

				gateL.body.velocity.x = 25;
				gateR.body.velocity.x = -25;

				setTimeout(function() {
					gateL.body.velocity.x = 0;
					gateR.body.velocity.x = 0;
					gate.opened = false;
					gate.moving = false;
				}, 3500);
			}
		};

		// Add Gate Left
		this.scene.gate.gateDoorL = this.main.add.sprite(0, 0, "scenery", "gate/gate-door");
		this.main.physics.arcade.enable(this.scene.gate.gateDoorL);
		this.scene.gate.gateDoorL.anchor.setTo(0, 0);
		this.scene.gate.gateDoorL.scale.setTo(this.main.globalScale);
		this.scene.gate.gateDoorL.position.setTo(this.main.world.centerX + 16 - this.scene.gate.gateDoorL.width, this.main.world.height - 568 - 64);
		this.scene.gate.gateDoorL.gate = this.scene.gate;
		this.scene.gate.gateDoorL.body.immovable = true;
		this.scene.gate.gateDoorL.body.sourceWidth = 25;
		this.scene.gate.gateDoorL.body.sourceHeight = 15;
		this.scene.gate.gateDoorL.depthUpdateSettings = {
			shouldUpdateCollider: true,
			sizePlayerUnderSprite: {
				width: 25,
				height: 15,
				offsetX: -100,
				offsetY: 0
			},
			sizePlayerOverSprite: {
				width: 25,
				height: 7,
				offsetX: -100,
				offsetY: 100
			}
		};
		this.entityLayer.add(this.scene.gate.gateDoorL);


		// Add Gate Right
		this.scene.gate.gateDoorR = this.main.add.sprite(0, 0, "scenery", "gate/gate-door");
		this.main.physics.arcade.enable(this.scene.gate.gateDoorR);
		this.scene.gate.gateDoorR.anchor.setTo(0, 0);
		this.scene.gate.gateDoorR.scale.setTo(-this.main.globalScale, this.main.globalScale);
		this.scene.gate.gateDoorR.position.setTo(this.main.world.centerX - 16 - this.scene.gate.gateDoorR.width, this.main.world.height - 568 - 64);
		this.scene.gate.gateDoorR.gate = this.scene.gate;
		this.scene.gate.gateDoorR.body.immovable = true;
		this.scene.gate.gateDoorR.body.sourceWidth = 25;
		this.scene.gate.gateDoorR.body.sourceHeight = 15;
		this.scene.gate.gateDoorR.depthUpdateSettings = {
			sizePlayerUnderSprite: {
				width: 25,
				height: 15,
				offsetX: -225,
				offsetY: 0
			},
			sizePlayerOverSprite: {
				width: 25,
				height: 7,
				offsetX: -225,
				offsetY: 100
			}
		};
		this.entityLayer.add(this.scene.gate.gateDoorR);

		// Debug Listener to open / close door
		this.main.input.keyboard.addKey(Phaser.Keyboard.L).onDown.add(function() {
			if (this.opened) {
				this.closeGate();
			} else {
				this.openGate();
			}
		}, this.scene.gate);


		// Create first gate trigger
		this.triggersWithPlayer.createTrigger(240, 550, 84, 76, this.main, function(main) {
			if (main.maze.activeHack == null) {
				main.maze.activeHack = new main.maze.Hack(main, function() {
					main.maze.activeHack = null;
					main.maze.scene.gate.openGate();
				});
			}
		}, false);


		// Loop through entities and create every single one
		for (var i = 0; i < this.sceneData.entities.length; i++) {
			var entityData = this.sceneData.entities[i];

			if (entityData.position == undefined && entityData.sprite == undefined && entityData.spritesheet == undefined && entityData.sizePlayerUnderSprite == undefined && entityData.sizePlayerOverSprite == undefined && entityData.id == undefined)
				continue;

			var sprite = this.main.add.sprite(entityData.position.x, this.main.game.world.height - entityData.position.y, entityData.spritesheet, entityData.sprite);
			this.main.physics.arcade.enable(sprite);
			sprite.id = entityData.id;
			sprite.scale.setTo(this.main.globalScale);
			sprite.anchor.setTo((entityData.anchor) ? entityData.anchor.x : 0, (entityData.anchor) ? entityData.anchor.y : 0);
			sprite.body.immovable = (entityData.immovable) ? true : false;
			sprite.depthUpdateSettings = {
				sizePlayerUnderSprite: entityData.sizePlayerUnderSprite, // {width: 75, height: 17, offsetX: 0, offsetY: 256}
				sizePlayerOverSprite: entityData.sizePlayerOverSprite
			};

			if (entityData.deltaLowY != undefined)
				sprite.deltaLowY = entityData.deltaLowY;

			if (entityData.forcedZ != undefined)
				sprite.forcedZ = entityData.forcedZ;

			sprite.body.shouldDebug = (entityData.shouldDebug);

			this.entityLayer.add(sprite);
		}

		for (var i = 0; i < this.sceneData.enemies.length; i++) {
			var enemyData = this.sceneData.enemies[i];
			enemyData.y = this.main.world.height - enemyData.y;

			var enemy = new this.Enemy().init(enemyData, this.main);
			this.enemies.push(enemy);
			this.entityLayer.add(enemy.sprite);
		}
	},


	// // List Of Enemies that are hittable by player
	// enemies: {
	// 	push: function(body) {
	// 		this.bodies.push(body);
	// 	},
	// 	remove: function(body) {
	// 		var index = this.bodies.indexOf(body);

	// 		if (index != -1)
	// 			this.bodies.splice(index, 1);
	// 	},
	// 	forEach: function(callback, jack) {
	// 		if (this.bodies.length == 0)
	// 			callback(null, -1, this.bodies, jack);

	// 		for (var i = 0; i < this.bodies.length; i++) {
	// 			var body = this.bodies[i];
	// 			if (body.dead) {
	// 				// Remove object out of array
	// 				this.bodies.splice(i, 1);

	// 				// go back one index. for loop would skip next item otherwise
	// 				i--;
	// 				continue;
	// 			} else {
	// 				if (callback(body, i, this.bodies, jack))
	// 					i = this.bodies.length;
	// 			}
	// 		}
	// 	},
	// 	bodies: []
	// },


	// List of items that can be triggered by the player
	triggersWithPlayer: {
		createTrigger: function(x, y, width, height, scope, callback, shouldDebug) {
			var trigger = {
				getBounds: function() {
					return this.bounds;
				},
				bounds: new Phaser.Rectangle(x, scope.game.world.height - y, width, height),
				trigger: function() {
					if (!this.used) {
						this.used = true;
						this.callback(this.main);
					}
				},
				callback: callback,
				main: scope,
				update: function() {

				},
				used: false,
				shouldDebug: shouldDebug ||  false
			}

			this.push(trigger);
			return trigger;
		},
		push: function(trigger) {
			this.triggers.push(trigger);
		},
		remove: function(trigger) {
			var index = this.triggers.indexOf(trigger);

			if (index != -1)
				this.triggers.splice(index, 1);
		},
		forEach: function(callback, main) {
			if (this.triggers.length == 0)
				return;

			for (var i = 0; i < this.triggers.length; i++) {
				var trigger = this.triggers[i];
				if (trigger.used) {
					// Remove object out of array
					this.triggers.splice(i, 1);

					// go back one index. for loop would skip next item otherwise
					i--;
					continue;
				} else {
					if (callback(trigger, i, this.triggers, main))
						i = this.triggers.length;
				}
			}
		},
		triggers: []
	},


	// Called every frame
	update: function(dt) {
		if (this.activeHack != null) {
			this.activeHack.update();
		} else {
			// Update Jack
			this.jack.update(dt);
			this.updateEnemies(dt, this.jack, this.currentSector);

			// Sort depth after all other code was run
			this.sortDepth();
			this.debug();
		}
	},


	sortDepth: function() {
		// Go through all entities and sort depth
		this.entityLayer.customSort(function(a, b) {
			// Get lower Y of a
			var aY = (a.deltaLowY != undefined) ? a.position.y + a.deltaLowY * (1 - a.anchor.y) : a.position.y + (a.height * (1 - a.anchor.y));

			// Get lower Y of b
			var bY = (b.deltaLowY != undefined) ? b.position.y + b.deltaLowY * (1 - b.anchor.y) : b.position.y + (b.height * (1 - b.anchor.y));

			// Reset positions if a or b is player
			if (a.isPlayer) {
				aY = a.position.y + (a.height / 2) - 32;
			} else if (b.isPlayer) {
				bY = b.position.y + (b.height / 2) - 32;
			}

			if (aY > bY) { // If a 'infront' (under) then put to foreground
				return 1;
			} else if (aY < bY) { // If a 'behind' (over) then put to background
			return -1;
		}

		return 0;
	}, this);

		// Go through entities again to update depth colliders with player
		for (var i = 0; i < this.entityLayer.children.length; i++) {
			var child = this.entityLayer.children[i];

			// Skip if we get the player entity
			if (child.isPlayer)
				continue;

			// Get Jack and Child lower Y
			var jackY = this.jack.sprite.position.y + (this.jack.sprite.height / 2) - 32;
			var childY = (child.deltaLowY != undefined) ? child.position.y + child.deltaLowY * (1 - child.anchor.y) : child.position.y + (child.height * (1 - child.anchor.y));

			// If Jack infront of child => collider = playerUnderSprite
			if (jackY > childY) {
				if (child.body && child.depthUpdateSettings) {
					child.body.setSize(child.depthUpdateSettings.sizePlayerUnderSprite.width, child.depthUpdateSettings.sizePlayerUnderSprite.height, this.main.maze.borderOffsetX + child.depthUpdateSettings.sizePlayerUnderSprite.offsetX, child.depthUpdateSettings.sizePlayerUnderSprite.offsetY);
				}
			}

			// If Jack infront of child => collider = playerOverSprite
			else {
				if (child.body && child.depthUpdateSettings) {
					child.body.setSize(child.depthUpdateSettings.sizePlayerOverSprite.width, child.depthUpdateSettings.sizePlayerOverSprite.height, this.main.maze.borderOffsetX + child.depthUpdateSettings.sizePlayerOverSprite.offsetX, child.depthUpdateSettings.sizePlayerOverSprite.offsetY);
				}
			}
		}
	},


	// Updates All Enemies
	updateEnemies: function (dt, jack, currentSector) {
		for (var i = 0; i < this.enemies.length; i++) {
			var enemy = this.enemies[i];

			if (enemy.dead) {
				this.enemies.splice(i, 1);
				i--; // Go back one index so we dont skip the next item

			} else {
				this.enemies[i].update(dt, jack, currentSector);
			}
		}
	},


	// Unload Level (remove all sprites)
	disposeLevel: function() {
		if (!this.initialized) return;

		logInfo("Dispose Maze");
	},

	// Put debug in here
	debug: function() {
		//		this.main.game.debug.body(this.jack.sprite);
	}
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.UserInterface = function (main) {
	this.enabled = true;
	this.main = main;

	this.health = this.main.add.text(0, 0, "HP: 99", {color: 0xFFFFFF});
    this.health.fixedToCamera = true;

    this.main.maze.uiLayer.add(this.health);

	return this;
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.UserInterface.prototype = {

	setHP: function (hp) {
		this.health.text = "HP: " + hp;
	}
};