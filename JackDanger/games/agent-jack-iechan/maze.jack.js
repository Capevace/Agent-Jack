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

		
		// Player Shadow (Disabled for now)
//		this.sprite.shadow = main.add.sprite(main.game.world.centerX, main.game.world.centerY, "jack");
//		this.sprite.shadow.anchor.setTo(0.5, 1);
//		this.sprite.shadow.tint = 0x000000;
//		this.sprite.shadow.alpha = 0.2;
//		this.sprite.shadow.offset = {x: 0, y: -29};
//		this.main.maze.entityLayer.add(this.sprite.shadow);
		
		return this;
	},


	// Possible walking directions for jack
	possibleDirections: {
		LEFT: 0,
		RIGHT: 1,
		UP: 2,
		DOWN: 3
	},

	// Gets called every frame
	update: function (dt) {
		this.updateInput(dt);
		this.updateAnimation(dt);
//		this.updateShadow(dt);
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


	// Update Shadow for Jack (Disabled for now)
	updateShadow: function (dt) {
		// Update Shadow
//		this.sprite.shadow.frame = this.sprite.frame;
//		this.sprite.shadow.scale.setTo(this.sprite.scale.x , -0.25);
//		this.sprite.shadow.position.setTo(this.sprite.position.x + this.sprite.shadow.offset.x, this.sprite.position.y + this.sprite.height/2 + this.sprite.shadow.offset.y);
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
		}
	},


	// Gets called to update all player collisions
	updateCollision: function () {
		// collide with colliders
		for (var i = 0; i < this.main.maze.entityLayer.children.length; i++) {
			var child = this.main.maze.entityLayer.children[i];
			
			if (child.isPlayer)
				continue;
			
			this.main.physics.arcade.collide(this.sprite, child);
			
			if (child.body && child.body.shouldDebug) {
				this.main.game.debug.body(child);
			}
		}
		
		// Look for triggers and activate them if jump pressed
		var shouldTrigger = Pad.justDown(Pad.JUMP);
		var jack = this;
		this.main.maze.triggersWithPlayer.forEach(function (trigger, i, triggers) {
			var overlaps = trigger.getBounds().contains(jack.sprite.position.x,  jack.sprite.position.y + (jack.sprite.height / 2) - 32);
			
			// If Player overlaps with trigger display action dialog
			if (overlaps)
				trigger.update();
						
			if (shouldTrigger && !trigger.isUsed) {
				trigger.trigger();
			}
		}, this.jack);
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