//  ______ _   _ ______ __  ____     __
// |  ____| \ | |  ____|  \/  \ \   / /
// | |__  |  \| | |__  | \  / |\ \_/ / 
// |  __| | . ` |  __| | |\/| | \   /  
// | |____| |\  | |____| |  | |  | |   
// |______|_| \_|______|_|  |_|  |_|   
//                                     
JackDanger.AgentJackIEC.prototype.Maze.prototype.Enemy = function () {return this;}
JackDanger.AgentJackIEC.prototype.Maze.prototype.Enemy.prototype = {
	init: function (enemySettings, main) {
		this.sprite = main.add.sprite(enemySettings.x, enemySettings.y, enemySettings.spriteName); // Setup Sprite
		this.main = main;
		this.main.maze.entityLayer.add(this.sprite);
		this.main.physics.arcade.enable(this.sprite); // Enable physics

		// Scale + anchor
		this.sprite.scale.setTo(this.main.globalScale); // Set Scale to global scale
		this.sprite.anchor.setTo(0.5, 0.5); // Set Anchor to center

		// Physics settings
		this.sprite.body.collideWorldBounds = true; // Enable collision with world bounds
		this.sprite.body.setSize(15, 20, 0, 0);
		this.sprite.isEnemy = true;
		this.sprite.deltaLowY = 50;

		// Enemy States
		this.walkAnimationBlocked = false;

		// Enemy Stats
		this.hitSpeed = enemySettings.hitSpeed;
		this.fullSpeed = enemySettings.fullSpeed;
		this.walkSpeed = this.fullSpeed;
		this.maxHealth = enemySettings.maxHealth;
		this.health = this.maxHealth;
		this.attackStrength = enemySettings.attackStrength;
		this.sector = enemySettings.sector;
		this.hitting = false;

		this.targetPosition = new Phaser.Point();

		////
		// Enemy Animations
		////
		// Enemy Animation Run Left-Right
		this.sprite.animations.add("run-lr-idle", ["run-lr-idle"], 1, true, false);
		this.sprite.animations.add("run-lr", Phaser.Animation.generateFrameNames('run-lr-', 1, 6, '', 4), 8, true, false);

		// Enemy Animation Run Up
		// this.sprite.animations.add("run-up-idle", Phaser.Animation.generateFrameNames('run-up-idle-', 0, 0, '', 4), 1, true, false);
		// this.sprite.animations.add("run-up", Phaser.Animation.generateFrameNames('run-up-', 0, 17, '', 4), 40, true, false);

		// // Enemy Animation Run Down
		// this.sprite.animations.add("run-down-idle", Phaser.Animation.generateFrameNames('run-down-idle-', 0, 0, '', 4), 1, true, false);
		// this.sprite.animations.add("run-down", Phaser.Animation.generateFrameNames('run-down-', 0, 17, '', 4), 40, true, false);

		// // Enemy Animation Punching
		// this.sprite.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 6, '', 4), 20, false, false);
		// this.sprite.animations.add("punch-up", Phaser.Animation.generateFrameNames('punch-up-', 0, 5, '', 4), 20, false, false);
		// this.sprite.animations.add("punch-down", Phaser.Animation.generateFrameNames('kick-down-', 0, 10, '', 4), 30, false, false);
		
		return this;
	},


	// Update every frame
	update: function (dt, jackPosition, currentSector) {
		if (this.sector != currentSector)
			return;

		this.updateAI(dt, jackPosition);
		this.updateAnimation();
		this.updateCollision();
	},


	// Update AI every frame
	updateAI: function (dt, jack) {
		this.targetPosition = jack.sprite.position;
		var distanceToTarget = Phaser.Point.distance(this.targetPosition, this.sprite.position);

		if (distanceToTarget > 20.0) {
			var direction = Phaser.Point.subtract(this.targetPosition, this.sprite.position).normalize();

			this.sprite.body.velocity = direction.multiply(this.walkSpeed * dt * 1000, this.walkSpeed * dt * 1000);
		} else {
			this.sprite.body.velocity = new Phaser.Point();

			if (!this.hitting) {
				this.hitting = true;
				var sprite = this.sprite;
				sprite.tint = 0x0000FF;
				
				var cacheJack = jack;
				var cacheThis = this;


				// TODO REPLACE THIS WITH HIT ANIMATION + onComplete CALLBACK
				setTimeout(function () {
					sprite.tint = 0xFFFFFF;
					cacheThis.hitting = false;

					logInfo(Phaser.Point.distance(jack.sprite.position, sprite.position));
					if (Phaser.Point.distance(jack.sprite.position, sprite.position) <= 20 && cacheThis.health > 0) {
						jack.damage();
					}
				}, 1000);
			}
		}
	},


	// Gets called each frame to update animations
	updateAnimation: function () {
		if (this.walkAnimationBlocked)
			return;

		// Play correct animation
		if (this.sprite.body.velocity.y === 0 && this.sprite.body.velocity.x === 0) {
			// Idle Animations
			this.sprite.animations.play("run-lr-idle");
		} else {
			// Walking animations for corresponding direcitons
			if (this.sprite.body.velocity.y != 0 || this.sprite.body.velocity.x < 0) {
				this.sprite.animations.play("run-lr");
			} else if (this.sprite.body.velocity.y != 0 || this.sprite.body.velocity.x < 0) {
				this.sprite.animations.play("run-lr");
			}
			//  else if (this.lastDirection == this.possibleDirections.UP) {
			// 	this.sprite.animations.play("run-up");
			// } else if (this.lastDirection == this.possibleDirections.DOWN) {
			// 	this.sprite.animations.play("run-down");
			// }
		}

		// Correct flip
		if (this.sprite.body.velocity.x > 0 && this.sprite.scale.x < 0)
			this.sprite.scale.x *= -1;
		else if (this.sprite.body.velocity.x < 0 && this.sprite.scale.x > 0)
			this.sprite.scale.x *= -1;

		// if (this.sprite.body.velocity.y == 0 && this.jack.sprite.scale.x < 0)
		// 	this.jack.sprite.scale.x *= -1;
	},


	updateCollision: function () {
		for (var i = 0; i < this.main.maze.entityLayer.children.length; i++) {
			var child = this.main.maze.entityLayer.children[i];

			// Skip Player Collision
			if (child.isPlayer)
				continue;

			this.main.physics.arcade.collide(this.sprite, child);
		}

		if ((this.sprite.body && this.sprite.body.shouldDebug)) {
			this.main.game.debug.body(this.sprite);
		}
	},


	// Gets called when jack hits this
	onHitByJack: function (attackStrength) {
		this.health -= attackStrength;

		var sprite = this.sprite;
		sprite.tint = 0xFF0000;
		setTimeout(function () {
			sprite.tint = 0xFFFFFF;
		}, 500);


		if (this.health <= 0) {
			this.die();
		}
	},


	// enemy die
	die: function () {
		this.dead = true;
		this.sprite.destroy();
	}
};