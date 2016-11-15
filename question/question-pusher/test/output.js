const fs = require('fs');
const should = require('should');
const PusherOutput = require('../output');

const TEST_DIR = `${__dirname}/test_output`;

if (!fs.existsSync(TEST_DIR)) {
	fs.mkdirSync(TEST_DIR);
}

describe('output.js combination', () => {
	let po = new PusherOutput;
	po.combination('a', 'b', 'c', 1, true, false, undefined, null).should.equal('abc1truefalseundefinednull');
});

describe('output.js output', () => {
	it('output 参数检查', () => {
		let po = new PusherOutput;
		let filePath = `${TEST_DIR}/output_output.txt`;

		(() => {
			po.output(1, 'testText');
		}).should.throw('参数不正确（两个参数都得是字符串）');
		(() => {
			po.output(filePath, 214);
		}).should.throw('参数不正确（两个参数都得是字符串）');

	});

	it('output 输出文件', () => {
		let po = new PusherOutput;
		let filePath = `${TEST_DIR}/output_output.txt`;
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}

		po.output(filePath, 'outputFileText');

		let str = fs.readFileSync(filePath);
		str.toString().should.equal('outputFileText');
	});

	it('output makeMail', () => {
		let po = new PusherOutput;
		let css = '* {font-size: 3em;}';
		let html = '<h1>Hello</h1>';
		po.makeMail(css, html).should.equal(
			`<style>${css}</style>\n${html}`
		);
	});

});
