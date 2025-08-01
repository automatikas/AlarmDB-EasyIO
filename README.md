# AlarmDB plugin for EasyIO FG/FS/FW controllers

It is a plugin which extends functionality of your EasyIO FG, FS, FW controllers and will make your controllers to have alarm management system the way modern BMS systems do with no extra cost. So more functions at the same cost! Happy days!

Sedona Kit made for FG,FS,FW controllers lets you push alarms to server(s) directly from your programming app locally or across the TCP/IP network. Same CPT tool is used so no new programming needs to be to learned.

![map](https://automatikas.gitbooks.io/alarmdb-for-easyio/content/assets/network_leaf.PNG)

# Can I used it for my commercial projects?
Yes, project is an open source under MIT license. It is completely free and ment to encourage automation community to be more open and share developments more openly so we all can progress more and have better solutions around the world.

# Project Status
Released in 2017, this project has been around for nearly eight years and has benefited from community use and feedback during that time. However, I now lack the bandwidth to continue maintaining it. Going forward, new features, bug fixes, or updates will only be pursued if there is a commercial contributor willing to sponsor the work. If your company or organization relies on this project and needs it to evolve, please get in touch about paid support. Otherwise, the repository will remain available as‑is. Thank you to everyone who has supported and used AlarmDB‑EasyIO over the years.

[Andrius Jasiulionis](https://www.linkedin.com/in/andriusjasiulionis/)

2025-July-Planet Earth

# Quick guide:
1. Download the latest release | [follow this link](https://github.com/automatikas/AlarmDB-EasyIO/releases/latest)

2. Copy `alarmdb` folder via FTP to FS,FG `/sdcard/cpt/plugins/`

3. Copy `ajsoAlarmDB` folder to your Sedona kits folders. 

4. Install ajsoAlarmDB Sedona kit `1.0.45.25` for really older firmware of FG,FS,FW controllers. Use Sedona kit `2.0.0.25` for new firmware with Sedona v2.0. CHeck CPT kit managment to find Sedona version.

OPTIONAL: If you need demo data copy over `/demo data/alarm.db` database to `/public/sdcard/cpt/plugins/alarmdb` **IMPORTANT!!!** this will overwrite your database

MIGRATION: All versions below `v2.9.0` used easyio.db database file. From version `v2.9.0` own plugin database is introduced. If you want to import old alarms after migration simply copy `easyio.db` database file from `/public/sdcard/` to `/public/sdcard/cpt/plugins/alarmdb` and rename it to `alarm.db` **IMPORTANT!!!** allways make backups.

# Manual: 
Instructions | [follow this link](https://automatikas.gitbooks.io/alarmdb-for-easyio/content/)

# Source on GitHub
For EasyIO devices | [follow this link](https://github.com/automatikas/AlarmDB-EasyIO)

# Project contributors
Andrius Jasiulionis | https://github.com/automatikas

Vincent Wang | https://github.com/linsong
