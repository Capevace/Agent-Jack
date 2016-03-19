//  ____   ____   _____ _____ 
// |  _ \ / __ \ / ____/ ____|
// | |_) | |  | | (___| (___  
// |  _ <| |  | |\___ \\___ \ 
// | |_) | |__| |____) |___) |
// |____/ \____/|_____/_____/ 
//
JackDanger.AgentJackIEC.prototype.Boss = function (parent) {
	this.initialized = false;
	this.game = parent;
}

JackDanger.AgentJackIEC.prototype.Boss.prototype = {
	initLevel: function () {
		logInfo("Init Boss");

		this.game.world.setBounds(0, 0, 800, 450);

		this.jack = this.game.add.sprite(this.game.world.width/2, this.game.world.height - 100, "jack", "run-lr-idle-0000");
		this.jack.scale.setTo(this.game.globalScale);
		this.jack.anchor.setTo(0.5, 1);
		this.jack.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 6, '', 4), 20, false, false);
		this.jack.animations.add("punch-up", Phaser.Animation.generateFrameNames('punch-up-', 0, 5, '', 4), 20, false, false);
		this.jack.animations.add("idle", ["run-lr-idle-0000"], 30, false, false);

		this.jack.health = 100;
		this.jack.sound = {
			hit: this.game.add.audio("jack-hit"),
			noHit: this.game.add.audio("jack-nohit")
		};

		this.jack.flip = function (left) {
			// Left true => -1
			// Left right => 1
			if ((left && this.scale.x >= 0) || (!left && this.scale.x < 0))
				this.scale.x *= -1;
		};
		this.jack.hit = function (left, $enemies) {
			for (var i = 0; i < $enemies.length; i++) {
				var enemy = $enemies[i];
				var inRange = (enemy.isLeft) ? enemy.position.x >= 300 : enemy.position.x <= 500;

				if (enemy.isLeft === left && inRange) {
					this.sound.hit.play(false);
					enemy.tint = 0xFF0000;
					setTimeout(function () {
						enemy.destroy();
					}, 50);
					$enemies.splice(i, 1);
					
					i = $enemies.length;
				} else {
					this.sound.noHit.play(false);
				}
			}
		};

		this.enemies = [];
		this.enemiesCount = 20;

		this.canPunch = true;
		this.punchCooldown = 0;

		var self = this;
		setInterval(function () {
			self.spawnMachine();
		}, 500);
	},

	update: function (dt) {
		this.updateInput(dt);
	},

	updateInput: function (dt) {
		if (!this.canPunch) {
			this.punchCooldown -= dt;

			if (this.punchCooldown <= 0) {
				this.canPunch = true;
			}
		}

		if (Pad.justDown(Pad.LEFT) && this.canPunch) {
			this.jack.animations.play("punch-lr");
			this.jack.flip(true);
			this.jack.hit(true, this.enemies);
			this.canPunch = false;
			this.punchCooldown = 0.3;
		} else if (Pad.justDown(Pad.RIGHT) && this.canPunch) {
			this.jack.animations.play("punch-lr");
			this.jack.flip(false);
			this.jack.hit(false, this.enemies);
			this.canPunch = false;
			this.punchCooldown = 0.3;
		} else {
			if (!this.jack.animations.currentAnim.isPlaying) {
				this.jack.animations.play("idle", 30, true);
			}
		}
	},

	updateEnemies: function () {
		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].update();
		}
	},

	spawnMachine: function () {

		if (this.enemiesCount-- <= 0)
			return false;

		var side = Math.round(Math.random());

		if (side === 0) {
			this.spawnEnemy(true);
		} else {
			this.spawnEnemy(false);
		}
		
	},

	spawnEnemy: function (isLeft) {
		var x = (isLeft) ? 20 : this.game.world.width - 20;
		var scale = (isLeft) ? 1 : -1;

		var enemy = this.game.add.sprite(x, this.game.world.height - 100, "jack");
		enemy.scale.setTo(this.game.globalScale);
		enemy.scale.x *= scale;
		enemy.anchor.setTo(0.5, 1);

		this.game.physics.arcade.enable(enemy);
		enemy.body.velocity.setTo(500 * scale, 0);

		enemy.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 10, '', 4), 30, false, false);

		enemy.isLeft = isLeft;
		enemy.startedAttacking = false;
		enemy.update = function () {
			if (this.isLeft && this.position.x >= 350) {
				this.body.velocity = new Phaser.Point();
				this.startAttacking();
			} else if (!this.isLeft && this.position.x <= 450) {
				this.body.velocity = new Phaser.Point();
				this.startAttacking();
			}
		};
		enemy.startAttacking = function () {
			if (this.startedAttacking)
				return;

			this.startedAttacking = true;

			var self = this;
			this.attack();
			setInterval(function () {
				self.attack();
			}, 400);
		};
		enemy.attack = function () {
			this.animations.play("punch-lr", 30, false);
		};

		this.enemies.push(enemy);
	},

	disposeLevel: function () {
		if (!this.initialized) return;

		logInfo("Dispose Boss");
	}
};

