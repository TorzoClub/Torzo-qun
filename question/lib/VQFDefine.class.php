<?php
class VQFDefine {
	static public $question = array(
		array(
			'description' => '同装已经发展了一周年了，你对同装会，满意么？',
			'question' => array(
				array(
					'description' =>'十分满意',
					'type' => 'choice'
				),
				'满意',
				array(
					'description' => '不满意',
					'type' => 'why'
				),
				array(
					'description' => '十分不满意',
					'type' => 'why'
				),
			)
		),
		array(
			'description' => '你觉得同装现在的核心凝聚力是什么',
			'question' => array(
				'type' => 'why'
			)
		),
		array(
			'description' => "你在同装会这段时间里，有收获到什么么？",
			'question' => array(
				array(
					'description' => '有',
					'type' => 'why'
				),
				'没有'
			)
		),
		array(
			'description' => '你多久来一次同装？',
			'question' => array(
				'每天都来',
				'隔几天来一次',
				'隔几周来一次',
				'至少一个月来一次',
				'一直在偷窥，但不发言',
				'基本不上同装会'
			)
		),
		array(
			'description' => '你不常来同装的原因是什么？',
			'questions' => array(
				'实在太忙了',
				'没有共同话题，他们说的我完全没懂',
				'因格弱而不装',
				'我不喜欢同装会',
				'和他们不熟，聊不来',
				array(
					'description' => '其他',
					'type' => 'why'
				)

			),
		),
		array(
			'description' => '你的兴趣爱好/特长是什么？',
			'question' => array(
				'type' => 'why'
			)
		),
		array(
			'description' => '你觉得同装现在缺的是什么（多选）',
			'questions' => array(
				'和自己兴趣相同的人',
				'凝聚力',
				'温暖',
				array(
					'description' => '其他',
					'type' => 'why',
				)
			),
		),
		array(
			'description' => '你觉得同装应该是什么样的地方？',
			'question' => array(
				'聊天扯淡谈日常',
				'正经严肃研技术',
				'以普通日常为主，以聊技术为辅',
				'以技术研究为主，以聊日常为辅',
				array(
					'description' => '另有高论？',
					'type' => 'why'
				)
			)
		),
		array(
			'description' => '你觉得同装可以搞什么活动？',
			'question' => array(
				array(
					'description' => '线上',
					'type' => 'why'
				),
				array(
					'description' => '线下',
					'type' => 'why'
				)
			)
		),
		array(
			'description' => '你期待什么样的人进同装？',
			'question' => array(
				'type' => 'why'
			),
		),
		array(
			'description' => '你有想要引荐进同装的朋友吗？你推荐的理由是什么？',
			'question' => array(
				array(
					'description' => '有',
					'type' => 'why'
				),
				'没有'
			)
		),
		array(
			'description' => '如果「同装导册」由你来撰写，你会怎么写？',
			'question' => array(
				'type' => 'why'
			)
		),
		array(
			'description' => '如果由你来当群主，你会怎么做？',
			'question' => array(
				'placeholder' => '例如：（发展方向，管理制度，避免哪类问题等等）',
				'type' => 'why'
			)
		),
		array(
			'description' => '以下关于同装会的事情你知道几个？（多选）',
			'questions' => array(
				'群主选举制',
				'五大装素：同开独绽异',
				'同装导册',
				'同装工坊、内殿团',
				'同装正统、OSB、Moebaka',
			)
		),
		array(
			'description' => '你愿意参与设计和购买同装会非盈利性质的纪念产品吗？（衣服，徽章等）',
			'question' => array(
				'愿意',
				'不愿意',
				'不好说'
			)
		)
	);
}
?>
