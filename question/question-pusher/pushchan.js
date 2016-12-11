const package = require('./package');
	config = require('./config'),
	PushChanOutput = require('./output'),
	Render = require('./render'),
	timer = require('./timer'),
	model = require('./model'),
	action = require('./action'),
	fs = require('fs'),
	EventProxy = require('eventproxy');

const envir = {	};

const pushChan = {
	constructMail(render){
		if (render instanceof Error) {
			let html = `
			噗什酱内部错误：
			<pre><code>
			${render.name}
			${render.message}
			${render.stack}
			</code></pre>`;
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
				setTimeout(process.exit, 382);
				throw e;
			}
		};
		const processor = () => {
			model.getQuestionDefine(questionDefine => {
				model.getTodayQuestion(todayQuestion => {
					try {
						render.loadStruct(questionDefine, todayQuestion);
					} catch (e) {
						if (e.message !== 'vqfQuestion 不能是空数组') {
							setTimeout(process.exit, 382);
							throw e;
						}
						if (funcAction.empty) {
							return funcAction.empty(() => funcAction.ok(render), () => funcAction.end());
						}
					}
					funcAction.ok(render, () => funcAction.end());
				}, fail);
			}, fail);
		};
		if (typeof(funcAction.pre) === 'function') {
			funcAction.pre(processor);
		} else {
			processor();
		}
	},
	sendMail(allDone){
		let render = new Render;

		this.getStruct({
			pre(next){
				console.prelog('开始准备广播邮件...');
				next();
			},
			empty(next, end){
				if (config.EMPTY_NOT_PUSH) {
					console.prelog('问卷信息为空，并且噗什设置为不推送空问卷，故中止广播');
					end();
				} else {
					next();
				}
			},
			ok(render, end){
				console.prelog(`已收集问卷信息，开始广播...`);
				let mailContent = pushChan.constructMail(render);

				action.broadcast(config.to, {
					from: config.mail_opts.auth.user,
					subject: '噗什报告',
					html: mailContent,
				}, () => {
					console.prelog('全部广播邮件发送完成');
					end();
				}, (err, retry) => {
					let retryInterval = config.retry_interval;
					console.warn(err);
					console.prelog(`广播邮件发送失败，${retryInterval / 1000} 秒后重试`);
					setTimeout(retry, retryInterval);
				});
			},
			end(){
				allDone && allDone();
			},
			fail(retryHandle, err){
				let retryInterval = config.retry_get_struct_interval;
				console.prelog(`准备广播邮件失败，${retryInterval / 1000} 秒后重试`);
				setTimeout(retryHandle, retryInterval);
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
