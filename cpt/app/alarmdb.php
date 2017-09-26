<?php
/*
 * AlarmDB <https://github.com/automatikas/AlarmDB>
 * AlarmDB for EasyIO FG and FS controllers:: Render HTML
 *
 * @author     Andrius Jasiulionis <automatikas@gmail.com>
 * @copyright  Copyright (c) 2017, Andrius Jasiulionis
 * @license    MIT
 * @version    2.07
 */

//ini_set('display_errors',1); error_reporting(E_ALL);

include_once "db.php";
include_once "settings.php";
include_once "feature_control.php";
include_once "base_controller.php";

class GraphicController extends BaseController {
	protected function signinRequired() {
		return true;
	}

	public function cptToolsBackupUrl() {
		return $this->makeUrl('../CPT-Tools.zip');
	}
}

$controller = new GraphicController();
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
		<link rel="stylesheet" type="text/css" href="../alarmdb/css/alarmdb.css" />
		<script type="text/javascript" src="../alarmdb/js/jquery.min.js"></script>
		<script type="text/javascript" src="../alarmdb/js/bootstrap.min.js"></script>
		<script type="text/javascript" src="../alarmdb/js/alarmdb.js"></script>	
	</head>
	<body>
	
		<div id ="myAlarmContainer" class="container" style="width: 1024px;"></div>
		
		<script type="text/javascript">
			$(document).ready(function () {
				//Set-up AlarmDB before render it to web-page
				AlarmDbSettings.api.location = "../app/alarmdb_exporter.php"; 		// Link to DB connector
				AlarmDbSettings.api.headers.auth_key = ""; 							// EasyIO FG/FS auth_key to access alarmdb_exporter.php without login. Not needed within same host
				AlarmDbSettings.ui.loadContainer.divId = "#myAlarmContainer";		// HTLM DIV ID where to render AlarmDb
				AlarmDbSettings.ui.user.name = "<?php echo $u->attr('name') ?>";	// Active user name from FG/FS used to acknowledge alarms and for writing alarm notes
				AlarmDbSettings.ui.logo.img = "../alarmdb/img/logo.png";			// Link to logo image of AlarmDB. For custom logos use 300x100px images
				AlarmDbSettings.ui.controlBar.usermenu.enabled = false;				// Native AlarmDB API is not used so to avoid login conflicts disable AlarmDB user account management
				AlarmDbSettings.ui.controlBar.export.formats[1].enabled = false; 	// Disable XML export. Missing SimpleXMLElement converter. Workaround for XML within next release
				//Initialize and render AlarmDb to the page
				loadAlarmDB();
			});
		</script>	
		
	</body>
</html>