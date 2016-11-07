<?php
require('./lib/Store.class.php');
$store = Store::getInstance();

require('./lib/VQFDefine.class.php');
echo json_encode(VQFDefine::$question);

?>
