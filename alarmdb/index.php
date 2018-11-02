<?php
/*
 * AlarmDB <https://github.com/automatikas/AlarmDB>
 * AlarmDB for EasyIO FG and FS controllers:: Render HTML
 *
 * @author     Andrius Jasiulionis <automatikas@gmail.com>
 * @copyright  Copyright (c) 2017, Andrius Jasiulionis
 * @license    MIT
 * @version    2.08
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
	<body>
	
		<div id ="myAlarmContainer" class="container-fluid"></div>
		
		<script type="text/javascript">
			$(document).ready(function () {
				//Set-up AlarmDB before render it to web-page
				AlarmDbSettings.href = "https://github.com/automatikas/AlarmDB-EasyIO/releases/tag/"; //Link to AlarmDB-EasyIO github branch.
				AlarmDbSettings.api.location = "alarmdb_exporter.php"; 				// Link to DB connector
				AlarmDbSettings.api.headers.auth_key = ""; 							// EasyIO FG/FS auth_key to access alarmdb_exporter.php without login. Not needed within same host
				AlarmDbSettings.ui.loadContainer.divId = "#myAlarmContainer";		// HTLM DIV ID where to render AlarmDb
				AlarmDbSettings.ui.user.name = "<?php echo $u->attr('name') ?>";	// Active user name from FG/FS used to acknowledge alarms and for writing alarm notes
				AlarmDbSettings.ui.logo.img = "img/logo.png";						// Link to logo image of AlarmDB. For custom logos use 300x100px images
				AlarmDbSettings.ui.controlBar.usermenu.enabled = false;				// Native AlarmDB API is not used so to avoid login conflicts disable AlarmDB user account management
				AlarmDbSettings.ui.controlBar.export.formats[1].enabled = false; 	// Disable XML export. Missing SimpleXMLElement converter. Workaround for XML within next release
				AlarmDbSettings.ui.dateselector.enabled = true;						// Date range selector for alarms
				AlarmDbSettings.ui.tabs.display = true;								// Hide tabs only show active alarm tabs.(more like log view style)
				AlarmDbSettings.ui.table.action.buttons.ackn.enabled = true;		// disable alarm acknowledge button.
				AlarmDbSettings.ui.table.action.buttons.delete.enabled = true;		// enable alarm delete button.				
				//Initialize and render AlarmDb to the page
				loadAlarmDB();
			});
		</script>	
		
	</body>
</html>
