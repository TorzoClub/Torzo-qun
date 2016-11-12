const timer = require('../timer');
const config = require('../config');
const should = require('should');
const action = require('../action');

describe('action.js', () => {
	it('backFrom 返回正确的发件人名称', () => {
		action.backFrom('vec', 'test@simple.bb').should.equal('vec <test@simple.bb>');
	});

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

	it('sendMessage 发送邮件', (done) => {
		let error = function (...errArgs) {
			console.error(...errArgs);
		};
		let from = action.backFrom(config.name, config.mail_opts.auth.user);
		action.sendMessage(from, config.testReceive, 'testTitle', 'testContent', () => {
			done();
		}, error);
	});
	it('sendMessage 发送失败', (done) => {
		let error = function (...errArgs) {
			console.error(...errArgs);
		};
		action.sendMessage('错误的游戏@bug的域名', '这个邮箱地址是错的', 'testTitle', 'testContent', error, () => {
			done();
		});
	})
});
