#!/usr/bin/env node

const {package, config, action, pushChan} = require('../index');

const editor = require('editor');

const yargs = require('yargs')
	.usage("用法: push-chan [options]")
	.option('config', {
		describe: '参数配置',
	})
	.option('time', {
		describe: '指派广播时间，格式为 hh:mm 或者 hh:mm:ss （ss 会被忽略）'
	})
	.example('push-chan --time 23:59')

	.option('notification', {
		describe: '启动后广播启动消息',
	})
	.example('push-chan --notification')

	.option('fetch', {
		describe: '启动后广播问卷信息',
	})

	.option('empty-not-push', {
		describe: '如果问卷信息为空则不广播'
	})

	.option('url', {
		describe: '指定回调地址，默认为 config.js 中的 api_url'
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

if (argv['empty-not-push']) {
	config.EMPTY_NOT_PUSH = true;
}
if (argv.url) {
	if (typeof(argv.url) !== 'string') {
		console.warn('url 参数错误');
		process.exit(-1);
	} else {
		config.api_url = argv.url;
	}
}

if (argv.version) {
	console.log(`${package.version}`);
	process.exit(0);
}
else if (argv.config) {
	editor(`${__dirname}/../config.js`, function (code, sig) {
		console.info('重新启动程序以应用设置');
		process.exit(0);
	});
} else {
	const INVALID_DATE = (new Date('badDateTime')).toString();
	/* 如果有指配 time 参数 */
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
		console.prelog('开始发送启动消息……');
		let html = `
			<p>${config.name} 已经启动了，推送时间应该是 ${startDate.toLocaleTimeString()}</p>
			<p>
				噗什配置：
				<ul>
					<li>邮件广播发送间隔：${config.send_interval / 1000} 秒</li>
					<li>邮件发送重试间隔：${config.retry_interval / 1000} 秒</li>
					<li>vqf 回调地址：<a href="${config.api_url}">${config.api_url}</a></li>
					<li>获取 vqfQuestion 数据重试间隔：${config.retry_get_struct_interval / 1000} 秒</li>
					<li>空问卷不推送：${config.EMPTY_NOT_PUSH}</li>
					<li>订阅人数：${config.to.length}</li>
				</ul>
			</p>
			<p>还有，请不要回复邮件，你的真诚是打动不了程序的</p>
			<p>有 bug 可以到 <a href="https://github.com/TorzoClub/Torzo-qun/issues" target="_blank"> 项目主页 </a> 与作者谈笑风生</p>
			<footer>version ${package.version}</footer>`;

		action.broadcast(config.to,
			{
				from: config.mail_opts.auth.user,
				subject: '噗什酱已经启动',
				html,
			},
			function (){
				console.prelog('启动消息已全部发送');
				pushInit();
			},
			(err, retry) => {
				console.prelog('初始化邮件未成功发送');
				console.warn(err);
				process.exit(-1);
			}
		);
	} else {
		pushInit();
	}
}
