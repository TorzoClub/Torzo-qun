module.exports = {
	mail_opts: {
		host: 'smtp.example.com',
		port: 465,
		auth: {
			user: 'titor@torzo.com',
			pass: 'titorPassword',
		},
	},
	name: '噗什酱',

	api_url: 'http://vec.moe/qun/question/',
	test_api_url: 'http://localhost/qun/question/',

	/* 广播邮件的发送间隔（毫秒） */
	send_interval: 10000,

	/* 重试间隔（毫秒） */
	retry_interval: 60000,

	/* 接收邮件的列表 */
	to: [
		'receive@torzo.com'
	],

	/* 测试用的邮箱地址 */
	testReceive: 'testreceive@torzo.com',
};
