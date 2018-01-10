<?php
/*
 * AlarmDB <https://github.com/automatikas/AlarmDB>
 * AlarmDB for EasyIO FG and FS controllers:: API
 *
 * @author     Andrius Jasiulionis <automatikas@gmail.com>
 * @copyright  Copyright (c) 2017, Andrius Jasiulionis
 * @license    MIT
 * @version    2.07.5
 */
 
	//ini_set('display_errors',1); error_reporting(E_ALL);
	set_include_path(get_include_path() . PATH_SEPARATOR . '../../app');

	include_once 'base_controller.php';
	include_once "data_formatters.php";
	include_once 'alarmdb_controller.php';
	include_once 'alarmdb_model.php';
	
	date_default_timezone_set('UTC');
	
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
		$this->printRes($input,$alarms);
    }
	
	protected function doPost() {
		$input = $this->getInputs($_POST);
		$alarms = new UI_controler();
		$get_command = preg_replace('/^alarmdb-/', '', $input['www-command']);
		$alarms->$get_command($input);
		$this->printRes($input,$alarms);
	}
	
	protected function printRes($input,$alarms) {
		switch($input['format']) {
			case 'xml-ghcvbcbcb': //No XML export for FS and FG
				if($input['file']){
					$file_name = date("YmdHis",time()).'_alarmdb_export';
					header('Content-disposition: attachment; filename='.$file_name.'.xml;');
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
				if($input['file']){
					$now = time();
					$date_format = date("Y-m-d H:i:s",$now);
					$format = 'csv';
					$file_name = 'alarmdb_export';
					$formater = new DataFormatter();
					$formater->saveToLocal($file_name);
					$path = $formater->localFilePath('.'.$format);
					$fp = fopen($path, 'w+');
					$keys = array_keys($data['0']);
					foreach (array_keys($keys, 'notes') as $key) {
						unset($keys[$key]);
					}
					fwrite($fp, fputcsv($fp, $keys));
					foreach($data as $val) {
						unset($val['notes']); 
						fwrite($fp, fputcsv($fp, $val));
					}
					fclose($fp);
					$link = strstr($path, '/sdcard/');
					$responce['export_status'] = 'ready';
					$responce['date'] = $date_format;
					$responce['format'] = $format;
					$responce['href'] = $link;
					header('Content-type: application/json;charset=utf-8');
					echo json_encode($responce);
					break;
				}
				array_to_csv($data);
				break;
			default:
				if($input['file'] || $input['save_to_local']){
					$now = time();
					$date_format = date("Y-m-d H:i:s",$now);
					$format = 'json';
					$file_name = 'alarmdb_export';
					$formater = new DataFormatter();
					$formater->saveToLocal($file_name);
					$path = $formater->localFilePath('.'.$format);
					$fp = fopen($path, 'w+');
					fwrite($fp, json_encode($alarms->returnData));
					fclose($fp);
					$link = strstr($path, '/sdcard/');
					$responce['export_status'] = 'ready';
					$responce['date'] = $date_format;
					$responce['format'] = $format;
					$responce['href'] = $link;
					header('Content-type: application/json;charset=utf-8');
					echo json_encode($responce);
					break;
				}
				header('Content-type: application/json;charset=utf-8');
				header('Access-Control-Allow-Origin: *');
				echo json_encode($alarms->returnData);
				break;
		}
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
			$whiteListCommand = $a->whitelistCommands($_SERVER["REQUEST_METHOD"],$_inputs['www-command']);
			if(!$whiteListCommand) {
				header("HTTP/1.1 403 Forbidden: API Command: ".$_inputs['www-command']." is not supported for ".$_SERVER["REQUEST_METHOD"]." method");
				exit;
			} else {
				$input['www-command'] = $_inputs['www-command'];
			}
		}
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
		if(isset($_inputs['save_to_local'])) {
			$input['save_to_local'] = true;
		} else {
			$input['save_to_local'] = false;
		}
		return $input;
	}
  };
  $controller = new AlarmDBController();
  $controller->run();
?>