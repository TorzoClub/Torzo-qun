<?php
require_once('SQL.class.php');

class Model extends SQLPDO {
	private static $instance;
	public static function getInstance($params = array()){
		if (!self::$instance instanceof self) {
			self::$instance = new self($params);
		}
		return self::$instance;
	}


	public static $pagelimit = 10;
	public function getComment($page){
		$commentTable = self::$COMMENTTABLE;

		$limit = self::$pagelimit;
		$start = $page * $limit;
		$sql = "SELECT * FROM `{$commentTable}` ORDER BY `id` DESC LIMIT {$start}, {$limit}";

		return $this->preFetchAll($sql, array());
	}

	public function insertComment($commentData){
		if (!isset($commentData['author']) || !isset($commentData['article'])) {
			throw new Exception('commentData fail', 1);
		} else if (!is_string($commentData['author'])) {
			throw new Exception('commentData author is not string type', 1);
		} else if (strlen($commentData['author']) > 30) {
			throw new Exception('commentData author length > 30', 1);
		} else if (!is_string($commentData['article'])) {
			throw new Exception('commentData article is not string type', 1);
		}

		$commentTable = self::$COMMENTTABLE;
		$author = $commentData['author'];	/*strip_tags($commentData['author']);*/
		$article = $commentData['article'];/*strip_tags($commentData['article']);*/
		$sql = "INSERT INTO `{$commentTable}` (author, article, time) VALUES (?, ?, now())";

		return $this->preInsert($sql, array($author, $article));
	}
}
?>
