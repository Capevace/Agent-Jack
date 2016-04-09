JackDanger.AgentJackIEC.prototype.Maze.prototype.Hack = function (main, callback, scope) {
	this.main = main;
	this.callback = callback;
	this.scope = scope;
	this.active = true;
	this.background = this.main.add.sprite(this.main.world.width/2, 0, "hack-circles", "hack-bg");
	this.background.alpha = 1;
	this.background.anchor.setTo(0.5);
	this.background.scale.setTo(this.main.globalScale);
	this.background.position.setTo(this.main.world.width/2, this.background.height);
	this.main.maze.hackLayer.add(this.background);

	this.maxRad = (2 * Math.PI);

	var circle1 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "circle-0-off");
	circle1.anchor.setTo(0.5);
	circle1.scale.setTo(this.main.globalScale);
	circle1.rotation = Math.random() * this.maxRad;
	circle1.circleName = "circle-0-";
	circle1.checkRot = function () {
		if (this.rotation >= 0.04886316915294853 && this.rotation >= 6.234322138)
			return true;

		return false;
	};
	this.main.maze.hackLayer.add(circle1);

	var circle2 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "circle-1-off");
	circle2.anchor.setTo(0.5);
	circle2.scale.setTo(this.main.globalScale);
	circle2.rotation = Math.random() * this.maxRad;
	circle2.circleName = "circle-1-";
	circle2.checkRot = function () {
		if (this.rotation >= 0.04886316915294853 && this.rotation >= 6.234322138)
			return true;

		return false;
	};
	this.main.maze.hackLayer.add(circle2);

	var circle3 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "circle-2-off");
	circle3.anchor.setTo(0.5);
	circle3.scale.setTo(this.main.globalScale);
	circle3.rotation = Math.random() * this.maxRad;
	circle3.circleName = "circle-2-";
	circle3.checkRot = function () {
		if (this.rotation >= 0.04886316915294853 && this.rotation >= 6.234322138)
			return true;

		return false;
	};
	this.main.maze.hackLayer.add(circle3);

	var circle4 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "circle-3-off");
	circle4.anchor.setTo(0.5);
	circle4.scale.setTo(this.main.globalScale);
	circle4.rotation = Math.random() * this.maxRad;
	circle4.circleName = "circle-3-";
	circle4.checkRot = function () {
		if (this.rotation >= 0.04886316915294853 && this.rotation >= 6.234322138)
			return true;

		return false;
	};
	this.main.maze.hackLayer.add(circle4);

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

			if (circle.checkRot()) {
				circle.frameName = circle.circleName + "on";
				circle.tint = 0xFFFFFF;
			} else {
				allActive = false;
				circle.frameName = circle.circleName + "off";
				circle.tint = 0xFFFFFF;

				if (i == this.selectedCircle)
					circle.tint = 0xE3E3E3;
			}
		}

		if (allActive) {
			this.endGame();
		}
	},
	
	endGame: function () {
		this.connectionDone = true;
		this.background.frameName = "hack-bg-done";

		var self = this;
		setTimeout(function () {
			self.dispose();
		}, 1000);
	},


	dispose: function () {
		this.background.destroy();

		for(var i = 0; i < this.circles.length; i++) {
			this.circles[i].destroy();
		}

		this.main.camera.follow(this.previousTarget, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
		
		logInfo(this.callback);
		this.callback(this.scope);
	}
};