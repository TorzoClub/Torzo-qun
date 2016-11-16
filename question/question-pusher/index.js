const package = require('./package');
	config = require('./config'),
	action = require('./action'),
	pusherChan = require('./pushchan');

console.info(`Torzo-Question Pusher ${package.version}`);

action.broadcast(config.to,
	{
		from: config.mail_opts.auth.user,
		subject: '噗什酱已经启动',
		html: `
			<p>${config.name} 已经启动了，你现在只需守在时钟前等着晚上十点就行了</p>
			<p>还有，请不要回复邮件，你的真诚是打动不了程序的</p>
			<p>有 bug 可以到 <a href="https://github.com/TorzoClub/Torzo-qun/issues" target="_blank">项目主页</a> 与作者谈笑风生</p>
			<footer>version ${package.version}</footer>`,
	},
	() => {
		pusherChan.start();
	},
	(err, retry) => {
		console.warn(err);
		console.warn('初始化邮件未成功发送');
		process.exit(-1);
	}
);
