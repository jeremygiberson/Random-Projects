<?php


// Define path to application directory
defined('APPLICATION_PATH')
    || define('APPLICATION_PATH', realpath(dirname(__FILE__) . '/private/application'));

// Define application environment
defined('APPLICATION_ENV')
    || define('APPLICATION_ENV', (getenv('APPLICATION_ENV') ? getenv('APPLICATION_ENV') : 'production'));

// Ensure library/ is on include_path
set_include_path(implode(PATH_SEPARATOR, array(
    realpath(APPLICATION_PATH . '/../library'),
    realpath('/var/www/zend/1.11.4/library'),
    get_include_path(),
)));

error_reporting(E_ALL);
ini_set('display_errors', '1');

date_default_timezone_set('America/Denver');

// db requirements
require_once 'Zend/Db/Adapter/Pdo/Mysql.php';
require_once 'Zend/Db/Table.php';

// create db adapter
$db = new Zend_Db_Adapter_Pdo_Mysql(
	array('host' => 'localhost',
		  'username' => 'username',
		  'password' => 'userpassword',
		  'dbname' => 'dbname'));

// set as default adapter for tables
Zend_Db_Table::setDefaultAdapter($db);
