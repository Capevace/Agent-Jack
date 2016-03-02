JackDanger.LoadingScreen = function(){
	this.jack = game.add.sprite(400, 200, "mygame", "face");
}


JackDanger.LoadingScreen.prototype = {
	add: function() {

	},

	remove: function() {
		this.jack.kill();
	}
}
