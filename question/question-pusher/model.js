const config = require('./config');
const superagent = require('superagent');


Object.assign(exports, {
	jsonParseRouter(jsonString, success, fail){
		let obj;
		try {
			obj = JSON.parse(jsonString);
		} catch (e) {
			fail(e);
		}
		obj && success(obj);
	},
	getQuestionDefine(apiUrl, ok, fail){
		superagent.get(apiUrl).end((err, sres) => {
			if (err) {
				return fail(err);
			}

			this.jsonParseRouter(sres.text, ok, fail);
		});
	},
	getTodayQuestion(apiUrl, ok, fail){
		superagent.get(apiUrl).end((err, sres) => {
			if (err) {
				return fail(err);
			}

			this.jsonParseRouter(sres.text, ok, fail);
		});
	},
});
