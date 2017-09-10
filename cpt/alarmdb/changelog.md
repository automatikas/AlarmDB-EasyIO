# AlarmDB Change log

**v2.07/2017-06-16/AJ/Changes:**

* NEW UI ACKN and DELETE ajax calls moved to functions instead of event lisseners.
* NEW UI jQuery new ajax method lisiners: put, delete.
* NEW UI Removed all global variables. Now all settings and variables are defined in one Global array AlarmDbSettings.
* NEW UI Event lisiner to be independent from DOM.
* NEW UI New priority color Grey. Boostrap style "default"
* NEW UI Table template html rendering from function. Simplified intergration can be rendered to any DIV in your page. Check wiki documentation for new intergation examples.
* NEW UI LOGO with link to github alarmdb releases.
* NEW UI Integration of HTTP responce codes for AJAX errors.
* NEW UI Global variable AlarmDbSettings has all texts of UI. Now possible to translate all texts to your language just translate all TITLE variables in the array.
* NEW UI AlarmDbSettings global javaScript variable
* NEW UI login window will be called if HTTP 401 error is returned from API. link, methods, headers Defined in Global variable AlarmDbSettings
* NEW UI Rename AlarmDB.js and user.css files to alarmdb.js and alarmdb.css
* NEW UI Control bar icon facelift. 
* NEW UI New User menu
* NEW UI login modal rendered from function.
* NEW UI better logo quality 600px
* NEW API Controller.php, model.php direct access not allowed
* NEW API Rewrite to comply more with RESTful standard. GET, POST, PUT, DELETE commands.
* NEW API REST commands has separate command whitelists for all methods.
* NEW API Responce format can be set to JSON,XML,CSV. IF not defined JSON will be generated as default.
* NEW API Define "file" in query and will automaticaly triger dowload in the browser as file.
* NEW API Header in responce output X-Content-Type-Options: nosniff
* NEW API Content-Type header includes a charset. UTF-8 as default.
* NEW API X-Frame-Options: DENY will prevent page completely from being displayed in an iframe.
* NEW API X-XSS-Protection: 1; mode=block
* NEW API HTTP Status Codes in case of errors from API. Adaption more to RESTful standarts. 
* NEW API new settings.php file for better API setup. php class:configAlarmDBApi
* NEW API Authentithication auth_key implementation. Key definition in settings.php file. auth_key can bypass login if method auth_key permission is enabled.
* NEW API Authentithication sessions impementation
* NEW API Pasword hashing integration phpass V0.5
* NEW API Authorisation implementation
* NEW API .htacess file in Assets folder to prevent direct access to alarmdb.db NOTE: works only with apache servers.
* NEW API auth_key passthrougth login if method allow to auth_keys
* NEW DB  new table for auth_keys
* NEW DB  new table for users
* NEW API auth_key expire date and time
* NEW API Logged user session handling with remmber me and TTL time in the settings.
* NEW API SQL get results limits for limits are set in settings.php. Default 10000 alarms and 100 notes
* NEW API if access not via AJAX to login.php redirect home page.
* NEW API if direct access to logout.php unset session and redirect home page.
* NEW API Authorisation check for user or auth_key: user and keys DB has field: get,post,put,delete t or f. Other words separate permissions toRead alarms, write alarms and notes, acknowledge alarms, delete alarms

* FIX UI Ids where split into array before sending to AJAX. ajax variable was wrongly parsed to API.
* FIX UI if acnk or delete is performerd, buttons not reset to normal state if returned fail from ajax.
* FIX API model.php SQLite prepare() and bind() function better handling
* FIX API Remove Notes from CSV export reposnce as 1-N or 2 dimentional arrays in CSV does not make sense. Notes can be exported in CSV with separate command via API.

**v2.06/2017-05-27/AJ/Changes:**

* FIX UI local storage html not updating after acknowledge.
* FIX UI Bad HTML rendering after update if culumn switcher is in use.
* NEW UI If no active alarms found after update switch tab to log view.
* NEW UI NOTES supported for every alarm. Write user comments for every alarm or mass select and write many alarms.
* NEW UI Periodic update button. Updates list every 60 seconds.
* NEW API commands related to notes. 'alarmdb-noteget','alarmdb-noteadd'.
* NEW API other commands has new array in JSON called 'notes'.
* NEW SQL Somme new note records for test.		
			
**v2.05/2017-05-25/AJ/Changes:**

* FIX row attribute names fixed in html rendering function.
* FIX Search function in active window not updating view. Wrong row calculation.
* FIX Export all table rows, not just visible rows. Hidden rows by pagination were not exported.
* NEW XML export support
* NEW CSV export support		
		
		