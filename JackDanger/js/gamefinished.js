JackDanger.GameFinished = function() {
    //variable stuff
};

JackDanger.GameFinished.prototype = {
    init: function() {
        logInfo("init GameFinished");

    },

    preload: function() {
    },

    create: function() {
        this.timeText = game.add.bitmapText(game.width / 2, 200, "testfont", "GESCHAFFT", 30);
        this.timeText.anchor.set(0.5);
    }
};