<?php

require_once('VQFDefine.class.php');

class VQFCheckerIO extends VQFDefine {
	public $struct;
	public function load($jsonString){
		$this->struct = json_decode($jsonString);
	}
	public function toJSON(){
		return json_encode($this->struct);
	}
}
class VQFCheckerRouter extends VQFCheckerIO {
	/**
	* 多选项检查
	* @param array $qd 题目的定义项(questiondefine)
	* @param array $sd 结果集（单项）
	* @param int $vqfs 定义项位置（数组游标）
	* @param array $q 定义组（定义项目的集合）
	* @param array $struct 结果集
	*/
	public function multi($qds, $sds, $vqfs, $q, $struct){
		/*
			$qds应该是数组，数组元素应该是一种对象，这个对象里有choiced属性（不是一个负数的整数，并且小于定义项目数）
			可能还有why属性，这个why的特性跟single方法里是一样的
			extends也是的
		*/
		if (!is_array($sds)) {
			throw new Exception('multi is not Array', 2);
		} else {
			foreach($sds as $structCursor => $structItem) {
				if (!is_object($structItem)) {
					throw new Exception('多选项数组中的元素并不是一个对象', 2);
				} else if (!isset($qds[$structCursor])) {
					throw new Exception('多选项数组中的元素不存在', 2);
				}

				/* 检查choiced */
				if (!isset($structItem->choiced)) {
					throw new Exception('多选项数组中的元素的choiced属性不存在', 2);
				} else if (!is_int($structItem->choiced)) {
					throw new Exception('多选项数组中的元素的choiced属性不是一个整数', 2);
				} else if ($structItem->choiced < 0) {
					throw new Exception('多选项数组中的元素的choiced属性不能是负数', 2);
				} else if (!($structItem->choiced < count($qds))){
					throw new Exception('多选项数组中的元素的choiced属性大于等于定义的最大项目数', 2);
				}

				/* 选项元素得是个数组，而不是字符串 */
				if (is_object($qds[$structCursor])) {
					/* 如果有why项存在 */
					if (isset($qds[$structCursor]['why'])) {
						if (!isset($structItem->why)) {
							print_r($qds[$structCursor]['why']);
							print_r($qds[$structCursor]);
							print_r($structItem);
							print_r($sds);
							throw new Exception('多选项数组中的元素的why属性不存在', 2);
						}
						try {
							/* 后面三个参数没什么卵用 */
							$this->why($qds[$structCursor], $structItem, $structCursor, $q, $struct);
						} catch (Exception $e) {
							throw new Exception("(多选项数组中的元素){$e->getMessage()}", $e->getCode());
						}
					}

					/* 如果存在extends项 */
					if (isset($qds[$structCursor]['extends'])) {
						if (!isset($structItem->extends)) {
							throw new Exception('多选项数组中的元素的extends属性不存在', 2);
						}
						foreach ($qds[$structCursor]['extends'] as $extendsVqfs => $questionDefine) {
							$this->defineTypeRouter($questionDefine, $extendsVqfs, $qds[$structCursor]['extends'], $structItem->extends);
						}
					}
				}
			}
		}
	}
	/**
	* 单选项检查
	* @param array $qd 题目的定义项(questiondefine)
	* @param object $sd 结果集（单项）
	* @param int $vqfs 定义项位置（数组游标）
	* @param array $q 定义组（定义项目的集合）
	* @param array $struct 结果集
	*/
	public function single($qd, $sd, $vqfs, $q, $struct){
		if (!is_object($sd)) {
			throw new Exception('single is not Object', 2);
		}

		/*
			choiced属性得是一个不是负数的整数，并且小于定义项目数（数组长度）
		*/
		if (!isset($sd->choiced)) {
			throw new Exception('single is not define', 2);
		} else if (!is_int($sd->choiced)) {
			throw new Exception('single is not integer', 2);
		} else if ($sd->choiced < 0) {
			throw new Exception('single need >= 0', 2);
		} else if (!($sd->choiced < count($qd))) {
			throw new Exception('所选项大于等于定义的最大项目数', 2);
		}

		/* 如果有why项存在 */
		if (isset($qd['why'])) {
			if (!isset($sd->why)) {
				throw new Error('已选项目的why未定义', 2);
			}
			try {
				$this->why($qd, $sd, $vqfs, $q, $struct);
			} catch (Exception $e) {
				throw new Exception("(single){$e->getMessage()}", $e->getCode());
			}
		}


		/* 如果有继承项存在 */
		if (isset($qd['extends'])) {
			if (!isset($sd->extends)) {
				throw new Error('已选项目的扩展项未定义', 2);
			}
			foreach ($qd['extends'] as $extendsVqfs => $questionDefine) {
				$this->defineTypeRouter($questionDefine, $extendsVqfs, $qd['extends'], $sd->extends);
			}
		}
	}
	/**
	* 问答项检查
	* @param array $qd 题目的定义项(questiondefine)
	* @param object $sd 结果集（单项）
	* @param int $vqfs 定义项位置（数组游标）
	* @param array $q 定义组（定义项目的集合）
	* @param array $struct 结果集
	*/
	public function why($qd, $sd, $vqfs, $q, $struct){
		if (isset($qd['why'])) {
			if (!is_object($sd)) {
				throw new Exception('why is not Object', 2);
			} else if (!isset($sd->why)){
				throw new Exception('why不存在', 2);
			} else if (!is_string($sd->why)) {
				throw new Exception('why不是字符串', 2);
			}
		}
	}
	/**
	* 类型路由
	* @param array $qd 题目的定义项(questiondefine)
	* @param int $vqfs 定义项位置（数组游标）
	* @param array $q 定义组（定义项目的集合）
	* @param array $struct 结果集
	*/
	public function defineTypeRouter($qd, $vqfs, $q, $struct){
		/* 检查存在性 */
		if (!isset($struct[$vqfs])) {
			throw new Exception('结果集游标所指向的define不存在！', 2);
		}
		/* why类型 */
		else if (
			isset($qd['question']) &&
			isset($qd['question']['type']) &&
			$qd['question']['type'] === 'why'
		) {
			$this->why($qd['question'], $struct[$vqfs], $vqfs, $q, $struct);
		}
		/* 单选类型 */
		else if (isset($qd['question'])) {
			$this->single($qd['question'], $struct[$vqfs], $vqfs, $q, $struct);
		}
		/* 多选类型 */
		else if (isset($qd['questions'])) {
			$this->multi($qd['questions'], $struct[$vqfs], $vqfs, $q, $struct);
		} else {
			throw new Exception('未知的define类型', 2);
		}
	}
}
class VQFChecker extends VQFCheckerRouter {
	public function check($struct){
		foreach (self::$question as $vqfs => $questionDefine) {
			$this->defineTypeRouter($questionDefine, $vqfs, self::$question, $struct);
		}
	}

	public function __construct(){

	}
}

?>
