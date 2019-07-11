<?php
/*
 * AlarmDB <https://github.com/automatikas/AlarmDB>
 * AlarmDB for EasyIO FG and FS controllers:: Render HTML
 *
 * @author     Andrius Jasiulionis <automatikas@gmail.com>
 * @copyright  Copyright (c) 2017, Andrius Jasiulionis
 * @license    MIT
 * @version    2.08.2
 */

//ini_set('display_errors',1); error_reporting(E_ALL);

set_include_path(get_include_path() . PATH_SEPARATOR . '../../app');

include_once "db.php";
include_once "settings.php";
include_once "feature_control.php";
include_once "base_controller.php";

class AlarmDBController extends BaseController {
	protected function signinRequired() {
		return true;
	}
}

$controller = new AlarmDBController();
$controller->run();
$u = $controller->curUser();

?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title><?php echo Config::$webPageTitle ?></title>
		<link rel="stylesheet" type="text/css" href="../alarmdb/css/bootstrap.min.css" />
		<link rel="stylesheet" type="text/css" href="../alarmdb/css/daterangepicker.css" />
		<link rel="stylesheet" type="text/css" href="../alarmdb/css/alarmdb.css" />
		<script type="text/javascript" src="../alarmdb/js/jquery.min.js"></script>
		<script type="text/javascript" src="../alarmdb/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="../alarmdb/js/moment.min.js"></script>
		<script type="text/javascript" src="../alarmdb/js/daterangepicker.js"></script>
		<script type="text/javascript" src="../alarmdb/js/alarmdb.js"></script>
	</head>
	<body class="theme-freeboard">
	
		<div id ="myAlarmContainer" class="container-fluid"></div>
		
		<script type="text/javascript">
			$(document).ready(function () {
				AlarmDbSettings.ui.loadContainer.divId = "#myAlarmContainer";
				AlarmDbSettings.ui.user.name = "<?php echo htmlspecialchars($u->attr('name'), ENT_QUOTES|ENT_HTML401) ?>";
				loadAlarmDB();
			});
		</script>	
		
	</body>
</html>
