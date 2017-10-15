<?php
/*
 * AlarmDB <https://github.com/automatikas/AlarmDB>
 * AlarmDB for EasyIO FG and FS controllers:: API
 *
 * @author     Andrius Jasiulionis <automatikas@gmail.com>
 * @copyright  Copyright (c) 2017, Andrius Jasiulionis
 * @license    MIT
 * @version    2.07
 */
 
	//ini_set('display_errors',1); error_reporting(E_ALL);

	include_once 'base_controller.php';
	include_once 'alarmdb_controller.php';
	include_once 'alarmdb_model.php';
	
	date_default_timezone_set('UTC');
	// this one will be an issue later, need better time-zone handling for future release!
	
	$a = array();
	$a = new stdClass();
	$input = '';
	
  class AlarmDBController extends BaseController {

    protected function signinRequired() {
      return true;
    }

    protected function authKeyRequired() {
      return true;
    }

    protected function sameHostAuthFree() {
      return true;
    }

    protected function doAjaxGet() {
      $this->doGet();
    }
	protected function doAjaxPost() {
      $this->doPost();
    }

    protected function doGet() {
		$input = $this->getInputs($_GET);
		$alarms = new UI_controler();
		$get_command = preg_replace('/^alarmdb-/', '', $input['www-command']);
		$alarms->$get_command($input);
		
		switch($input['format']) {
			case 'xml':
				if($input['file']){
					$file_name = date("YmdHis",time()).'_alarmdb_export';
					header('Content-disposition: attachment; filename='.$file_name.'.xml');
				}
				header('Content-type: application/xml;charset=utf-8');
				function array_to_xml( $data, &$xml_data ) {
					foreach( $data as $key => $value ) {
						if( is_numeric($key) ){
							$key = 'item'.$key;
						}
						if( is_array($value) ) {
							$subnode = $xml_data->addChild($key);
							array_to_xml($value, $subnode);
						} else {
							$xml_data->addChild("$key",htmlspecialchars("$value"));
						}
					}
				}
				$data = $alarms->returnData;
				$xml_data = new SimpleXMLElement('<?xml version="1.0"?><data></data>');
				array_to_xml($data,$xml_data);
				echo $xml_data->asXML();
				break;
			case 'csv':
				if($input['file']){
					$file_name = date("YmdHis",time()).'_alarmdb_export';
					header('Content-disposition: attachment; filename='.$file_name.'.csv');
				}
				header('Content-type: text/csv;charset=utf-8');
				function array_to_csv($data) {
					$outputBuffer = fopen("php://output", 'w');
					$keys = array_keys($data['0']);
					foreach (array_keys($keys, 'notes') as $key) {
						unset($keys[$key]);
					}
					fputcsv($outputBuffer, $keys);
					foreach($data as $val) {
						unset($val['notes']); 
						fputcsv($outputBuffer, $val);
					}
					fclose($outputBuffer);
				}
				$data = $alarms->returnData['alarms'];
				array_to_csv($data);
				break;
			default:
				if($input['file']){
					$file_name = date("YmdHis",time()).'_alarmdb_export';
					header('Content-disposition: attachment; filename='.$file_name.'.json');
				}
				header('Content-type: application/json;charset=utf-8');
				header('Access-Control-Allow-Origin: *');
				echo json_encode($alarms->returnData);
				break;
		}
    }
	
	protected function doPost() {
		$input = $this->getInputs($_POST);
		$alarms = new UI_controler();
		$get_command = preg_replace('/^alarmdb-/', '', $input['www-command']);
		$alarms->$get_command($input);
		header('Content-type: application/json;charset=utf-8');
		echo json_encode($alarms->returnData);
	}
	
	protected function getInputs($_inputs) {
		$input = null;
		if(empty($_inputs['www-command']) || !isset($_inputs['www-command']) ) {
			header("HTTP/1.1 400 Bad Request: API command is missing");
			exit;
		} else {
			$a = new UI_permissions();
			$authorizeAuthkey = false;
			$authorizeUser = false;
			$whiteListCommand = false;
			//Command white list
			$whiteListCommand = $a->whitelistCommands($_SERVER["REQUEST_METHOD"],$_inputs['www-command']);
			if(!$whiteListCommand) {
				header("HTTP/1.1 403 Forbidden: API Command: ".$_inputs['www-command']." is not supported for ".$_SERVER["REQUEST_METHOD"]." method");
				exit;
			} else {
				$input['www-command'] = $_inputs['www-command'];
			}
		}
		//API inputs
		if(!empty($_inputs['id'])) {
			$input['id'] = $_inputs['id'];
		}
		if(!empty($_inputs['priority'])) {
			$input['priority'] = $_inputs['priority'];
		}
		if(!empty($_inputs['value'])) {
			$input['value'] = $_inputs['value'];
		}
		if(!empty($_inputs['text'])) {
			$input['text'] = $_inputs['text'];
		}
		if(!empty($_inputs['date'])) {
			$input['date'] = $_inputs['date'];
		}
		if(!empty($_inputs['ackn'])) {
			$input['ackn'] = $_inputs['ackn'];
		}
		if(!empty($_inputs['ackn_user'])) {
			$input['ackn_user'] = $_inputs['ackn_user'];
		}
		if(!empty($_inputs['adate'])) {
			$input['adate'] = $_inputs['adate'];
		}
		if(!empty($_inputs['tags'])) {
			$input['tags'] = $_inputs['tags'];
		}
		if(!empty($_inputs['format'])) {
			$input['format'] = $_inputs['format'];
		} else {
			$input['format'] = 'json';
		}
		if(isset($_inputs['file'])) {
			$input['file'] = true;
		} else {
			$input['file'] = false;
		}
		return $input;
	}
	

  };

  $controller = new AlarmDBController();
  $controller->run();

?>
