const package = require('./package');
	config = require('./config'),
	PusherOutput = require('./output'),
	Render = require('./render'),
	timer = require('./timer'),
	model = require('./model'),
	action = require('./action'),
	fs = require('fs'),
	EventProxy = require('eventproxy');

Object.assign(exports, {
	constructMail(render){
		if (render instanceof Error) {
			let html = `
			噗什酱内部错误：
			<code><pre>
			${render.name} <br>
			${render.message} <br>
			${render.stack}
			</pre><code>`;
			return html;
		} else if (Array.isArray(render.question) && render.question.length) {
			let po = new PusherOutput;

			let html = render.renderQuestion();
			let css = fs.readFileSync(`${__dirname}/style/mail.css`).toString();

			let mailContent =
				'<meta http-equiv="content-type" content="text/html" charset="utf-8" />' +
				po.makeMail(
					css,
					html
				);
			return mailContent;
		} else {
			let html = '今天没有接到什么问卷';
			return html;
		}
	},
	getStruct(callback){
		let render = new Render;
		model.getQuestionDefine(questionDefine => {
			model.getTodayQuestion(todayQuestion => {
				try {
					render.loadStruct(questionDefine, todayQuestion);
				} catch (e) {
					if (e.message !== 'vqfQuestion 不能是空数组') {
						throw e;
					}
				}
				callback(render);
			}, (e) => {
				callback(e);
				throw e;
			});
		}, (e) => {
			callback(e);
		});
	},
	sendMail(allDone){
		console.info(`${(new Date).toLocaleString()} 开始准备广播邮件...`);

		let render = new Render;
		this.getStruct((render) => {
			if (render instanceof Render) {
				console.info(`${(new Date).toLocaleString()} 已收集问卷信息，开始广播...`);
				let mailContent = pusherChan.constructMail(render);

				action.broadcast(config.to, {
					from: config.mail_opts.auth.user,
					subject: '噗什报告',
					html: mailContent,
				}, () => {
					console.info(`${(new Date).toLocaleString()} 全部广播邮件发送完成`);
					allDone && allDone();
				}, (err, retry) => {
					console.warn(err);
					console.info(`${(new Date).toLocaleString()} 广播邮件发送失败，30秒后重试`);
					setTimeout(retry, config.retry_interval);
				});
			} else {
				let args = arguments;
					setTimeout(() => {
						this.getStruct(...args);
					}, 3 * 60 * 1000);	//三分钟后重试
			}
		});
	},
	throwNoDate(){
		throw new Error('未指派日期');
	},
	/* 默认下午十点 */
	start(date = this.throwNoDate()){
		const pThis = this;
		timer.addTask({
			time: date,
			task(){
				pThis.sendMail();
			},
		});
	},
});

timer.start(500);
