//  __  __           ____________ 
// |  \/  |   /\    |___  /  ____|
// | \  / |  /  \      / /| |__   
// | |\/| | / /\ \    / / |  __|  
// | |  | |/ ____ \  / /__| |____ 
// |_|  |_/_/    \_\/_____|______|
//                 
var jackPlayer;
var main;
JackDanger.AgentJackIEC.prototype.Maze = function (parent) {
	this.initialized = false;
	this.main = parent;
}

JackDanger.AgentJackIEC.prototype.Maze.prototype = {
	initLevel: function () {
		logInfo("Init Maze");
		this.initialized = true;

		// Setup Sprite Layers
		this.backgroundLayer = this.main.add.group();
		this.entityLayer = this.main.add.group();
		this.foregroundLayer = this.main.add.group();
		this.uiLayer = this.main.add.group();
		this.hackLayer = this.main.add.group();

		this.activeHack = null;

		this.borderOffsetX = 112;

		// Setup Scene
		this.setupScene();

		// Setup Jack
		this.jack = new this.Jack().init(this.main.world.centerX, this.main.world.height - 300, this.main);
		jackPlayer = this.jack; // Debug!
		console.warn("Remove global var jackPlayer before release!! Just for debug!!");

		//		this.enemy = this.main.add.sprite(this.main.world.centerX + 2, this.main.world.centerY + 2, 'jack', 'run-lr-idle-0000');
		//		this.main.physics.arcade.enable(this.enemy);
		//		this.enemy.scale.setTo(this.main.globalScale, this.main.globalScale + 1); // Set Scale to global scale
		//		this.enemy.anchor.setTo(0.5, 0.5); // Set Anchor to center
		//		this.enemy.body.collideWorldBounds = true;
		//		this.enemy.onJackHit = function () {
		//			logInfo("I'm hit! Meeediiiic!!");
		//			this.body.enable = false;
		//			this.kill();
		//			this.enemyList.remove(this);
		//		};
		//		this.enemy.enemyList = this.enemies;
		//		this.enemies.push(this.enemy);
		//		this.entityLayer.add(this.enemy);


		// Set Camera to follow player
		this.main.camera.follow(this.jack.sprite, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
	},


	// Setup scene (Add all Top Layer Entities)
	setupScene: function () {
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

		this.scene.gate = {
			main: this.main,
			opened: false,
			moving: false
		};

		// Add Gate Left
		this.scene.gate.gateDoorL = this.main.add.sprite(0, 0, "scenery", "gate/gate-door");
		this.main.physics.arcade.enable(this.scene.gate.gateDoorL);
		this.scene.gate.gateDoorL.anchor.setTo(0, 0);
		this.scene.gate.gateDoorL.scale.setTo(this.main.globalScale);
		this.scene.gate.gateDoorL.position.setTo(this.main.world.centerX  + 16 - this.scene.gate.gateDoorL.width, this.main.world.height-568 - 64);
		this.scene.gate.gateDoorL.gate = this.scene.gate;
		this.scene.gate.gateDoorL.body.immovable = true;
		this.scene.gate.gateDoorL.body.sourceWidth = 25;
		this.scene.gate.gateDoorL.body.sourceHeight = 15;
		this.scene.gate.gateDoorL.depthUpdateSettings = {
			shouldUpdateCollider: true,
			sizePlayerUnderSprite: {width: 25, height: 15, offsetX: -100, offsetY: 0},
			sizePlayerOverSprite: {width: 25, height: 7, offsetX: -100, offsetY: 100}
		};

		this.entityLayer.add(this.scene.gate.gateDoorL);


		// Add Gate Right
		this.scene.gate.gateDoorR = this.main.add.sprite(0, 0, "scenery", "gate/gate-door");
		this.main.physics.arcade.enable(this.scene.gate.gateDoorR);
		this.scene.gate.gateDoorR.anchor.setTo(0, 0);
		this.scene.gate.gateDoorR.scale.setTo(-this.main.globalScale, this.main.globalScale);
		this.scene.gate.gateDoorR.position.setTo(this.main.world.centerX - 16 - this.scene.gate.gateDoorR.width, this.main.world.height-568 - 64);
		this.scene.gate.gateDoorR.gate = this.scene.gate;
		this.scene.gate.gateDoorR.body.immovable = true;
		this.scene.gate.gateDoorR.body.sourceWidth = 25;
		this.scene.gate.gateDoorR.body.sourceHeight = 15;
		this.scene.gate.gateDoorR.depthUpdateSettings = {
			sizePlayerUnderSprite: {width: 25, height: 15, offsetX: -225, offsetY: 0},
			sizePlayerOverSprite: {width: 25, height: 7, offsetX: -225, offsetY: 100}
		};
		this.entityLayer.add(this.scene.gate.gateDoorR);

		this.scene.gate.gateDoorL.body.shouldDebug = true;
		this.scene.gate.gateDoorR.body.shouldDebug = true;
		//		this.scene.gate.fenceL.body.shouldDebug = true;

		// Function to Open Gate
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

		// Function to Close Gate
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

		// Debug Listener to open / close door
		this.main.input.keyboard.addKey(Phaser.Keyboard.L).onDown.add(function () {
			if (this.opened) {
				this.closeGate();
			}
			else {
				this.openGate();
			}
		}, this.scene.gate);

		this.triggersWithPlayer.createTrigger(240, 550, 84, 76, this.main, function (main) {
			if (main.maze.activeHack == null) {
				main.maze.activeHack = new main.maze.Hack(main, function () {
					main.maze.activeHack = null;
					main.maze.scene.gate.openGate();
				});
			}
		});

		for (var i = 0; i < this.sceneData.entities.length; i++) {
			var entityData = this.sceneData.entities[i];

			if (entityData.position == undefined && entityData.sprite == undefined && entityData.spritesheet == undefined && entityData.sizePlayerUnderSprite == undefined && entityData.sizePlayerOverSprite == undefined && entityData.id == undefined)
				continue;

			logInfo(entityData);
			var sprite = this.main.add.sprite(entityData.position.x, entityData.position.y, entityData.spritesheet, entityData.sprite);
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
	},


	// List Of Enemies that are hittable by player
	enemies: {
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
	},


	// List of items that collide with player
	triggersWithPlayer: {
		createTrigger: function (x, y, width, height, scope, callback) {
			var trigger = {
				getBounds: function () {
					return this.bounds;
				},
				bounds: new Phaser.Rectangle(x, scope.game.world.height - y, width, height),
				trigger: function () {
					if (!this.used) {
						this.used = true;
						this.callback(this.main);
					}
				},
				callback: callback,
				main: scope,
				update: function () {

				},
				used: false
			}

			this.push(trigger);
			return trigger;
		},
		push: function (trigger) {
			this.triggers.push(trigger);
		},
		remove: function (trigger) {
			var index = this.triggers.indexOf(trigger);

			if (index != -1)
				this.triggers.splice(index, 1);
		},
		forEach: function (callback, main) {
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


	update: function (dt) {
		if (this.activeHack != null) {
			this.activeHack.update();
		} else {
			// Update Jack
			this.jack.update(dt);

			// Sort depth after all other code was run
			this.sortDepth();
			this.debug();
		}
	},


	sortDepth: function () {
		this.entityLayer.customSort(function (a, b) {
			var aY = (a.deltaLowY != undefined) ? a.position.y + a.deltaLowY * (1 - a.anchor.y) : a.position.y + (a.height * (1 - a.anchor.y));
			var bY = (b.deltaLowY != undefined) ? b.position.y + b.deltaLowY * (1 - b.anchor.y) : b.position.y + (b.height * (1 - b.anchor.y));

			if (a.isPlayer) {
				aY = a.position.y + (a.height / 2) - 32;
			} else if (b.isPlayer) {
				bY = b.position.y + (b.height / 2) - 32;
			}

			if (aY > bY) {
				return 1;
			} else if (aY < bY) {
				return -1;
			}

			return 0;
		}, this);

		for (var i = 0; i < this.entityLayer.children.length; i++) {
			var child = this.entityLayer.children[i];

			if (child.isPlayer)
				continue;

			var jackY = this.jack.sprite.position.y + (this.jack.sprite.height / 2) - 32;
			var childY = (child.deltaLowY != undefined) ? child.position.y + child.deltaLowY * (1 - child.anchor.y) : child.position.y + (child.height * (1 - child.anchor.y));


			if (jackY > childY) {
				if (child.body && child.depthUpdateSettings) {
					child.body.setSize(child.depthUpdateSettings.sizePlayerUnderSprite.width, child.depthUpdateSettings.sizePlayerUnderSprite.height, this.main.maze.borderOffsetX + child.depthUpdateSettings.sizePlayerUnderSprite.offsetX, child.depthUpdateSettings.sizePlayerUnderSprite.offsetY);
				}
			} else {
				if (child.body && child.depthUpdateSettings) {
					child.body.setSize(child.depthUpdateSettings.sizePlayerOverSprite.width, child.depthUpdateSettings.sizePlayerOverSprite.height, this.main.maze.borderOffsetX + child.depthUpdateSettings.sizePlayerOverSprite.offsetX, child.depthUpdateSettings.sizePlayerOverSprite.offsetY);
				}
			}
		}
	},


	disposeLevel: function () {
		if (!this.initialized) return;

		logInfo("Dispose Maze");
	},


	debug: function () {
		//	this.main.game.debug.body(this.jack);
	}
};