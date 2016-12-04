let config = {
	mail_opts: {
		host: 'smtp.example.com',
		port: 465,
		auth: {
			user: 'titor@torzo.club',
			pass: 'titorPassword',
		},
	},
	name: '噗什酱',

	api_url: 'http://vec.moe/qun/question/',
	test_api_url: 'http://localhost/qun/question/',

	/* 广播时间 */
	broadcast_time: '22:00',

	/* 邮件广播发送间隔（毫秒） */
	send_interval: 10000,

	/* 邮件发送重试间隔（毫秒） */
	retry_interval: 60000,

	/* 获取 vqfQuestion 数据重试间隔（毫秒） */
	retry_get_struct_interval: 60000,

	/* 接收邮件的列表 */
	to: [
		'receive@torzo.club'
	],

	/* 测试用的邮箱地址 */
	test_receive: 'test_receive@torzo.club',
};

Object.assign(exports, config);
