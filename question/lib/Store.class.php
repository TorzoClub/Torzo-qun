<?php

require('../lib/SQL.class.php');

class Store extends SQL {
	public static $QUESTIONTABLE = 'question';
	private static $instance;
	public static function getInstance($params = array()){
		if (!self::$instance instanceof self) {
			self::$instance = new self($params);
		}
		return self::$instance;
	}
	private function checkJsonData($data){
		if (!isset($data['json'])) {
			throw new Exception('存储数据的没有json项', 1);
		}
	}
	public function save($data){
		$this->checkJsonData($data);

		$table = self::$QUESTIONTABLE;

		$json = $data['json'];

		$sql = "INSERT INTO `{$table}` (json, time) VALUES (?, now())";
		return $this->preInsert($sql, array($json));
	}
}

?>
