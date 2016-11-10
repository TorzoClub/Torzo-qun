# About

这个是同装会 QQ 群规的 WEB 版本。使用 PHP + MySQL 环境。

# 构建

## 数据库配置

改写 `./lib/SQL.class.php` 中的 `SQLInit` 类的数据库配置

```PHP
<?php

class SQLInit{
	protected $dbConfig = array(
		'port' => '3306',
		'user' => 'root', //MYSQL_USERNAME,
		'pass' => 'root', //MYSQL_PASSWORD,
		'charset' => 'utf8',
		'address' => '127.0.0.1',
		'dbname' => 'pache', //MYSQL_DATABASE
	);
	...
}

?>
```
 - `port` 端口
 - `user` 数据库用户名
 - `pass` 数据库用户密码
 - `charset` 使用的字符集
 - `address` 数据库地址
 - `dbname` 数据库名


## 配置表 - 导册留言板

然后输入以下 SQL 语句来创建表

```SQL

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `qun_comment`;
CREATE TABLE `qun_comment` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `author` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `article` longtext COLLATE utf8_bin,
  `time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

```

如果你想修改表名 `qun_comment`，除了修改上面的 SQL 语句外，还需要修改 `./lib/SQL.class.php` 中的 `SQL::$COMMENTTABLE` 属性


## 配置表 - 问卷调查

输入以下 SQL 语句来创建表

```SQL

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `question`;
CREATE TABLE `question` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `json` longtext COLLATE utf8_bin NOT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

```

如果你修改表名 `question`，除了修改上面的SQL语句外，还需要修改 `./question/lib/Store.class.php` 中的 `Store:$QUESTIONTABLE` 属性

# License

MIT
