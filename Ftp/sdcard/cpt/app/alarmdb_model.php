<?php
/*
 * AlarmDB <https://github.com/automatikas/AlarmDB>
 * AlarmDB for EasyIO FG and FS controllers:: API controller models
 *
 * @author     Andrius Jasiulionis <automatikas@gmail.com>
 * @copyright  Copyright (c) 2017, Andrius Jasiulionis
 * @license    MIT
 * @version    2.07.2
 */
 
//ini_set('display_errors',1); error_reporting(E_ALL); 

$table_check = new UI_model();
$table_check->tableExists();

class UI_model {
	
	public $id=0;
	public $ids;
	public $date;
	public $priority;
	public $value;
	public $text;
	public $tags;
	public $ackn;
	public $ackn_user;
	public $adate;
	
	public function setDate($date){
		$this->date=$date;
		return true;
	}
	
	public function setPriority($priority){
		$this->priority=$priority;
		return true;
	}

	public function setValue($value){
		$this->value=$value;
		return true;
	}
	
	public function setText($text){
		$this->text=$text;
		return true;
	}
	
	public function setTags($tags){
		$this->tags=$tags;
		return true;
	}
	
	public function setAckn($ackn){
		$this->ackn=$ackn;
		return true;
	}
	
	public function setAckn_user($ackn_user){
		$this->ackn_user=$ackn_user;
		return true;
	}
	
	public function setAdate($adate){
		$this->adate=$adate;
		return true;
	}
	
	public function setIds($ids){
		$this->ids=$ids;
		return true;
	}

	/**
	 * This loads a alarms based on its IDs
	 */
	public function getAlarm($id){
		if($id!==''){
			$db = DBConn::instance()->history_db();
			$getIdArray = array();
			$wrongIdArray = array();
			$getIdArray = explode(',', $id);
			$limit = 10000;
			foreach($getIdArray as $value){
				$stmt = $db->prepare('SELECT * FROM alarms WHERE id=:value LIMIT :limit');
				$stmt ->bindValue(':value', $value);
				$stmt ->bindValue(':limit', $limit);
				$stmt->execute();
				$stmt->setFetchMode(PDO::FETCH_ASSOC);
				$row = $stmt->fetch();
				if($row['id']!=='' && !is_null($row['id'])){
					$alarm=array();
					$alarm['id']=$row['id'];
					$alarm['date']=$row['date'];
					$alarm['priority']=$row['priority'];
					$alarm['value']=$row['value'];
					$alarm['text']=$row['text'];
					$alarm['tags']=$row['tags'];
					$alarm['ackn']=$row['ackn'];
					$alarm['ackn_user']=$row['ackn_user'];
					$alarm['adate']=$row['adate'];
					$alarm['attr']=unserialize($row['attr']);
					$alarm['attachment']=unserialize($row['attachment']);
					$notes = $this->loadAllNotes($row['id']);
					if(isset($notes['notes'])) {
						$alarm['notes']=$notes['notes'][$row['id']];
					}
					$allAlarms[]=$alarm;
				} else {
					array_push($wrongIdArray,$value);
				}
			}
			if (count($wrongIdArray) > 0) {
				$responseArray['warning'] = $wrongIdArray;
			}
			if(!empty($allAlarms)){ 
				$responseArray['alarms'] = $allAlarms;
			}
			return $responseArray;
		} else {
			return false;
		}
	}
	
	/**
	 * This loads all alarms from database
	 */
	public function loadAllAlarms(){
		$db = DBConn::instance()->history_db();
		$stmt = $db->prepare('SELECT * FROM alarms ORDER BY date DESC LIMIT :limit');
		$limit = 10000;
		$stmt->bindValue(':limit', $limit);
		$alarms=array();
		$stmt->execute();
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		while($row = $stmt->fetch()){
			$alarm=array();
			$alarm['id']=$row['id'];
			$alarm['date']=$row['date'];
			$alarm['priority']=$row['priority'];
			$alarm['value']=$row['value'];
			$alarm['text']=$row['text'];
			$alarm['tags']=$row['tags'];
			$alarm['ackn']=$row['ackn'];
			$alarm['ackn_user']=$row['ackn_user'];
			$alarm['adate']=$row['adate'];
			$alarm['attr']=unserialize($row['attr']);
			$alarm['attachment']=unserialize($row['attachment']);
			$notes = $this->loadAllNotes($row['id']);
			if(isset($notes['notes'])) {
				$alarm['notes']=$notes['notes'][$row['id']];
			}
			$alarms['alarms'][]=$alarm;
		}
		return $alarms;
	}
	
	/**
	 * This loads only active (not acknowledged) alarms from database
	 */
	public function loadActiveAlarms(){
		$db = DBConn::instance()->history_db();
		$limit = 10000;
		$stmt = $db->prepare('SELECT * FROM alarms WHERE ackn IS NOT :value ORDER BY date DESC LIMIT :limit');
		$stmt ->bindValue(':value', 'true');
		$stmt ->bindValue(':limit', $limit);
		$stmt->execute();
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		$alarms=array();
		while($row = $stmt->fetch()){
			$alarm=array();
			$alarm['id']=$row['id'];
			$alarm['date']=$row['date'];
			$alarm['priority']=$row['priority'];
			$alarm['value']=$row['value'];
			$alarm['text']=$row['text'];
			$alarm['tags']=$row['tags'];
			$alarm['ackn']=$row['ackn'];
			$alarm['ackn_user']=$row['ackn_user'];
			$alarm['adate']=$row['adate'];
			$alarm['attr']=unserialize($row['attr']);
			$alarm['attachment']=unserialize($row['attachment']);
			$notes = $this->loadAllNotes($row['id']);
			if(isset($notes['notes'])) {
				$alarm['notes']=$notes['notes'][$row['id']];
			}
			$alarms['alarms'][]=$alarm;
		}
		return $alarms;
	}	
	
	/**
	 * This saves the alarms in database
	 */
	public function saveAlarm(){
		if($this->date!='' && $this->priority!='' && $this->value!='' && $this->text!=''){
			$db = DBConn::instance()->history_db();
			$alarm=array();
			$date=$this->date;
			$priority=$this->priority;
			$value=$this->value;
			$text=$this->text;
			$tags=$this->tags;
			$stmt = $db->prepare('INSERT INTO alarms (priority, date, value, text, tags) VALUES (:priority, :date, :value, :text, :tags)');
			$stmt ->bindValue(':priority', $priority);
			$stmt ->bindValue(':date', $date);
			$stmt ->bindValue(':value', $value);
			$stmt ->bindValue(':text', $text);
			$stmt ->bindValue(':tags', $tags);
			$rowDb = $stmt->execute();
			if(!$rowDb){
				return false;
				//echo $db->lastErrorMsg();
			}
			return true;
		} else {
			return false;
		}
	}
	
		/**
	 * This acknoledges the alarms in database
	 */
	public function acknAlarm($id,$ackn_user,$now){
		if($id!='' && $ackn_user!='' && $now!=''){
			$db = DBConn::instance()->history_db();
			$acknIdArray = explode(',', $id);
			$updateArray = array();
			$wrongIdArray = array();
			$returnArray = array();
			$limit = 10000;
			foreach($acknIdArray as $value){
				$stmt = $db->prepare('UPDATE alarms SET ackn=:ackn, ackn_user=:ackn_user, adate=:now WHERE id=:value');
				$stmt ->bindValue(':ackn', 'true');
				$stmt ->bindValue(':ackn_user', $ackn_user);
				$stmt ->bindValue(':now', $now);
				$stmt ->bindValue(':value', $value);
				$stmt->execute();
				$stmt = $db->prepare('SELECT * FROM alarms WHERE id=:value LIMIT :limit');
				$stmt ->bindValue(':value', $value);
				$stmt ->bindValue(':limit', $limit);
				$rowDb = $stmt->execute();
				$stmt->setFetchMode(PDO::FETCH_ASSOC);
				$row = $stmt->fetch();
				if($row['id']!='' || $row['id']!=null){
					$alarm=array();
					$alarm['id']=$row['id'];
					$alarm['date']=$row['date'];
					$alarm['priority']=$row['priority'];
					$alarm['value']=$row['value'];
					$alarm['text']=$row['text'];
					$alarm['tags']=$row['tags'];
					$alarm['ackn']=$row['ackn'];
					$alarm['ackn_user']=$row['ackn_user'];
					$alarm['adate']=$row['adate'];
					$alarm['attr']=unserialize($row['attr']);
					$alarm['attachment']=unserialize($row['attachment']);
					$notes = $this->loadAllNotes($row['id']);
					if(isset($notes['notes'])) {
						$alarm['notes']=$notes['notes'][$row['id']];
					}
					$allAlarms[]=$alarm;
				} else {
					array_push($wrongIdArray,$value);
				}
			}
			if (count($wrongIdArray) > 0) {
				$responseArray['warning'] = $wrongIdArray;
			}
			if(isset($allAlarms)) {
				$responseArray['alarms'] = $allAlarms;
			}
			$totals = $this->readTotal();
			if(!empty($totals)) {
				$responseArray['totals'] = $totals;
			}
			return $responseArray;
		} else {
				return false;
		}
	}
	
	/**
	 * Deletes alarms with a specific IDs from database
	 */
	public function deleteAlarm($id){
		if($id!=''){
			$db = DBConn::instance()->history_db();
			$deleteIdArray = explode(',', $id);
			$wrongIdArray = array();
			foreach($deleteIdArray as $value){	
				$stmt = $db->prepare('DELETE FROM alarms WHERE id=:value');
				$stmt ->bindValue(':value', $value);
				$stmt->execute();
				//need check if deleted
				$stmt = $db->prepare('DELETE FROM notes WHERE alarm_id=:value');
				$stmt ->bindValue(':value', $value);
				$stmt->execute();
			}
			if (count($wrongIdArray) > 0) {
				$responseArray['warning'] = $wrongIdArray;
			}
			$totals = $this->readTotal();
			if(!empty($totals)) {
				$responseArray['totals'] = $totals;
			}
			if(!empty($responseArray)) {
				return $responseArray;
			}
			return true;
		} else {
				return false;
		}		
	}
		
	/**
	 * This loads all alarms from database into returned value
	 */
	public function loadUiAllAlarms(){
		$db = DBConn::instance()->history_db();
		$limit = 500;
		$stmt = $db->prepare('SELECT * FROM alarms ORDER BY date DESC LIMIT :limit');
		$stmt ->bindValue(':limit', $limit);
		$stmt->execute();
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		$responseArray=array();
		$activeAlarms=array();
		$allAlarms=array();
		while($row = $stmt->fetch()){
			$alarm=array();
			$alarm['id']=$row['id'];
			$alarm['date']=$row['date'];
			$alarm['priority']=$row['priority'];
			$alarm['value']=$row['value'];
			$alarm['text']=$row['text'];
			$alarm['tags']=$row['tags'];
			$alarm['ackn']=$row['ackn'];
			$alarm['ackn_user']=$row['ackn_user'];
			$alarm['adate']=$row['adate'];
			$alarm['attr']=unserialize($row['attr']);
			$alarm['attachment']=unserialize($row['attachment']);
			$notes = $this->loadAllNotes($row['id']);
			if(isset($notes['notes'])) {
				$alarm['notes']=$notes['notes'][$row['id']];
			}
			$allAlarms[]=$alarm;
		}
		$stmt = $db->prepare('SELECT * FROM alarms WHERE ackn IS NOT :value ORDER BY date DESC LIMIT :limit');
		$stmt ->bindValue(':value', 'true');
		$stmt ->bindValue(':limit', $limit);
		$stmt->execute();
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		$activeAlarms = array();
		while($row = $stmt->fetch()){
			$alarm=array();
			$alarm['id']=$row['id'];
			$alarm['date']=$row['date'];
			$alarm['priority']=$row['priority'];
			$alarm['value']=$row['value'];
			$alarm['text']=$row['text'];
			$alarm['tags']=$row['tags'];
			$alarm['ackn']=$row['ackn'];
			$alarm['ackn_user']=$row['ackn_user'];
			$alarm['adate']=$row['adate'];
			$alarm['attr']=unserialize($row['attr']);
			$alarm['attachment']=unserialize($row['attachment']);
			$notes = $this->loadAllNotes($row['id']);
			if(isset($notes['notes'])) {
				$alarm['notes']=$notes['notes'][$row['id']];
			}
			$activeAlarms[]=$alarm;
		}
		if(!empty($allAlarms)) {
			$responseArray['alarms'] = $allAlarms;
		}
		if(!empty($activeAlarms)) {
			$responseArray['active_alarms'] = $activeAlarms;
		}
		$totals = $this->readTotal();
		if(!empty($totals)) {
			$responseArray['totals'] = $totals;
		}
		return $responseArray;
	}
	
	/**
	 * This loads a Notes based on alarm IDs
	 */
	public function loadAllNotes($id){
		if($id!==''){
			$db = DBConn::instance()->history_db();
			$limit = 1000;
			$getIdArray = explode(',', $id);
			$responseArray = array();
			foreach($getIdArray as $value){
				$stmt = $db->prepare('SELECT * FROM notes WHERE alarm_id=:value LIMIT :limit');
				$stmt ->bindValue(':value', $value);
				$stmt ->bindValue(':limit', $limit);
				$stmt->execute();
				$stmt->setFetchMode(PDO::FETCH_ASSOC);
				while($row = $stmt->fetch()){
					if($row['alarm_id']!=='' && !is_null($row['alarm_id'])){
						$note=array();
						$note['date']=$row['date'];
						$note['text']=$row['text'];
						$note['user']=$row['user'];
						$allNotes["$value"][]=$note;
					}
				}
			}
			if(!empty($allNotes)){
				$responseArray['notes'] = $allNotes;
			}
			return $responseArray;
		} else {
			return false;
		}
	}
	
	/**
	 * This saves the notes in database
	 */
	public function writeAllNotes($ids,$user,$text,$now){
		if($ids!='' && $user!='' && $text!='' && $now!=''){
			$db = DBConn::instance()->history_db();
			$limit = 1000;
			$getIdArray = explode(',', $ids);
			$responseArray = array();
			foreach($getIdArray as $value){
				$stmt = $db->prepare('INSERT INTO notes (alarm_id, user, date, text) VALUES (:value, :user, :now, :text)');
				$stmt ->bindValue(':value', $value);
				$stmt ->bindValue(':user', $user);
				$stmt ->bindValue(':now', $now);
				$stmt ->bindValue(':text', $text);
				$rowDb = $stmt->execute();
				if(!$rowDb){
					return false;
				}
			}
			
			foreach($getIdArray as $value){
				$stmt = $db->prepare('SELECT * FROM notes WHERE alarm_id=:value LIMIT :limit');
				$stmt ->bindValue(':value', $value);
				$stmt ->bindValue(':limit', $limit);
				$stmt->execute();
				$stmt->setFetchMode(PDO::FETCH_ASSOC);
				while($row = $stmt->fetch()){
					if($row['alarm_id']!=='' && !is_null($row['alarm_id'])){
						$note=array();
						$note['date']=$row['date'];
						$note['text']=$row['text'];
						$note['user']=$row['user'];
						$allNotes["$value"][]=$note;
					}
				}
			}
			if(!empty($allNotes)){
				$responseArray['notes'] = $allNotes;
			}
			$totals = $this->readTotal();
			if(!empty($totals)) {
				$responseArray['totals'] = $totals;
			}
			return $responseArray;
		} else {
			return false;
		}
	}
	
	/**
	 * This returns total count of records from DB
	 */
	public function readTotal(){
		$db = DBConn::instance()->history_db();
		$limit = 100000;
		$stmt = $db->prepare('SELECT ackn FROM alarms LIMIT :limit');
		$stmt ->bindValue(':limit', $limit);
		$stmt->execute();
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		$activeAlarms = array();
		$a = 0;
		$b = 0;
		while($row = $stmt->fetch()){
			if($row['ackn'] == 'true'){
				$b++;
			} else {
				$a++;
			}
		}
		$responseArray['active'] = $a;
		$responseArray['ackn'] = $b;
		
		$stmt = $db->prepare('SELECT date FROM notes LIMIT :limit');
		$stmt ->bindValue(':limit', $limit);
		$stmt->execute();
		$stmt->setFetchMode(PDO::FETCH_ASSOC);
		$activeAlarms = array();
		$c = 0;
		while($row = $stmt->fetch()){
			$c++;
		}
		$responseArray['notes'] = $c;
		return $responseArray;
	}
	
	/**
	 * This checks DB if AlarmDB tables ready/created if not creates new tables
	 */
	public function tableExists() {
		$db = DBConn::instance()->history_db();
		try {
			$alarms = $db->query("SELECT 1 FROM alarms LIMIT 1");
		} catch (Exception $e) {
			$alarms = false;
		}	
		if(!$alarms) {
			$db->query("CREATE TABLE alarms (id INTEGER PRIMARY KEY AUTOINCREMENT, priority TEXT, date TEXT, value TEXT, text TEXT, tags TEXT, ackn TEXT, adate TEXT, ackn_user TEXT, attr TEXT, attachment TEXT)");
		}
		try {
			$notes = $db->query("SELECT 1 FROM notes LIMIT 1");
		} catch (Exception $e) {
			$notes = false;
		}
		if(!$notes) {
			$db->query("CREATE TABLE notes (id INTEGER PRIMARY KEY AUTOINCREMENT, alarm_id TEXT, user TEXT, date TEXT, text TEXT)");
		}
		return false;
	}

}
	
?>