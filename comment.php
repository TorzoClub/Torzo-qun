<?php
require('./lib/Model.class.php');

class BackInfo {

	public function __construct($msg, $code){
		$this->msg = $msg;
		$this->code = $code;
	}

	public function __tostring(){
		return json_encode($this);
	}
}

class CommentControllor extends Model{
	private static $instance;
	public static function getInstance($params = array()){
		if (!self::$instance instanceof self) {
			self::$instance = new self($params);
		}
		return self::$instance;
	}

	public function processGET(){
		if (!isset($_GET['page'])) {
			throw new Exception('page not found', 1);
		} else {
			$data = $this->getComment(intval($_GET['page']) - 1);
			$info = new BackInfo($data, 0);
		}
		return $info;
	}

	public function processPOST(){
		if (!isset($_POST['author'])) {
			throw new Exception('author nofound', 1);
		} else if (!isset($_POST['article'])) {
			throw new Exception('article nofound', 1);
		}

		$lastInsertId = $this->insertComment(array(
			'author' => $_POST['author'],
			'article' => $_POST['article']
		));
		$info = new BackInfo('insert ok', 0);
		$info->lastInsertId = $lastInsertId;
		return $info;
	}
}

try {
	$controllor = CommentControllor::getInstance();
	if ($_SERVER['REQUEST_METHOD'] === 'GET') {
		$info = $controllor->processGET();
	} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
		$info = $controllor->processPOST();
	} else {
		throw new Exception('need GET/POST REQUEST_METHOD', 1);
	}
} catch (Exception $e) {
	$info = new BackInfo($e->getMessage(), $e->getCode());
}

print($info);

?>
