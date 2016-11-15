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
	getQuestionDefine(ok, fail, apiUrl = `${config['api_url']}/getquestion.php`){
		superagent.get(apiUrl).end((err, sres) => {
			if (err) {
				return fail(err);
			}

			this.jsonParseRouter(sres.text, ok, fail);
		});
	},
	getTodayQuestion(ok, fail, apiUrl = `${config['api_url']}/today.php`){
		superagent.get(apiUrl).end((err, sres) => {
			if (err) {
				return fail(err);
			}

			this.jsonParseRouter(sres.text, (questions) => {
				questions.forEach(questionStruct => {
					questionStruct.struct = JSON.parse(questionStruct.json);
				});
				ok(questions);
			}, fail);
		});
	},
});
