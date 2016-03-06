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
		this.scene.gate.gateDoorL.na = "L";
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
		this.scene.gate.gateDoorR.na = "R";
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
			var aY = a.position.y + (a.height * (1 - a.anchor.y));
			var bY = b.position.y + (b.height * (1 - b.anchor.y));

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
			var childY = child.position.y + (child.height * (1 - child.anchor.y)) - 10;

			if (jackY > childY) {
				if (child.body && child.depthUpdateSettings) {
					child.body.setSize(child.depthUpdateSettings.sizePlayerUnderSprite.width, child.depthUpdateSettings.sizePlayerUnderSprite.height, 0, 0);
				}
			} else {
				if (child.body && child.depthUpdateSettings) {
					child.body.setSize(child.depthUpdateSettings.sizePlayerOverSprite.width, child.depthUpdateSettings.sizePlayerOverSprite.height, 0, child.height - (child.depthUpdateSettings.sizePlayerOverSprite.height * 4));
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