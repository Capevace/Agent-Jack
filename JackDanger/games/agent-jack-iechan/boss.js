//  ____   ____   _____ _____ 
// |  _ \ / __ \ / ____/ ____|
// | |_) | |  | | (___| (___  
// |  _ <| |  | |\___ \\___ \ 
// | |_) | |__| |____) |___) |
// |____/ \____/|_____/_____/ 
//
JackDanger.AgentJackIEC.prototype.Boss = function () {
	this.initialized = false;
	this.main = parent;
}

JackDanger.AgentJackIEC.prototype.Boss.prototype.initLevel = function () {
	logInfo("Init Boss");
}

JackDanger.AgentJackIEC.prototype.Boss.prototype.update = function (dt) {
	//	logInfo("Update Boss");
}

JackDanger.AgentJackIEC.prototype.Boss.prototype.disposeLevel = function () {
	if (!this.initialized) return;

	logInfo("Dispose Boss");
}