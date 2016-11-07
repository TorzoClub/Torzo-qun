<?php
require('./lib/Store.class.php');
require('./lib/VQFChecker.class.php');

class ProcessController {
	public function saveStruct(){
		$store = $this->store;
		$result = $store->save(array(
			'json' => $this->checker->toJSON()
		));

		if (!$result) {
			throw new Exception('存储出现错误', 1);
		} else {
			throw new Exception('data inserted', 0);
		}
	}

	public function setArguments(){
		if (!isset($_POST['json'])) {
			$err = new Exception('invalid arguments', 1);
			throw $err;
		} else {
			$this->checker->load($_POST['json']);
		}
	}

	public function checkStruct(){
		$checker = $this->checker;
		$checker->check($checker->struct);
	}

	private $checker;
	public function __construct(){
		$this->store = Store::getInstance();
		$this->checker = new VQFChecker;
	}
}

/* 这里的try-catch只是用于向上传递信息用的。。。 */
try {
	$pc = new ProcessController;
	$pc->setArguments();
	$pc->checkStruct();
	$pc->saveStruct();
} catch (Exception $e) {
	print(json_encode(array(
		'code' => $e->getCode(),
		'msg' => $e->getMessage()
	)));
}
?>
