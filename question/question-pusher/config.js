module.exports = {
	mail_opts: {
		host: 'smtp-server.com',
		port: 465,
		auth: {
			user: 'titor@torzo.com',
			pass: 'titorPassword',
		},
	},
	name: '噗什酱',

	api_url: 'http://qun.torzo.com/question/',
	test_api_url: 'http://localhost/qun/question/',

	/* 接收邮件的列表 */
	to: [
		'receive@torzo.com',
	],

	/* 测试用的邮箱地址 */
	testReceive: 'testreceive@torzo.com',
};
