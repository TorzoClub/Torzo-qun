<?php
/*
	显示今天的问卷
*/
require('./lib/Store.class.php');

$store = Store::getInstance();
print(json_encode($store->getToday()));

?>
