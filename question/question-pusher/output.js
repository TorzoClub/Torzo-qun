/*
	 - 组合 HTML 和 CSS
	 - 以及输出文件
*/

const fs = require('fs');

class PusherOutput {
	/* 字符串组合 */
	combination(...args){
		return args.reduce((str1, str2) => '' + str1 + str2);
	}

	/* 输出文件 */
	output(filePath, str){
		if (typeof(filePath) === 'string' && typeof(str) === 'string') {
			return fs.writeFileSync(filePath, str);
		} else {
			throw new Error('参数不正确（两个参数都得是字符串）');
		}
	}

	makeMail(css, html) {
		return this.combination(`<style>${css}</style>\n`, html);
	}
}

module.exports = PusherOutput;
