const package = require('./package');
const config = require('./config');
const timer = require('./timer');
const model = require('./model');
const action = require('./action');

action.sendMessage('噗什酱已经启动', `
	<p>${config.name} 已经启动了，你现在只需守在时钟前等着晚上十点就行了</p>
	<p>还有，请不要回复邮件，你的真诚是打动不了程序的</p>
	<p>作者是 Vec，有 bug 可以到项目主页的 <a href="https://github.com/TorzoClub/Torzo-qun/issues" target="_blank">issue </a> 栏目谈笑风生</p>
	<footer>version ${package.version}</footer>`,
	() => {
		timer.addTask({
			/* 下午十点 */
			time: new Date(2016, 11, 22, 00, 00),
			task(){

			},
		});
	}
)

timer.start(500);

console.info(`Torzo-Question Pusher ${package.version}`);
