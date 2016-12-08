console.__proto__.prelog = function () {
	this.info(`${(new Date).toLocaleString()}`, ...arguments);
};
Object.assign(exports, {
	package: require('./package'),
	config: require('./config'),
	action: require('./action'),
	pushChan: require('./pushchan'),
});
