JackDanger.LoadingScreen = function(){
	this.jack = game.add.sprite(400, 200, "mygame", "face");
	this.jack.anchor.setTo(0.5);
}


JackDanger.LoadingScreen.prototype = {
	add: function() {

	},

	remove: function() {
		this.jack.kill();
	},
	update: function (progress) {
		this.jack.rotation = (2 * Math.PI) * (progress/100);
	}
}
