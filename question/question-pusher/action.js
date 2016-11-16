const mailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const util = require('util');
const config = require('./config');

const transporter = mailer.createTransport(smtpTransport(config.mail_opts));

Object.assign(exports, {
	asyncEach(arr, func, end) {
		let cursor = 0;
		const retry = () => {
			--cursor;
			fetch();
		};
		const status = {};
		const fetch = () => {
			if (cursor < arr.length) {
				++cursor;
				func({
					next: fetch,
					retry,
					item: arr[cursor-1],
					cursor,
					arr,
				}, status);
			} else {
				end && end(status);
			}
		};
		fetch();
	},
	broadcast(mailList, email, allDone, retry){
		if (!Array.isArray(mailList)) {
			throw new Error('邮件列表不是一个数组');
		}
		else if (typeof(email) !== 'object' || Array.isArray(email)) {
			throw new Error('邮件参数不是一个对象');
		}
		else if (typeof(email.from) !== 'string') {
			throw new Error('参数对象缺少 from 属性或者不合法');
		}
		else if (typeof(email.subject) !== 'string') {
			throw new Error('参数对象缺少 subject 属性或者不合法');
		}
		else if (typeof(email.html) !== 'string') {
			throw new Error('参数对象缺少 html 属性或者不合法');
		}
		else {
			this.asyncEach(mailList, (fetch, status) => {
				this.sendMessage(
					this.backFrom('pushChan', email.from), fetch.item, email.subject, email.html,
					() => setTimeout(fetch.next, 2000),
					(err) => retry(err, fetch.retry)
				)
			}, allDone);
		}
	},
	backFrom(name, emailAddress) {
		return util.format('%s <%s>', name, emailAddress);
	},
	sendMessage(from, to, subject, html, done, fail) {
		transporter.sendMail({
			from,
			to,
			subject,
			html,
			// date: new Date(2036, 10, 9, 19, 06, 33),
		}, (err) => {
			if (err) {
				fail && fail(err);
			} else {
				done(...arguments);
			}
		});
	}
});
