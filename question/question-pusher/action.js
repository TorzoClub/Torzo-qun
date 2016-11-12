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
