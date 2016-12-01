const package = require('./package');
	config = require('./config'),
	PushChanOutput = require('./output'),
	Render = require('./render'),
	timer = require('./timer'),
	model = require('./model'),
	action = require('./action'),
	fs = require('fs'),
	EventProxy = require('eventproxy');

const pushChan = {
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
			let po = new PushChanOutput;

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
	getStruct(funcAction){
		let args = arguments,
			pThis = this,
			render = new Render;

		const fail = e => {
			if (typeof(funcAction.fail) === 'function') {
				funcAction.fail(function (){
					pThis.getStruct(...args);
				}, e);
			} else {
				setTimeout(progress.exit, 382);
				throw e;
			}
		};
		const progress = () => {
			model.getQuestionDefine(questionDefine => {
				model.getTodayQuestion(todayQuestion => {
					try {
						render.loadStruct(questionDefine, todayQuestion);
					} catch (e) {
						if (e.message !== 'vqfQuestion 不能是空数组') {
							setTimeout(progress.exit, 382);
							throw e;
						}
					}
					funcAction.ok(render);
				}, (e) => {
					fail(e);
				});
			}, (e) => {
				fail(e);
			});
		};
		if (typeof(funcAction.pre) === 'function') {
			funcAction.pre(progress);
		} else {
			progress();
		}
	},
	sendMail(allDone){
		let render = new Render;

		this.getStruct({
			pre(next){
				console.info(`${(new Date).toLocaleString()} 开始准备广播邮件...`);
				next();
			},
			ok(render){
				console.info(`${(new Date).toLocaleString()} 已收集问卷信息，开始广播...`);
				let mailContent = pushChan.constructMail(render);

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
			},
			fail(next, err){
				let retryInterval = config.retry_get_struct_interval;
				console.info(`${(new Date).toLocaleString()} 准备广播邮件失败，${retryInterval / 1000} 秒后重试`);
				setTimeout(next, retryInterval);
			},
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
};

module.exports = pushChan;
timer.start(500);
