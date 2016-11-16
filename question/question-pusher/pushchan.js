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
			throw e;
		});
	},
	sendMail(){
		let render = new Render;
		this.getStruct((render) => {
			let mailContent = pusherChan.constructMail(render);

			action.broadcast(config.to, {
				from: config.mail_opts.auth.user,
				subject: '噗什酱晚十点',
				html: mailContent,
			}, () => {
				console.info('全部邮件发送完成');
			}, (err, retry) => {
				console.warn(err);
				console.warn('邮件发送失败，30秒后重试');
				setTimeout(retry, config.retry_interval);
			});
		});
	},
	/* 默认下午十点 */
	start(date = new Date(2016, 11, 16, 11, 00)){
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
