<?php
/*
 * AlarmDB <https://github.com/automatikas/AlarmDB>
 * AlarmDB for EasyIO FG and FS controllers:: API controller
 *
 * @author     Andrius Jasiulionis <automatikas@gmail.com>
 * @copyright  Copyright (c) 2017, Andrius Jasiulionis
 * @license    MIT
 * @version    2.07.2
 */
 
//ini_set('display_errors',1); error_reporting(E_ALL); 
class UI_controler {

	/*
	 * Data to be returned is stored in this variable
	 */
	public $returnData=array();

	/*
	 * Add new alarm data to database. 
	 */
	public function add($input){
		if(!isset($input['priority']) || $input['priority']==''){
			$this->returnData['error']='Alarm priority is missing';
		} else if(!isset($input['value']) || $input['value']==''){
			$this->returnData['error']='Alarm value is missing';
		} else if(!isset($input['text']) || $input['text']==''){
			$this->returnData['error']='Alarm text is missing';
		} else {
			if(!isset($input['date'])){
				$t = time();
				$now = date("Y-m-d H:i:s",$t);
			} else {
				$format = 'Y-m-d H:i:s';
				$date = DateTime::createFromFormat($format, $input['date']);
				if($date && $date->format($format) === $input['date']) {
					$now = $input['date'];
				} else {
					$this->returnData['error']='Wrong alarm date format. Use date format Y-m-d H:i:s';
					return $this->returnData;
				}
			}
			$alarm= new UI_model();
			$alarm->setDate($now);
			$x = $this->validatePriority($input['priority']);
			$alarm->setPriority($x);
			$x = $this->validateValue($input['value']);
			$alarm->setValue($x);
			$x = $this->validateText($input['text']);
			$alarm->setText($x);
			if(isset($input['tags'])){
				$x = $this->validateTags($input['tags']);
				$alarm->setTags($x);
			} else {
				$alarm->setTags('alarmdb');
			}
			if($alarm->saveAlarm()){
				$this->returnData['success']='Alarm logged!';
			} else {
				$this->returnData['error']='Could not log alarm!';
			}
		}
		return $this->returnData;
	}
	
	/*
	 * Get alarm data from database for specified ID
	 */
	public function get($input){
		if(!isset($input['id']) || $input['id']=='' || $input['id']==0){
			$this->returnData['warning']='ID is not set in getAlarm!';
		} else {
			$alarm= new UI_model();
			$x = $this->validateID($input['id']);
			$alarm=$alarm->getAlarm($x);
			if(!is_array($alarm)){
				if($alarm) {
					$this->returnData=$alarm;
				} else {
					$this->returnData['error']='Database error in getAlarm model';
				}
			} else {
				if(isset($alarm['warning'])){ 	
					$this->returnData['warning']='One or more alarms are not found in database with specified IDs!';
					$this->returnData['ids']=$alarm['warning'];
					$this->returnData['alarms']=$alarm['alarms'];
				} else {
					$this->returnData['alarms']=$alarm['alarms'];
				}
			}
		}
		return $this->returnData;
	}
	
	/*
	 * Load all listed alarms from database
	 */
	public function all(){
		$alarms= new UI_model();
		$alarms=$alarms->loadAllAlarms();
		if($alarms){
			$this->returnData=$alarms;
		} else {
			$this->returnData['info']='No alarms found!';
		}
		return $this->returnData;
	}
	
	/*
	 * Load all not acknowledged (active) alarms from database
	 */
	public function active(){
		$alarms= new UI_model();
		$alarms=$alarms->loadActiveAlarms();
		if($alarms){
			$this->returnData=$alarms;
		} else {
			$this->returnData['info']='No active alarms found!';
		}
		return $this->returnData;
	}
	
	/*
	 * Delete alarms from database with specified IDs
	 */
	public function delete($input){
		if(!isset($input['id']) || $input['id']=='' || $input['id']==0){
			$this->returnData['warning']='ID is incorrect!';
		} else {
			$alarm= new UI_model();
			$x = $this->validateID($input['id']);
			$alarm=$alarm->deleteAlarm($x);
			if(!is_array($alarm)){
				if($alarm) {
					$this->returnData['success']='Alarm(s) deleted!';
				} else {
					$this->returnData['error']='Database error in deleteAlarm model';
				}
			} else {
				if(isset($alarm['warning'])){ 	
					$this->returnData['warning']='One or more alarms are not found in database with specified IDs!';
					$this->returnData['ids']=$alarm['warning'];
				}
				if(isset($alarm['totals'])){ 
					$this->returnData['totals']=$alarm['totals'];
					if(!isset($alarm['warning'])){
						$this->returnData['success']='Alarm(s) deleted!';
					}
				}
			}
		}
		return $this->returnData;
	}
	
	/*
	 * Acknowledge alarms in database with specified IDs
	 */
	public function ackn($input){
		if(!isset($input['id']) || $input['id']=='' || $input['id']==0){
			$this->returnData['error']='ID is incorrect!';
		} else if(!isset($input['ackn_user']) || $input['ackn_user']==''){
			$this->returnData['error']='Acknowledge user name is missing';
		} else {
			if(!isset($input['adate'])){
				$t = time();
				$now = date("Y-m-d H:i:s",$t);
			} else {
				$format = 'Y-m-d H:i:s';
				$date = DateTime::createFromFormat($format, $input['adate']);
				if($date && $date->format($format) === $input['adate']) {
					$now = $input['adate'];
				} else {
					$this->returnData['error']='Wrong alarm acknowledge date format. Use PHP date format Y-m-d H:i:s';
					return $this->returnData;
				}
			}
			$alarm = new UI_model();
			$ids = $this->validateID($input['id']);
			$user = $this->validateUser($input['ackn_user']);
			$alarm=$alarm->acknAlarm($ids,$user,$now);
			if(!is_array($alarm)){
				if($alarm) {
					$this->returnData=$alarm;
				} else {
					$this->returnData['error']='Database error in getAlarm model';
				}
			} else {
				if(isset($alarm['warning'])){ 	
					$this->returnData['warning']='One or more alarms are not found in database with specified IDs!';
					$this->returnData['ids']=$alarm['warning'];
				}
				if(isset($alarm['alarms'])){ 
					$this->returnData['alarms']=$alarm['alarms'];
				}				
				if(isset($alarm['totals'])){ 
					$this->returnData['totals']=$alarm['totals'];
				}
			}
		}
		return $this->returnData;
	}
	/*
	 * Load all custom view alarms from database used for AlarmDB UI
	 */
	public function uiall(){
		$alarms= new UI_model();
		$alarms=$alarms->loadUiAllAlarms();
		if($alarms){
			$this->returnData=$alarms;
		} else {
			$this->returnData['info']='No alarms found!';
		}
		return $this->returnData;
	}
	
	/*
	 * Load all notes for alarm from database
	 */
	public function noteget($input){
		if(!isset($input['id']) || $input['id']=='' || $input['id']==0){
			$this->returnData['warning']='ID is not set in noteget!';
		} else {
			$notes= new UI_model();
			$x = $this->validateID($input['id']);
			$notes=$notes->loadAllNotes($x);
			if($notes){
				$this->returnData=$notes;
			} else {
				$this->returnData['info']='No saved notes found!';
			}
		}
		return $this->returnData;
	}
	
	/*
	 * Add new alarm note data to database. 
	 */
	public function noteadd($input){
		if(!isset($input['id']) || $input['id']=='' || $input['id']==0){
			$this->returnData['error']='ID is incorrect!';
		} else if(!isset($input['ackn_user']) || $input['ackn_user']==''){
			$this->returnData['error']='User name is missing';
		} else if(!isset($input['text']) || $input['text']==''){
			$this->returnData['error']='Note text is missing';
		} else {
			if(!isset($input['adate'])){
				$t = time();
				$now = date("Y-m-d H:i:s",$t);
			} else {
				$format = 'Y-m-d H:i:s';
				$date = DateTime::createFromFormat($format, $input['adate']);
				if($date && $date->format($format) === $input['adate']) {
					$now = $input['adate'];
				} else {
					$this->returnData['error']='Wrong note date format. Use PHP date format Y-m-d H:i:s';
					return $this->returnData;
				}
			}
			$notes = new UI_model();
			$ids = $this->validateID($input['id']);
			$user = $this->validateUser($input['ackn_user']);
			$text = $this->validateText($input['text']);
			$notes = $notes->writeAllNotes($ids,$user,$text,$now);
			if($notes){
				$this->returnData=$notes;
			} else {
				$this->returnData['error']='Note not saved!';
			}
		}
		return $this->returnData;
	}
	
	/*
	 * API ping test
	 */
	public function ping(){
		$this->returnData['ping']='ok';
		return $this->returnData;
	}
	
	private function validateID($input){
		//Clean IDs string
		$output = strip_tags(preg_replace('/<[^>]*>/','',str_replace(array('&nbsp;','\n','\r'),'',html_entity_decode($input,ENT_QUOTES,'UTF-8'))));
		$output = str_replace(array("'", "\"", "&quot;"), "", htmlspecialchars($output)); //remove quotes
		$output = preg_replace('/\s*,\s*/', ',', $input); //remove spaces near comma
		$output = preg_replace('/[^0-9,.]/', '', $output); //remove all except numbers, dot and comma
		$output = preg_replace('/\./', ',', $output); //replace dots with comma
		$output = preg_replace('/,+/', ',', $output); //remove comma duplicates
		$output = rtrim($output, ',');//remove last comma
		return $output;
	}
	
	private function validateUser($input){
		//Clean Users string
		$output = strip_tags(preg_replace('/<[^>]*>/','',str_replace(array("&nbsp;","\n","\r"),"",html_entity_decode($input,ENT_QUOTES,'UTF-8')))); //Clean html tags
		$output = str_replace(array("'", "\"", "&quot;"), "", htmlspecialchars($output)); //remove quotes
		$output = preg_replace('/[^A-Za-z0-9?!\s]/','',$output); //replaces all non-space and non-word characters with nothing
		return $output;
	}
	
	private function validatePriority($input){
		//Clean Priority string
		$output = strip_tags(preg_replace('/<[^>]*>/','',str_replace(array("&nbsp;","\n","\r"),"",html_entity_decode($input,ENT_QUOTES,'UTF-8')))); //Clean html tags
		$output = str_replace(array("'", "\"", "&quot;"), "", htmlspecialchars($output)); //remove quotes
		$output = preg_replace('/[^0-9]/', '', $output); //remove all except numbers
		return $output;
	}
	
	private function validateValue($input){
		//Clean Value string
		$output = strip_tags(preg_replace('/<[^>]*>/','',str_replace(array("&nbsp;","\n","\r"),"",html_entity_decode($input,ENT_QUOTES,'UTF-8')))); //Clean html tags
		$output = str_replace(array("'", "\"", "&quot;"), "", htmlspecialchars($output)); //remove quotes
		$output = preg_replace('/\s*,\s*/', ',', $output); //remove spaces near comma
		$output = preg_replace('/,+/', ',', $output); //remove comma duplicates
		$output = rtrim($output, ',');//remove last comma
		return $output;
	}
	
	private function validateText($input){
		//Clean Text string
		$output = strip_tags(preg_replace('/<[^>]*>/','',str_replace(array("&nbsp;","\n","\r"),"",html_entity_decode($input,ENT_QUOTES,'UTF-8')))); //Clean html tags
		$output = str_replace(array("'", "\"", "&quot;"), "", htmlspecialchars($output)); //remove quotes
		return $output;
	}
	
	private function validateTags($input){
		//Clean Tags string
		$output = strip_tags(preg_replace('/<[^>]*>/','',str_replace(array("&nbsp;","\n","\r"),"",html_entity_decode($input,ENT_QUOTES,'UTF-8')))); //Clean html tags
		$output = str_replace(array("'", "\"", "&quot;"), "", htmlspecialchars($output)); //remove quotes
		$output = preg_replace('/\s*,\s*/', ',', $output); //remove spaces near comma
		$output = preg_replace('/,+/', ',', $output); //remove comma duplicates
		$output = rtrim($output, ',');//remove last comma
		return $output;
	}
}

class UI_permissions {
	
	public function whitelistCommands($method,$command) {
		
		//White-list of commands.
		$get_commands = 'alarmdb-get,alarmdb-all,alarmdb-active,alarmdb-uiall,alarmdb-noteget,alarmdb-ping'; // read-only commands.
		$post_commands = 'alarmdb-add,alarmdb-noteadd,alarmdb-ackn,alarmdb-delete,alarmdb-get'; // write commands. 
		$put_commands = 'alarmdb-ackn';
		$delete_commands = 'alarmdb-delete';
		
		$permision = false;
		switch($method){
			case 'GET':
				$get_commands = explode(",",$get_commands);
				if(in_array($command, $get_commands)) {
					$permision = true;
				}
				break;
			case 'POST':
				$post_commands = explode(",",$post_commands);
				if(in_array($command, $post_commands)) {
					$permision = true;
				}
				break;
			case 'PUT':
				$put_commands = explode(",",$put_commands);
				if(in_array($command, $put_commands)) {
					$permision = true;
				}
				break;
			case 'DELETE':
				$delete_commands = explode(",",$delete_commands);
				if(in_array($command, $delete_commands)) {
					$permision = true;
				}
				break;
			default:
				return false;
		}
		return $permision;
	}
	
}

?>