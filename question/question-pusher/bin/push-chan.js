#!/usr/bin/env node
const {package, config, action, pushChan} = require('../index');

const editor = require('editor');

const yargs = require('yargs')
	.usage("用法: push-chan [options]")
	.option('config', {
		describe: '参数配置',
	})
	.option('time', {
		describe: '指派广播时间，格式是 hh:mm:ss'
	})
	.example('push-chan --time 23:59')

	.option('notification', {
		describe: '启动后广播启动消息',
	})
	.example('push-chan --notification')

	.option('fetch', {
		describe: '启动后广播问卷信息',
	})

	.option('v', {
		describe: '程序版本',
	})
	.alias('v', 'version')

	.example('push-chan --fetch')
	.help('h')
	.alias('h', 'help')
	.epilog('童装工坊 2016')
;

const argv = yargs.argv;

if (argv.version) {
	console.log(`${package.version}`);
	process.exit(0);
}
else if (argv.config) {
	editor(`${__dirname}/../config.js`, function (code, sig) {
		console.info('config is saved.');
		process.exit(0);
	});
} else {
	/* 如果有指配日期 */
	const INVALID_DATE = (new Date('badDateTime')).toString();
	if (argv.time) {
		var startDate = new Date(`1984-09-09 ${argv.time}`);
		if (startDate.toString() === INVALID_DATE ) {
			console.error('指派了错误的日期，应参照 "hh:mm:ss" 的格式');
			process.exit(1);
		}
	} else {
		var startDate = new Date(`1984-09-09 ${config.broadcast_time}`);
		if (startDate.toString() === INVALID_DATE) {
			console.error('config.js 中的广播时间非法，应参照 "hh:mm:ss" 的格式');
			process.exit(1);
		}
	}

	console.info(`当前系统时间是：\t${(new Date).toLocaleTimeString()}`);
	console.info(`广播邮件的发送时间是：\t${startDate.toLocaleTimeString()}`);

	var pushInit = function () {
		if (argv.fetch) {
			pushChan.sendMail(() => {
				pushChan.start(startDate);
			});
		} else {
			pushChan.start(startDate);
		}
	};

	/* 如果有 notification 参数 */
	if (argv.notification) {
		console.info('开始发送启动消息……');
		action.broadcast(config.to,
			{
				from: config.mail_opts.auth.user,
				subject: '噗什酱已经启动',
				html: `
					<p>${config.name} 已经启动了，你现在只需守在时钟前等着晚上十点就行了</p>
					<p>还有，请不要回复邮件，你的真诚是打动不了程序的</p>
					<p>有 bug 可以到 <a href="https://github.com/TorzoClub/Torzo-qun/issues" target="_blank"> 项目主页 </a> 与作者谈笑风生</p>
					<footer>version ${package.version}</footer>`,
			},
			pushInit,
			(err, retry) => {
				console.warn(err);
				console.warn('初始化邮件未成功发送');
				process.exit(-1);
			}
		);
	} else {
		pushInit();
	}
}
