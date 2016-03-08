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


	// Gets called each frame to update animations
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


	// Update AI every frame
	updateAI: function () {

	},


	// Gets called when jack hits this
	onHitByJack: function (attackStrength) {
		this.health -= attackStrength;

		if (this.health <= 0) {
			this.die();
		}
	},


	// enemy die
	die: function () {
		this.dead = true;
	}
};