<?php

class SQL{
	protected $dbConfig = array(
		'port' => '3306',
		'user' => 'root', //MYSQL_USERNAME,
		'pass' => 'root', //MYSQL_PASSWORD,
		'charset' => 'utf8',
		'address' => '127.0.0.1',
		'dbname' => 'pache', //MYSQL_DATABASE
	);
	private static $con;

	protected $db;
	protected function connect(){
		try{
			$dsn = "mysql:
			address={$this->dbConfig['address']};
			port={$this->dbConfig['port']};
			dbname={$this->dbConfig['dbname']};
			charset={$this->dbConfig['charset']};
			";

			$this->db = new PDO($dsn, $this->dbConfig['user'], $this->dbConfig['pass']);
		}catch( PDOException $e ){
			die("mysqlPDO connect Error: {$e->getMessage()}");
		}
	}
	public function __construct(){

	}
}
class SQLPDO extends SQL {
	public static $COMMENTTABLE = 'qun_comment';

	private static $instance;
	/**
	* 获得单例对象
	* @param @params array 数据库连接信息
	* @return object 单例的对象
	*/
	protected static function getInstance($params = array()){
		if ( !self::$instance instanceof self ){
			self::$instance = new self($params);
		}
		return self::$instance;
	}

	public function __construct(){
		$this->connect();
	}

	private function __clone(){}




	/**
	* @param $sql string 执行的SQL语句
	* @return object PDOStatement
	*/
	protected function query($sql){
		$rst = $this->db->query($sql);
		if ( $rst === false ){
			$error = $this->db->errorInfo();
			die("mysqlPDO query Error: ERROR {$error[1]}({$error[0]}): {$error[2]}");
		}
		return $rst;
	}

	public function preExecute($sql, $preArr=array(), $fetchParam=PDO::FETCH_ASSOC){
		$sth = $this->db->prepare($sql);
		return $sth->execute($preArr);
	}

	/**
	* @param $sql string 执行的SQL语句
	* @return number lastInsertId
	*/
	protected function insert($sql){
		$result = $this->query($sql);
		if ( $result ){
			return $this->db->lastInsertId();
		}else{
			return false;
		}
	}

	/**
	* @param $sql string 执行的SQL语句
	*
	*/
	protected function preInsert($sql, $preArr=array(), $fetchParam=PDO::FETCH_ASSOC){
		$result = $this->preExecute($sql, $preArr, $fetchParam);
		if ( $result ){
			return $this->db->lastInsertId();
		}else{
			return false;
		}
	}

	/**
	* 取得一行结果
	* @param $sql string 执行的SQL语句
	* @return array 关联数组结果
	*/
	protected function fetchRow($sql){
		return $this->query($sql)->fetch(PDO::FETCH_ASSOC);
	}

	/**
	* 取得一列结果
	* @param $sql string 执行的SQL语句
	* @return array 返回的一列结果
	*/
	protected function fetchColumn($sql, $col){
		$colArr = array();
		$stmt = $this->db->prepare($sql);
		$stmt->execute();

		for ($i=0; $i<$stmt->rowCount(); ++$i){
			array_push( $colArr, $stmt->fetchColumn($col) );
		}
		return $colArr;
	}

	/**
	* 取得所有结果
	* @param $sql string 执行的SQL语句
	* @return array 关联数组结果
	*/
	protected function fetchAll($sql){
		return $this->query($sql)->fetchAll(PDO::FETCH_ASSOC);
	}

	protected function preFetchAll($sql, $preArr=array(), $fetchParam=PDO::FETCH_ASSOC){
		$sth = $this->db->prepare($sql);
		$sth->execute($preArr);

		$result = $sth->fetchAll($fetchParam);
		return $result;
	}



	/**
	* 执行sql语句
	* @param $sql string 执行的SQL语句
	* @return 受到影响的行
	*/
	protected function exec($sql){
		return $this->db->exec($sql);
	}
}
?>
