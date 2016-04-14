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
		this.running = true;
        this.groundY = 375;

		this.jack = this.game.add.sprite(this.game.world.width/2, this.groundY, "jack", "run-lr-idle-0000");
		this.jack.scale.setTo(this.game.globalScale);
		this.jack.anchor.setTo(0.5, 1);

        this.game.physics.arcade.enable(this.jack); // Enable jack physics
        this.jack.body.velocity.y = this.jack.jumpBreak;
		this.jack.body.collideWorldBounds = true; // Enable collision with world bounds
        this.jack.body.setSize(18, 20, 0, -25);
        this.jack.body.immovable = false;

		this.jack.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 6, '', 4), 20, false, false);
		this.jack.animations.add("punch-up", Phaser.Animation.generateFrameNames('punch-up-', 0, 5, '', 4), 20, false, false);
		this.jack.animations.add("idle", ["run-lr-idle-0000"], 30, false, false);
		this.jack.animations.add("run-lr", Phaser.Animation.generateFrameNames('run-lr-', 0, 16, '', 4), 40, true, false);
        this.jack.animations.add("dash", ["dash-0000", "dash-0001", "dash-0002", "dash-0002", "dash-0002", "dash-0002", "dash-0002", "dash-0003", "dash-0004", "dash-0005"], 20, false, false);
        this.jack.animations.add("dash-air", ["dash-air-0000", "dash-air-0001", "dash-air-0002", "dash-air-0002", "dash-air-0002", "dash-air-0002", "dash-air-0002", "dash-air-0003"], 20, false, false);
        this.jack.animations.add("jump", ["jump-0000", "jump-0001", "jump-0001", "jump-0001", "jump-0001", "jump-0001", "jump-0002", "jump-0002", "jump-0002", "jump-0002", "jump-0002", "jump-0003"], 28, false, false);

        this.jack.walkingDirection = 0;
        this.jack.walkingSpeed = 5;
        this.jack.sliding = false;
        this.jack.slideVelocity = 1100;
        this.jack.slideBreak = 4000;
        this.jack.jumping = false;
        this.jack.jumpVelocity = 1000;
        this.jack.jumpBreak = 5000;
		this.jack.lives = 3;
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
		this.jack.hit = function () {
            this.lives--;

            logInfo(this.lives);

            if (this.lives <= 0)
                logInfo("I'm dead!");
		};

        this.ground = this.game.add.sprite(0, 350, "", "");
        this.game.physics.arcade.enable(this.ground);
        this.ground.scale.setTo(this.game.globalScale);
        this.ground.anchor.setTo(0);
        this.ground.body.immovable = true;
        this.ground.body.setSize(1000, 100);


        this.enemy = this.game.add.sprite(200, 350, "enemy", "run-lr-0001");
        this.game.physics.arcade.enable(this.enemy);
        this.enemy.scale.setTo(this.game.globalScale * 2);
        this.enemy.scale.x *= -1;
        this.enemy.anchor.setTo(0.5, 0.85);
        this.enemy.body.mass = 1000;
        this.enemy.body.collideWorldBounds = true;

        this.enemy.jumpAttackTime = 0.0;
        this.enemy.jumpAttackActive = false;
        this.enemy.jumpAttackPerFrameX = 0;
        this.enemy.jack = this.jack;

        this.enemy.jumpOnPlayer = function (playerPosition) {
            this.jumpAttackTime = 0.0;
            this.jumpAttackActive = true;
            this.jumpAttackPerFrameX = playerPosition.x - this.position.x + 50;
        };
        this.enemy.updateJumpAttack = function (dt) {
            this.jumpAttackTime += dt;

            var y = 800 * this.jumpAttackTime - (2000/2) * Math.pow(this.jumpAttackTime, 2);

            if (y < 0) {
                this.jumpAttackActive = false;
                this.jumpSmash();
            }

            this.position.y = 350 - y;
            this.position.x += this.jumpAttackPerFrameX * (dt * 1);
        };
        this.enemy.jumpSmash = function () {
            if (Math.abs(this.position.x - this.jack.position.x) < 80.0) {
                this.jack.hit();
            }
        };

        this.enemy.shoot = function (direction) {
            this.jumpOnPlayer(this.jack.position);
        };

        this.enemy.turnToPlayer = function () {
            if (this.jack.position.x > this.position.x) {
                this.scale.x = 8;
            } else {
                this.scale.x = -8;
            }
        };

        this.enemy.AISteps = ["turn", "jump", "turn", "shoot_up", "turn", "jump", "turn", "shoot_down", "turn", "jump", "turn", "shoot", "turn", "recharge"];
        this.enemy.currentAIStep = 0;

        this.enemy.updateAIFunction = function () {

            switch (this.AISteps[this.currentAIStep]) {
                case "jump":
                    this.jumpOnPlayer(this.jack.position);
                    break;
                case "shoot_up":
                    this.shoot(0);
                    break;
                case "shoot_down":
                    this.shoot(1);
                    break;
                case "shoot":
                    this.shoot(parseInt(Math.round(Math.random())));
                    break;
                case "turn":
                    this.turnToPlayer();
                    break;
                case "recharge":

                    break;
                default:
                    break;
            }

            this.currentAIStep++;
            if (this.currentAIStep >= this.AISteps.length || this.currentAIStep < 0)
                this.currentAIStep = 0;
        };
        var enemy = this.enemy;
        this.enemy.updateAI = setInterval(function () {
            enemy.updateAIFunction();
        }, 2000)
	},

	update: function (dt) {
        this.updateJackInput(dt);

        if (this.enemy.jumpAttackActive)
            this.enemy.updateJumpAttack(dt);

        this.updateHitDetection(dt);

        this.game.game.debug.body(this.enemy);
        //
        // this.game.game.debug.body(this.ground);
        // this.game.game.debug.body(this.jack);
        // logInfo(this.jack.position.y);
        //
        //
        this.game.physics.arcade.collide(this.ground, this.enemy);
        this.game.physics.arcade.collide(this.ground, this.jack);
        this.game.physics.arcade.collide(this.enemy, this.jack);
	},

	updateJackInput: function (dt) {
        // Left right movement
        if (Pad.isDown(Pad.LEFT) && !this.jack.sliding) {
            this.jack.position.x -= this.jack.walkingSpeed;
            this.jack.walkingDirection = 1;

            if (!this.jack.jumping)
                this.jack.play("run-lr");

            this.jack.flip(true);
        } else if (Pad.isDown(Pad.RIGHT) && !this.jack.sliding) {
            this.jack.position.x += this.jack.walkingSpeed;
            this.jack.walkingDirection = 0;

            if (!this.jack.jumping)
                this.jack.play("run-lr");

            this.jack.flip(false);
        } else if (!this.jack.sliding && !this.jack.jumping) {
            this.jack.play("idle");
        }

        // Jump
        if (Pad.justDown(Pad.UP) && !this.jack.jumping) {
            this.jack.jumping = true;
            this.jack.body.velocity.y = -this.jack.jumpVelocity;
            this.jack.play("jump");
        }

        // Kick
        if (Pad.justDown(Pad.SHOOT)) {

        }

        // Dash
        if (Pad.justDown(Pad.JUMP) && !this.jack.sliding) {
            this.jack.sliding = true;

            if (this.jack.walkingDirection === 0) {
                this.jack.body.velocity.x = this.jack.slideVelocity;
            } else {
                this.jack.body.velocity.x = -this.jack.slideVelocity;
            }

            if (this.jack.jumping)
                this.jack.play("dash-air");
            else
                this.jack.play("dash");
        }

        this.updateVelocity(dt);
	},

    updateVelocity: function (dt) {
        if (this.jack.sliding) {
            this.jack.body.velocity.y = 50;
            if (this.jack.walkingDirection === 0) {
                this.jack.body.velocity.x -= this.jack.slideBreak * dt;

                if (this.jack.body.velocity.x <= 0) {
                    this.jack.body.velocity.x = 0;
                    this.jack.sliding = false;
                }
            } else {
                this.jack.body.velocity.x += this.jack.slideBreak * dt;

                if (this.jack.body.velocity.x >= 0) {
                    this.jack.body.velocity.x = 0;
                    this.jack.sliding = false;
                }
            }
        } else if (this.jack.jumping) {
            this.jack.body.velocity.y += this.jack.jumpBreak * dt;

            if (this.jack.body.velocity.y > 0 && this.jack.position.y >= this.groundY) {
                this.jack.body.velocity.y = 0;
                this.jack.position.y = this.groundY;
                this.jack.jumping = false;
            }
        }
    },

    updateHitDetection: function (dt) {
        if (this.jack.sliding) {
            // Check for hit
            if (this.game.physics.arcade.collide(this.enemy, this.jack)) {
                logInfo("HIT");
            }
        }
    },

	disposeLevel: function () {
		if (!this.initialized) return;
		this.running = false;

		clearInterval(this.sMLoop);

		logInfo("Dispose Boss");
	}
};
