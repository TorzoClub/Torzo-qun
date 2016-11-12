const should = require('should');
const config = require('../config');
const model = require('../model');

describe('model.js', () => {
	it('jsonParserRouter 返回一个对象', () => {
		model.jsonParseRouter(JSON.stringify({a: 3}),
			(obj) => {
				(() => {
					return typeof obj === 'object' && obj.a === 3;
				})().should.equal(true);
			},
			(e) => {
				throw e;
			}
		)
	});

	it('jsonParserRouter 使用不合法的 JSON 字符串', (done) => {
		let testObj = null;
		model.jsonParseRouter(
			'{"a":2}gajklgje',
			(obj) => {testObj = obj;},
			(e) => {}
		);

		if (testObj !== null) {
			throw new Error('竟然能通过');
		} else {
			done();
		}
	});

	it('getQuestionDefine 获取 Define 对象', (done) => {
		model.getQuestionDefine(`${config['test_api_url']}/getquestion.php`,
			() => {
				done();
			},
			(e) => {
				console.warn('getDefine fail');
				throw e;
			}
		);
	});
	it('getQuestionDefine 错误的 URL', (done) => {
		model.getQuestionDefine(`${config['test_api_url']}/fffgetquestion.php`,
			() => {
				console.warn('竟然能通过');
				throw e;
			},
			(e) => {
				done();
			}
		);
	});

	it('getTodayQuestion 获取今天的 question', (done) => {
		model.getTodayQuestion(`${config['test_api_url']}/today.php`,
			() => {
				done();
			},
			(e) => {
				console.warn('getDefine fail');
				throw e;
			}
		);
	});
	it('getTodayQuestion 获取错误的 URL', (done) => {
		model.getTodayQuestion(`${config['test_api_url']}/ffftoday.php`,
			() => {
				console.warn('竟然能通过');
				throw e;
			},
			(e) => {
				done();
			}
		);
	});
});
