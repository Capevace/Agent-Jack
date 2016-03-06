JackDanger.AgentJackIEC.prototype.Maze.prototype.Hack = function (main, callback, scope) {
	this.main = main;
	this.callback = callback;
	this.scope = scope;
	this.active = true;
	this.background = this.main.add.sprite(this.main.world.width/2, 0, "hack-circles", "bg"); // Change Sprite to correct one!
	this.background.alpha = 1;
	this.background.anchor.setTo(0.5);
	this.background.scale.setTo(this.main.globalScale);
	this.background.position.setTo(this.main.world.width/2, this.background.height);
	this.main.maze.hackLayer.add(this.background);

	this.maxRad = (2 * Math.PI);

	var circle1 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "1");
	circle1.anchor.setTo(0.5);
	circle1.scale.setTo(this.main.globalScale);
	circle1.rotation = Math.random() * this.maxRad;
	circle1.tint = 0x00FF00;
	this.main.maze.hackLayer.add(circle1);

	var circle2 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "2");
	circle2.anchor.setTo(0.5);
	circle2.scale.setTo(this.main.globalScale);
	circle2.rotation = Math.random() * this.maxRad;
	this.main.maze.hackLayer.add(circle2);

	var circle3 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "3");
	circle3.anchor.setTo(0.5);
	circle3.scale.setTo(this.main.globalScale);
	circle3.rotation = Math.random() * this.maxRad;
	this.main.maze.hackLayer.add(circle3);

	var circle4 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "4");
	circle4.anchor.setTo(0.5);
	circle4.scale.setTo(this.main.globalScale);
	circle4.rotation = Math.random() * this.maxRad;
	this.main.maze.hackLayer.add(circle4);

	this.center = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "center");
	this.center.anchor.setTo(0.5);
	this.center.scale.setTo(this.main.globalScale);
	this.main.maze.hackLayer.add(this.center);

	this.circles = [circle1, circle2, circle3, circle4];
	this.selectedCircle = 0;
	this.connectionDone = false;

	this.previousTarget = this.main.camera.target;
	this.main.camera.unfollow();
	this.main.camera.position = new Phaser.Point(this.background.position.x, this.background.position.y - this.background.height/3.5 + 1);
	
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.Hack.prototype = {

	update: function () {
		if (this.connectionDone) {
			return;
		}

		if (Pad.justDown(Pad.DOWN)) {			
			this.selectedCircle++;

			if (this.selectedCircle >= 4) {
				this.selectedCircle = 3;
			}

		} else if (Pad.justDown(Pad.UP)) {			
			this.selectedCircle--;

			if (this.selectedCircle < 0) {
				this.selectedCircle = 0;
			}
		}

		var circle = this.circles[this.selectedCircle];
		logInfo(circle.rotation);

		if (Pad.isDown(Pad.LEFT)) {
			circle.rotation += 0.0349066/2; // 5 Degrees per frame
		} else if (Pad.isDown(Pad.RIGHT)) {
			circle.rotation -= 0.0349066/2; // 5 Degrees per frame
		}

		var allActive = true;
		for (var i = 0; i < this.circles.length; i++) {
			var circle = this.circles[i];

			while (circle.rotation > this.maxRad) {
				circle.rotation = circle.rotation - this.maxRad;
			}

			while (circle.rotation < 0) {
				circle.rotation = this.maxRad - circle.rotation;
			}

			if (circle.rotation >= -0.04886316915294853 && circle.rotation >= 6.234322138) {
				circle.tint = 0x00FF00;
			} else {
				allActive = false;
				circle.tint = 0xFF0000;

				if (i == this.selectedCircle)
					circle.tint = 0x0000FF;
			}
		}

		if (allActive) {
			this.endGame();
		}
	},
	
	endGame: function () {
		this.connectionDone = true;
		this.dispose();
	},


	dispose: function () {
		this.background.kill();
		this.center.kill();

		for(var i = 0; i < this.circles.length; i++) {
			this.circles[i].kill();
		}

		this.main.camera.follow(this.previousTarget, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
		this.callback(this.scope);
	}
};