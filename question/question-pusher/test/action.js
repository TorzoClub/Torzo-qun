const timer = require('../timer');
const config = require('../config');
const should = require('should');
const action = require('../action');

const MAIL_TIMEOUT = 10000;

describe('action.js asyncEach', () => {
	it('asyncEach 执行复数次', () => {
		let value = 0;
		let arr = [1, 4, 2];
		action.asyncEach(arr, (fetch) => {
			value += fetch.item;
			fetch.next();
		});
		value.should.equal(1 + 4 + 2);
	});
	it('asyncEach 重试', () => {
		let value = 0;
		let arr = [null];
		action.asyncEach(arr, (fetch) => {
			if (value === 0) {
				value = 1;
				fetch.retry();
			}
			fetch.next();
		});

		value.should.equal(1);
	});
	it('asyncEach 全部结束', (done) => {
		let value = 0;
		action.asyncEach([1], (fetch) => {
			value = 1;
			setTimeout(fetch.next, 5);
		}, () => {
			value.should.equal(1);
			done();
		});
	});
	it('asyncEach status状态', () => {
		let arr = [1, 2, 3, 4];
		action.asyncEach(arr, (fetch, status) => {
			if (status.p === undefined) {
				status.p = 0;
			}
			status.p += fetch.item;
		}, (status) => {
			status.p.should.equal(1 + 2 + 3 + 4);
		});
	});
});

describe('action.js sendMessage相关', () => {
	it('backFrom 返回正确的发件人名称', () => {
		action.backFrom('vec', 'test@simple.bb').should.equal('vec <test@simple.bb>');
	});
	it('sendMessage 发送邮件', function (done) {
		this.timeout(MAIL_TIMEOUT);

		let error = function (...errArgs) {
			console.error(...errArgs);
		};
		let from = action.backFrom(config.name, config.mail_opts.auth.user);
		action.sendMessage(from, config.testReceive, 'testTitle', 'testContent', () => {
			done();
		}, error);
	});
	it('sendMessage 发送失败', function (done) {
		this.timeout(MAIL_TIMEOUT);

		let error = function (...errArgs) {
			console.error(...errArgs);
		};
		action.sendMessage('错误的名字@bug的域名', '这个邮箱地址是错的', '失败邮件的标题', '失败邮件的正文', error, () => {
			done();
		});
	});

	it('broadcast 输入错误的类型（错误的邮件列表，错误的邮件对象）', () => {
		let from = action.backFrom(config.name, config['mail_opts'].auth.user),
			subject = 'testTitle',
			html = 'testContent';

		(() => {
			action.broadcast({}, {});
		}).should.throw('邮件列表不是一个数组');


		(() => {
			action.broadcast([], []);
		}).should.throw('邮件参数不是一个对象');

		(function () {
			action.broadcast([], {
				subject, html,
			});
		}).should.throw('参数对象缺少 from 属性或者不合法');

		(function () {
			action.broadcast([], {
				from, html,
			});
		}).should.throw('参数对象缺少 subject 属性或者不合法');

		(function (){
			action.broadcast([], {
				from, subject,
			});
		}).should.throw('参数对象缺少 html 属性或者不合法');
	});

	it('broadcast 广播邮件', function (done) {
		this.timeout(MAIL_TIMEOUT);

		let from = action.backFrom(config.name, config['mail_opts'].auth.user),
			subject = 'test: broadcast 广播邮件',
			html = 'content: broadcast 广播邮件';
		action.broadcast([config['testReceive']], {from, subject, html}, () => {
			done();
		}, () => {});
	});
	it('broadcast 广播邮件重试', function (done) {
		this.timeout(MAIL_TIMEOUT);
		let retryCount = 0;

		let mailList = ['这个邮箱地址是错的'];
			from = action.backFrom(config.name, config['mail_opts'].auth.user),
			subject = 'broadcast 广播邮件重试的标题',
			html = 'broadcast 广播邮件重试的内容';
		action.broadcast(mailList, {from, subject, html},
			() => {
				if (retryCount) {
					done();
				}
			},
			(retry) => {
				++retryCount;
				mailList[0] = config['testReceive'];
				retry();
			}
		);
	});
});
