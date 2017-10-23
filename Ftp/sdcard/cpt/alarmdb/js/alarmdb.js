var AlarmDbSettings = {
		title: "AlarmDB API UI core",
		href: "https://github.com/automatikas/AlarmDB/releases/tag/",
		version: "v2.07.3",
		author: "Andrius Jasiulionis <automatikas@gmail.com>",
		copyright: "Copyright (c) 2017, Andrius Jasiulionis",
		license: "MIT",
		api: {
			location: "api/index.php",
			auth: {
				login: {
					href: "api/login.php",
					headers: {
					}
				},
				logout: {
					href: "api/logout.php",
				}
			},
			headers: {
				auth_key: ""
			}
		},
		ui: {
			loadContainer: {
				divId: "#myAlarmContainer",
			},
			search: {
				enabled: true,
				title: "Search"
			},
			controlBar: {
				enabled: true,
				manualUpdate: {
					enabled: true,
					title: "Refresh alarm list from DB"
				},
				periodicUpdate: {
					enabled: true,
					title: "Refresh alarm list periodically"
				},
				pagination: {
					enabled: true,
					title: "Pagination Switch: split or show all",
				},
				tableColumns: {
					enabled: true,
					title: "Column switcher",
					columns: {
						priority: {
							title: "Priority"
						},
						date: {
							title: "Dates"
						},
						value: {
							title: "Values"
						},
						text: {
							title: "Alarm message"
						},
						tags: {
							title: "Tags"
						},
						action: {
							title: "Actions"
						}
					}
				},
				export: {
					enabled: true,
					title: "Export data",
					formats: [{
						format: "csv",
						enabled: true,
						title: "CSV"
						},{
						format: "xml",
						enabled: true,
						title: "XML"
						},{
						format: "json",
						enabled: true,
						title: "JSON"
					}]
				},
				usermenu: {
					enabled: true,
					title: "User menu",
					links: {
						myAcount: {
						enabled: true,
						title: "My account",
						href: "#"
						},
						apiSettings: {
						enabled: true,
						title: "API settings",
						href: "#"
						}
					}
				}
			},
			table: {
				priorityRanges: {
					danger: {
						min: 0,
						max: 50
					},
					warning: {
						min: 51,
						max: 100
					},
					info: {
						min: 101,
						max: 150
					},
					primary: {
						min: 151,
						max: 200
					},
					success: {
						min: 201,
						max: 250
					}
				}
			},
			tabs: {
				active: { 
					title: "Active alarms",
				},
				log: { 
					title: "Alarm log",
				}
			},
			logo: {
				img: "img/logo.png",
				alt: "AlarmDB"
			},
			user: {
				name: "User"
			},
			footer: {
				totals: {
					title: "DB total:"
				}
			}
		},
		internals: {
			display_rows: 0,
			display_log_rows: 0,
			display_active_rows: 0,
			active_page: 0,
			page_size: 0,
			log_content: "",
			active_content: "",
			search_active: false
		}
};
 
$(AlarmDbSettings.ui.loadContainer.divId).ready(function () {
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#controls_refresh", function(e) {
		$(this).blur();
		e.preventDefault();
		getDbAlarms();
    });
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#controls_timer",(function(){
		var interId = null;
		return function(e) {
			if (interId) {
				$(this).removeClass("active");
				$(this).blur();
				clearInterval(interId);
				interId = null;
			} else {
				$(this).addClass("active");
				$(this).blur();
				interId = setInterval(function() {
					getDbAlarms();
				}, 60000);        
			}
		};
	}()));
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#controls_paginationSwitch", function(e) {
		e.preventDefault();
		$(this).blur();
		$(this).toggleClass("active");
		if ($(this).hasClass("active")) {
			AlarmDbSettings.internals.page_size = $(".pagination-detail").find(".page-size").text();
			$(".table-pagination").show();
		} else {
			AlarmDbSettings.internals.page_size = "All";
			$(".table-pagination").hide();
		}
		if ($("#alarm_log_tab").hasClass("active")) {
			updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
		if ($("#active_alarm_tab").hasClass("active")) {
			updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
    });
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#controls_search", function(e) {
		$(this).blur();
		e.preventDefault();
		$(this).toggleClass("active");
		$('#search_tab').css('display', $('#search_tab').css('display') == 'none' ? 'block' : 'none');
		$('#search').css('display', $('#search').css('display') == 'none' ? 'block' : 'none');
    });
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#control_export li a", function(e) {
		e.preventDefault();
		export_file($(this).attr("type"));
    });
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#control_columns li", function(e) {
		e.preventDefault();
		$(this).find(".glyphicon").toggleClass("glyphicon-check").toggleClass("glyphicon-unchecked");
		var column = $(this).attr("column_name");
		$("."+column).toggleClass(column).toggleClass(column+" hidden");
    });
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#active_alarm_tab", function(e) {
		e.preventDefault();
		if(AlarmDbSettings.internals.search_active === true) {
			search_table("");
		} 
		pushTableAlert("hide", "");
		if (AlarmDbSettings.internals.display_active_rows == 0) {
			pushTableAlert("info", "No active alarms found...");
		}
		$("#alarm_list").html("");
		$("#alarm_list").append(AlarmDbSettings.internals.active_content);
		updateTableColumns();
		AlarmDbSettings.internals.active_page = 1;
		AlarmDbSettings.internals.display_rows = AlarmDbSettings.internals.display_active_rows;
		updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
		updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
    });
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#alarm_log_tab", function(e) {
		e.preventDefault();
		if(AlarmDbSettings.internals.search_active === true) {
			search_table("");
		}
		pushTableAlert("hide", "");
		$("#alarm_list").html( "" );
		$("#alarm_list").append(AlarmDbSettings.internals.log_content);
		updateTableColumns();
		AlarmDbSettings.internals.active_page = 1;
		AlarmDbSettings.internals.display_rows = AlarmDbSettings.internals.display_log_rows;
		updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
		updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
    });
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#alarm_list .controls", function(e) {
		e.preventDefault();
		pushTableAlert("hide","");
		$(".select_all_f").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#alarm_list .alarm_b_ackn", function (e) {
		e.preventDefault();
		$(this).blur();
		var trig_row = $(this).parent().parent().parent();
		var ids = "";
		$("#alarm_list").find(".select").each(function() {
			if ($(this).attr("ackn") == "false" || $(this).attr("ackn") == "null") {
				if (ids == "") {
					ids += $(this).attr("id");
				}else {
					ids += ","+$(this).attr("id");
				}
				$(this).find(".glyphicon-ok-sign").toggleClass("glyphicon-ok-sign").toggleClass("glyphicon-refresh glyphicon-refresh-animate");
			}
		});
		if (ids == "") {
			ids = trig_row.attr("id");
			trig_row.find(".glyphicon-ok-sign").toggleClass("glyphicon-ok-sign").toggleClass("glyphicon-refresh glyphicon-refresh-animate");
		}
		acknAlarms(ids,AlarmDbSettings.ui.user.name);
		$("#alarm_list").find(".glyphicon-refresh").toggleClass("glyphicon-ok-sign").toggleClass("glyphicon-refresh glyphicon-refresh-animate");
		$(".select_all_f").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#alarm_list .alarm_b_delete", function (e) {
		e.preventDefault();
		$(this).blur();
		var trig_row = $(this).parent().parent().parent();
		var ids = "";
		$("#alarm_list").find(".select").each(function() {
			if (ids == "") {
				ids += $(this).attr("id");
			}else {
				ids += ","+$(this).attr("id");
			}
			$(this).find(".glyphicon-trash").toggleClass("glyphicon-trash").toggleClass("glyphicon-refresh glyphicon-refresh-animate");
		});
		if (ids == "") {
			ids = trig_row.attr("id");
			$(this).find(".glyphicon-trash").toggleClass("glyphicon-trash").toggleClass("glyphicon-refresh glyphicon-refresh-animate");
		}
		delAlarms(ids);
		$("#alarm_list").find(".glyphicon-refresh").toggleClass("glyphicon-trash").toggleClass("glyphicon-refresh glyphicon-refresh-animate");
		$(".select_all_f").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#alarm_list .alarm_b_notes", function (e) {
		e.preventDefault();
		$(this).blur();
		$(this).parent().parent().parent().find(".notes-panel").toggleClass("hide");
		if($(this).parent().parent().parent().find(".notes-panel").is(":visible")) {
			$(this).parent().parent().parent().find(".notes").html("");
			var id = $(this).parent().parent().parent().attr("id");
			getNotes(id);
		}
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#btn-notes", function (e) {
		e.preventDefault();
		$(this).blur();
		var ids = "";
		$("#alarm_list").find(".select").each(function() {
			if (ids == "") {
				ids += $(this).attr("id");
			}else {
				ids += ","+$(this).attr("id");
			}
		});
		if (ids == "") {
			ids = $(this).parent().parent().parent().parent().parent().parent().attr("id");
		}
		var text = $(this).parent().parent().find("#btn-input").val();
		if(text !== "") {
			addNotes(ids,AlarmDbSettings.ui.user.name,text);
			$(this).parent().parent().find("#btn-input").val("");
		}
		$("#alarm_list").find(".select").each(function() {
			$(this).removeClass("active select");
			$(this).find(".glyphicon-check").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
		});
		$(".select_all_f").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).keydown(function(e) {
		if(e.which == 27) {
			$("#alarm_list").find(".notes-panel").addClass("hide");
		}
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#alarm_list .note-close", function (e) {
		$("#alarm_list").find(".notes-panel").addClass("hide");
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#alarm_list .select_f", function (e) {
		e.preventDefault();
		if ($(this).hasClass("glyphicon-unchecked")) {
			$(this).removeClass("glyphicon-unchecked")
			$(this).addClass("glyphicon-check")
		} else {
			$(this).addClass("glyphicon-unchecked")
			$(this).removeClass("glyphicon-check")
		}
		if (!$(this).parent().parent().hasClass("active select")) {
			$(this).parent().parent().addClass("active select")
		} else {
			$(this).parent().parent().removeClass("active select")
		}
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#alarm_table .select_all_f", function (e) {
		e.preventDefault();
		$(this).toggleClass("glyphicon-unchecked").toggleClass("glyphicon-check");
		if ($(this).hasClass("glyphicon-check")) {
			$("#alarm_list tr").removeClass("active select");
			$("#alarm_list tr:visible").addClass("active select");
			$("#alarm_list tr:visible").find(".select_f").removeClass("glyphicon-unchecked").addClass("glyphicon-check");
		}
		if ($(this).hasClass("glyphicon-unchecked")) {
			$("#alarm_list tr").removeClass("active select");
			$("#alarm_list").find(".select_f").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
		}
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", ".link", function () {
		AlarmDbSettings.internals.page_size = $(this).find("a").text();
		$(".pagination-detail").find(".active").removeClass("active");
		$(this).addClass("active");
		$(".pagination-detail").find(".page-size").text(AlarmDbSettings.internals.page_size);
		AlarmDbSettings.internals.active_page = 1;
		updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
		if ($("#alarm_log_tab").hasClass("active")) {
			updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
		if ($("#active_alarm_tab").hasClass("active")) {
			updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#pagination-list .page-number", function () {
		AlarmDbSettings.internals.active_page = parseInt($(this).find("a").text());
		updatePaginationLinks(AlarmDbSettings.internals.active_page);
		updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		if ($("#alarm_log_tab").hasClass("active")) {
			updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
		if ($("#active_alarm_tab").hasClass("active")) {
			updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#pagination-list .page-next-active", function () {
		prev_page = parseInt($(".pagination").find(".active a").text());
		last_page = parseInt($(".pagination").find(".page-number a:last").text());
		if(AlarmDbSettings.internals.active_page < last_page){
			AlarmDbSettings.internals.active_page = prev_page + 1;
		} else {
			AlarmDbSettings.internals.active_page = prev_page;
		}
		updatePaginationLinks(AlarmDbSettings.internals.active_page);
		updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		if ($("#alarm_log_tab").hasClass("active")) {
			updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
		if ($("#active_alarm_tab").hasClass("active")) {
			updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#pagination-list .page-pre-active", function () {
		prev_page = parseInt($(".pagination").find(".active a").text());
		first_page = parseInt($(".pagination").find(".page-number a:first").text());
		if(AlarmDbSettings.internals.active_page > first_page){
			AlarmDbSettings.internals.active_page = prev_page - 1;
		} else {
			AlarmDbSettings.internals.active_page = prev_page;
		}
		AlarmDbSettings.internals.active_page = prev_page - 1;
		updatePaginationLinks(AlarmDbSettings.internals.active_page);
		updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		if ($("#alarm_log_tab").hasClass("active")) {
			updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
		if ($("#active_alarm_tab").hasClass("active")) {
			updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#alarm_list .tags", function () {
		var tag_x = $(this).text();
		$("#search").val( function( index, val ) {
			if(val==""){
				return tag_x;
			} else {
				return val+" "+tag_x;
			}
		});
	});
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#search_btn", function () {
		$(this).blur();
		$(this).find(".glyphicon").toggleClass("glyphicon-search").toggleClass("glyphicon-remove");
		search_table($("#search").val());
		updateTableColumns();
    });
	
	$(AlarmDbSettings.ui.loadContainer.divId).on("click", "#download_link", function () {
		pushTableAlert("hide", "");
    });
});

function getDbAlarms() {
	refreshButtonLoadingStyle(true);
	var content = "";
	var alarmAPI = AlarmDbSettings.api.location;
	var apiComands = {"www-command": "alarmdb-uiall"};
	var headers = $.extend( true, apiComands, AlarmDbSettings.api.headers);
	$.get( alarmAPI, headers)
    .done(function(data) {
		var r1=0;
		if (typeof(data.active_alarms) != "undefined") {
			AlarmDbSettings.internals.active_content = "";
			$.each( data.active_alarms, function( i, alarm ) {
				var alarm = data.active_alarms[r1];
				AlarmDbSettings.internals.active_content += alarmHtmlRender(alarm);
				r1++;
			});
			AlarmDbSettings.internals.display_active_rows = r1;
			AlarmDbSettings.internals.active_page = 1;
			if (AlarmDbSettings.internals.display_active_rows > 0) {
				alarmIconRingStyle(true);
			}
			if(AlarmDbSettings.internals.search_active === true) {
				if ($("#active_alarm_tab").hasClass("active")) {
					$(".nav-tabs").find('li').removeClass("active");
					$('#active_alarm_tab').addClass("active");
					$("#alarm_list").html( "" );
					$("#alarm_list").append(AlarmDbSettings.internals.active_content);
					updateTableColumns();
					AlarmDbSettings.internals.display_rows = AlarmDbSettings.internals.display_active_rows;
					updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
					updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
					updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
				}
			} else {
				$(".nav-tabs").find('li').removeClass("active");
				$('#active_alarm_tab').addClass("active");
				$("#alarm_list").html( "" );
				$("#alarm_list").append(AlarmDbSettings.internals.active_content);
				pushTableAlert("hide", "");
				updateTableColumns();
				AlarmDbSettings.internals.display_rows = AlarmDbSettings.internals.display_active_rows;
				updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
				updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
				updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
			}
		} else {
			AlarmDbSettings.internals.active_content = "";
			$("#active_alarm_tab").removeClass("active");
			$("#alarm_log_tab").addClass("active");
		}
		if (typeof(data.alarms) != "undefined") {
			r1=0;
			AlarmDbSettings.internals.log_content = "";
			$.each( data.alarms, function( i, alarm ) {
				var alarm = data.alarms[r1];
				AlarmDbSettings.internals.log_content += alarmHtmlRender(alarm);
				r1++;
			});
			AlarmDbSettings.internals.display_log_rows = r1;
			AlarmDbSettings.internals.active_page = 1;
			if ($("#alarm_log_tab").hasClass("active")) {
				$("#alarm_list").html( "" );
				$("#alarm_list").append(AlarmDbSettings.internals.log_content);
				pushTableAlert("hide", "");
				updateTableColumns();
				AlarmDbSettings.internals.display_rows = AlarmDbSettings.internals.display_log_rows;
				updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
				updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
				updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
			}
		} else {
			AlarmDbSettings.internals.log_content = "";
			AlarmDbSettings.internals.active_content = "";
			AlarmDbSettings.internals.display_log_rows = 0;
			AlarmDbSettings.internals.display_active_rows = 0;
			AlarmDbSettings.internals.display_rows = 0;
			updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
			updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
		}
		if(AlarmDbSettings.internals.search_active === true) {
			search_table($("#search").val());
		}
		if (data.warning) {
			if (data.ids) {
				pushTableAlert("warning", data.warning+" IDs:"+data.ids);
			} else {
				pushTableAlert("warning", data.warning);
			}
		}
		if (data.error) {
			pushTableAlert("danger", data.error);
		}
		if (data.info) {
			pushTableAlert("info", data.info);
		}
		if (typeof(data.totals) != "undefined") {
			updatePaginationTotal(data.totals.active,data.totals.ackn,data.totals.notes);	
		}
		refreshButtonLoadingStyle(false);
		return true;
    })
	.fail(function(data, textStatus, xhr) {
		if (data.status == "0") {
			pushTableAlert("danger", textStatus+": Could not establish connection to API");
		} else {
			if (data.status == "401") {
				pushTableAlert("danger", textStatus+": "+data.status+"-"+xhr);
				validateLogin(data.login);
			} else {
				pushTableAlert("danger", textStatus+": "+data.status+"-"+xhr);
			}
		}
		refreshButtonLoadingStyle(false);
		return false;
	});
}

function acknAlarms(ids,user){
	refreshButtonLoadingStyle(true);
	var alarmAPI = AlarmDbSettings.api.location;
	var apiComands = {
			"www-command": "alarmdb-ackn",
			"ackn_user": user,
			"id": ids
		};
	var headers = $.extend( true, apiComands, AlarmDbSettings.api.headers);
	$.post(alarmAPI, headers)
		.done(function(data) {
				if (typeof(data.alarms) != "undefined") {
					var $log_content = $("<div />",{html:AlarmDbSettings.internals.log_content});
					var $active_content = $("<div />",{html:AlarmDbSettings.internals.active_content});
					$.each( data.alarms, function( i, alarm ) {
						if ($("#active_alarm_tab").hasClass("active")) {
							$("#alarm_list").find("#"+alarm.id).remove();
							AlarmDbSettings.internals.display_rows -= 1;
							AlarmDbSettings.internals.active_content = $("#alarm_list").html();
						}
						AlarmDbSettings.internals.display_active_rows -= 1;
						row = $("#alarm_list").find("#"+alarm.id);
						updateRowAckn(row,alarm);
						row = $log_content.find("#"+alarm.id);
						updateRowAckn(row,alarm);
						AlarmDbSettings.internals.log_content = $log_content.html();
						row = $active_content.find("#"+alarm.id);
						updateRowAckn(row,alarm);
						AlarmDbSettings.internals.active_content = $active_content.html();
						$("#alarm_list").find(".select").each(function() {
							$(this).removeClass("active select");
							$(this).find(".glyphicon-check").removeClass("glyphicon-check").addClass("glyphicon-unchecked");
						});
					});
				}
				if (AlarmDbSettings.internals.display_active_rows == 0) {
					AlarmDbSettings.internals.active_content = "";
					if ($("#active_alarm_tab").hasClass("active")) {
						pushTableAlert("info", "No active alarms found...");
					}
					alarmIconRingStyle(false);
				}
				updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
				updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
				if ($("#alarm_log_tab").hasClass("active")) {
					updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
				}
				if ($("#active_alarm_tab").hasClass("active")) {
					updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
				}
			if (data.warning) {
				if (data.ids) {
					pushTableAlert("warning", data.warning+" IDs:"+data.ids);
				} else {
					pushTableAlert("warning", data.warning);
				}
			}
			if (data.error) {
				pushTableAlert("danger", data.error);
			}
			if (data.info) {
				pushTableAlert("info", data.info);
			}
			if (typeof(data.totals) != "undefined") {
				updatePaginationTotal(data.totals.active,data.totals.ackn,data.totals.notes);	
			}
			refreshButtonLoadingStyle(false);
			return true;
		})
		.fail(function(data, textStatus, xhr) {
			if (data.status == "401") {
				validateLogin(data.login);
			}
			pushTableAlert("danger", textStatus+": "+data.status+"-"+xhr);
			refreshButtonLoadingStyle(false);
			return false;
		});
}

function delAlarms(ids){
	if(!confirmAlert("Are you sure you want to delete this alarm?")) {
		return;
	}
	refreshButtonLoadingStyle(true);
	var ids_array = ids.split(',');
	var alarmAPI = AlarmDbSettings.api.location;
	var apiComands = {
		"www-command": "alarmdb-delete",
		"id": ids
	};
	var headers = $.extend( true, apiComands, AlarmDbSettings.api.headers);
	$.post(alarmAPI, headers)
		.done(function( data ) {
			if (data.success) {
				$.each( ids_array, function( i, id ) {
					$("#alarm_list").find("#"+id).remove();
					AlarmDbSettings.internals.display_log_rows -= 1;
					AlarmDbSettings.internals.display_rows -= 1;
					AlarmDbSettings.internals.log_content = $("#alarm_list").html();
				});
				updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
				updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
				if ($("#alarm_log_tab").hasClass("active")) {
					updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
				}
				if ($("#active_alarm_tab").hasClass("active")) {
					updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
				}
				$("#alarm_list").find(".glyphicon-refresh").toggleClass("glyphicon-trash").toggleClass("glyphicon-refresh glyphicon-refresh-animate");
			}
			if (data.warning) {
				if (data.ids) {
					ids_array = ids_array.filter( function( el ) {
					 return data.ids.indexOf( el ) < 0;
					} );
					$.each( ids_array, function( i, id ) {
						$("#alarm_list").find("#"+id).remove();
						AlarmDbSettings.internals.display_log_rows -= 1;
						AlarmDbSettings.internals.display_rows -= 1;
						AlarmDbSettings.internals.log_content = $("#alarm_list").html();
					});
					updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
					updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
					if ($("#alarm_log_tab").hasClass("active")) {
						updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
					}
					if ($("#active_alarm_tab").hasClass("active")) {
						updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
					}
					pushTableAlert("warning", data.warning+" IDs:"+data.ids);
				} else {
					pushTableAlert("warning", data.warning);
				}
			}
			if (data.error) {
				pushTableAlert("danger", data.error);
			}
			if (data.info) {
				pushTableAlert("info", data.info);
			}
			if (typeof(data.totals) != "undefined") {
				updatePaginationTotal(data.totals.active,data.totals.ackn,data.totals.notes);	
			}
			refreshButtonLoadingStyle(false);
			return true;
		})
		.fail(function(data, textStatus, xhr) {
			if (data.status == "401") {
				validateLogin(data.login);
			}
			pushTableAlert("danger", textStatus+": "+data.status+"-"+xhr);
			refreshButtonLoadingStyle(false);
			return false;
		});
}

function getNotes(id){
	refreshButtonLoadingStyle(true);
	var notehtml = "";
	var alarmAPI = AlarmDbSettings.api.location;
	var apiComands = {
		"www-command": "alarmdb-noteget",
		"id": id
	};
	var headers = $.extend( true, apiComands, AlarmDbSettings.api.headers);
	$.get(alarmAPI, headers)
	.done(function(data) {
		if (typeof(data.notes) != "undefined") {
			$.each( data.notes, function( i, alarm ) {
				if(i === id) {
					$.each( alarm, function( i, note ) {
						notehtml += noteHtmlRender(note);
					})
					$("#alarm_list").find("#"+i).find(".notes-panel ul").append(notehtml);
				}
			})	
		}
		if (data.warning) {
			if (data.ids) {
				$("#alarm_list").find("#"+id).find(".notes-panel ul").append(`<li><pclass="bg-warning">`+data.warning+` IDs:`+data.ids+`</p></li>`);
			} else {
				$("#alarm_list").find("#"+id).find(".notes-panel ul").append(`<li><pclass="bg-warning">`+data.warning);
			}
		}
		if (data.error) {
			$("#alarm_list").find("#"+id).find(".notes-panel ul").append(`<li><pclass="bg-danger">`+data.error+`</p></li>`);
		}
		if (data.info) {
		}
		refreshButtonLoadingStyle(false);
		return true;
	})
	.fail(function(data, textStatus, xhr) {
		if (data.status == "401") {
			validateLogin(data.login);
		}
		pushTableAlert("danger", textStatus+": "+data.status+"-"+xhr);
		refreshButtonLoadingStyle(false);
		return false;
	})
}

function addNotes(id,user,text) {
	refreshButtonLoadingStyle(true);
	var notehtml = "";
	var alarmAPI = AlarmDbSettings.api.location;
	var apiComands = {
		"www-command": "alarmdb-noteadd",
		"id": id,
		"ackn_user": user,
		"text": text
	};
	var headers = $.extend( true, apiComands, AlarmDbSettings.api.headers);
	$.post(alarmAPI, headers)
	.done(function(data) {
		if (typeof(data.notes) != "undefined") {
			$.each( data.notes, function( i, alarm ) {
				notehtml = "";
				$.each( alarm, function( i, note ) {
					notehtml += noteHtmlRender(note);
				})
				$("#alarm_list").find("#"+i).find(".notes-panel ul").html("");
				$("#alarm_list").find("#"+i).find(".notes-panel ul").append(notehtml);
				$("#alarm_list").find("#"+i).find(".glyphicon-comment").removeClass("disabled_icon").addClass("active_icon");
				var $active_content = $("<div />",{html:AlarmDbSettings.internals.active_content});
				$active_content.find("#"+i).find(".glyphicon-comment").removeClass("disabled_icon").addClass("active_icon");
				AlarmDbSettings.internals.active_content = $active_content.html();
				var $log_content = $("<div />",{html:AlarmDbSettings.internals.log_content});
				$log_content.find("#"+i).find(".glyphicon-comment").removeClass("disabled_icon").addClass("active_icon");
				AlarmDbSettings.internals.log_content = $log_content.html();
			})	
		}
		if (data.warning) {
			if (data.ids) {
				$("#alarm_list").find("#"+id).find(".notes-panel ul").append(`<li><pclass="bg-warning">`+data.warning+` IDs:`+data.ids+`</p></li>`);
			} else {
				$("#alarm_list").find("#"+id).find(".notes-panel ul").append(`<li><pclass="bg-warning">`+data.warning);
			}
		}
		if (data.error) {
			$("#alarm_list").find("#"+id).find(".notes-panel ul").append(`<li><pclass="bg-danger">"+data.error+"</p></li>`);
		}
		if (data.info) {
		}
		if (typeof(data.totals) != "undefined") {
			updatePaginationTotal(data.totals.active,data.totals.ackn,data.totals.notes);	
		}
		refreshButtonLoadingStyle(false);
		return true;
	})
	.fail(function(data, textStatus, xhr) {
		if (data.status == "401") {
			validateLogin(data.login);
		}
		pushTableAlert("danger", textStatus+": "+data.status+"-"+xhr);
		refreshButtonLoadingStyle(false);
		return false;
	})
}

function updatePagination(display_rows, page_size) {
	var page_limit = 5;
	if (page_size == "All") {
		$("#pagination-list").html( "" );
		return true;
	} else {
		page_size = parseInt(page_size);
	}
	pagination_content = "";
	p_numbers = 1;
	t_pages = display_rows / page_size;
	f_pages = Math.floor(t_pages);
	if (t_pages - f_pages > 0) {
		f_pages += 1;
	}
	if (display_rows > page_size) {
		pagination_content += `<li class="page-pre-disabled disabled"><a href="#">‹</a></li>`;
		pagination_content += `<li class="page-first-separator disabled hide"><a href="#">...</a></li>`;
		for (i = 0; i < f_pages; i++) {
			if (p_numbers == 1) {
			pagination_content += `<li class="page-number active"><a href="#">`+p_numbers+`</a></li>`;
			} else {
				if (i < display_rows) {
					if (p_numbers <= page_limit) {
						pagination_content += `<li class="page-number"><a href="#">`+p_numbers+`</a></li>`;
					} else {
						pagination_content += `<li class="page-number hide"><a href="#">`+p_numbers+`</a></li>`;
					}
				}
			}
			p_numbers++;
		}
		p_numbers--;
		if (p_numbers > page_limit) {
			pagination_content += `<li class="page-last-separator disabled"><a href="#">...</a></li>`;
		} else {
			pagination_content += `<li class="page-last-separator disabled hide"><a href="#">...</a></li>`;
		}			
		pagination_content += `<li class="page-next-active"><a href="#">›</a></li>`;
		$("#pagination-list").parent().removeClass("hide");
		} else {
			$("#pagination-list").parent().addClass("hide");
		}
	$("#pagination-list").html( "" );
	$("#pagination-list").append(pagination_content);
	return true;
}

function updatePaginationLinks(active_page_id) {
		var last_page = parseInt($(".pagination").find(".page-number a:last").text());
		var first_page = parseInt($(".pagination").find(".page-number a:first").text());
		var page_limit = 5;
		if(active_page_id > last_page || active_page_id < first_page) {
			return false;
		}
		if(active_page_id > first_page) {
			$(".pagination").find(".page-pre-disabled").removeClass("page-pre-disabled disabled").addClass("page-pre-active");
		} else {
			$(".pagination").find(".page-pre-active").removeClass("page-pre-active").addClass("page-pre-disabled disabled");
		}
		if (active_page_id === last_page) {
			$(".pagination").find(".page-next-active").removeClass("page-next-active").addClass("page-next-disabled disabled");
		} else {
			$(".pagination").find(".page-next-disabled").removeClass("page-next-disabled disabled").addClass("page-next-active");
		}
		if(active_page_id > page_limit) { 
			$(".pagination").find(".page-first-separator").removeClass("hide");
		} else {
			if(active_page_id === first_page) {
				$(".pagination").find(".page-first-separator").addClass("hide");
			}
		}
		if(active_page_id === last_page) { 
			$(".pagination").find(".page-last-separator").addClass("hide");
		} else {
			if(active_page_id < last_page - 4) {
				$(".pagination").find(".page-last-separator").removeClass("hide");
			}
		}
		$(".pagination").find(".active").removeClass("active");
		$(".pagination").find(".page-number").each(function() {
			var id = parseInt($(this).find("a").text());
			if (id === active_page_id) {
				$(this).addClass("active");
				$(this).removeClass("hide");
			}
			if(id < active_page_id - 4) {
				$(this).addClass("hide");
			}
			if(id > active_page_id + 4) {
				$(this).addClass("hide");
			}
		});
		return true;
}

function updatePaginationInfo(display_rows, page_size, active_page) {
	display_rows = parseInt(display_rows);
	active_page = parseInt(active_page);
	if (page_size == "All") {
			display_from = "";
			display_to = "All";
		} else {
			page_size = parseInt(page_size);
			display_from = active_page * page_size;
			display_from = display_from - page_size + 1;
			display_from = display_from + "-"
			display_to = active_page * page_size;
			if (display_to > display_rows) {
				display_to = display_rows;
			}	
		}
		info_text = "Showing " + display_from + display_to + " of " + display_rows + " records";
		if (display_rows == 0) {
				info_text = "";
		}
		$(".pagination-info span").text(info_text);
		return true;
}

function updateLogTableRowList(page_size, active_page) {
	$(".searchable tr").hide();
	if (page_size == "All") {
		$(".searchable tr").show();
	} else {
		page_size = parseInt(page_size);
		display_to = active_page * page_size;
		display_from = display_to - page_size + 1;
		if (display_to > AlarmDbSettings.internals.display_rows) {
			display_to = AlarmDbSettings.internals.display_rows;
		}
		display_from -= 2;
		$(".searchable tr").filter(function(index) {
			return index > display_from && index < display_to;
		}).show();
	}
	return true;
}

function updateActiveTableRowList(page_size, active_page) {
	$(".searchable tr").hide();
	if (page_size == "All") {
		$(".searchable tr[ackn!="+true+"]").show();
	} else {
		AlarmDbSettings.internals.display_rows = AlarmDbSettings.internals.display_active_rows;
		page_size = parseInt(page_size);
		display_to = active_page * page_size;
		display_from = display_to - page_size + 1;
		if (display_to > AlarmDbSettings.internals.display_rows) {
			display_to = AlarmDbSettings.internals.display_rows;
		}
		display_from -= 2;
		$(".searchable tr[ackn!="+true+"]").filter(function(index) {
			return index > display_from && index < display_to;
		}).show();
	}
	return true;
}

function updateRowAckn(row,alarm) {
	row.find(".glyphicon-refresh").toggleClass("glyphicon-ok-sign").toggleClass("glyphicon-refresh glyphicon-refresh-animate");
	row.attr("ackn",alarm.ackn);
	row.attr("ackn_user",alarm.ackn_user);
	row.attr("adate",alarm.adate);
	if (row.find(".ackn_user").length == 0) {
		row.find(".alarm_text").append(`<p class="ackn_user"><small><i>`+alarm.ackn_user+`</small></i></p>`);
	} else {
		row.find(".ackn_user").html(`<small><i>`+alarm.ackn_user+`</small></i>`);
	}
	if (row.find(".adate").length == 0) {
		row.find(".dates").append(`<p class="adate"><span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span><small><i>`+alarm.adate+`</small></i></p>`);
	} else {
		row.find(".adate").html(`<span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span><small><i>`+alarm.adate+`</small></i>`);
	}
	row.find(".alarm_b_ackn").removeClass("alarm_b_ackn").addClass("alarm_b_ackn_disabled disabled");
	row.find(".alarm_b_delete_disabled").removeClass("alarm_b_delete_disabled disabled").addClass("alarm_b_delete");
	return row;
}

function updateTableColumns() {
	if ($("#wcol1").hasClass("glyphicon-unchecked")) {
		$(".col1").addClass("hidden");
	} else {
		$(".col1").removeClass("hidden");
	}
	if ($("#wcol2").hasClass("glyphicon-unchecked")) {
		$(".col2").addClass("hidden");
	} else {
		$(".col2").removeClass("hidden");
	}
	if ($("#wcol3").hasClass("glyphicon-unchecked")) {
		$(".col3").addClass("hidden");
	} else {
		$(".col3").removeClass("hidden");
	}
	if ($("#wcol4").hasClass("glyphicon-unchecked")) {
		$(".col4").addClass("hidden");
	} else {
		$(".col4").removeClass("hidden");
	}
	if ($("#wcol5").hasClass("glyphicon-unchecked")) {
		$(".col5").addClass("hidden");
	} else {
		$(".col5").removeClass("hidden");
	}
	if ($("#wcol6").hasClass("glyphicon-unchecked")) {
		$(".col6").addClass("hidden");
	} else {
		$(".col6").removeClass("hidden");
	}
	return true;
}

function search_table(searchTerm) {
	if(AlarmDbSettings.internals.search_active !== true) {
		AlarmDbSettings.internals.search_active = true;
		b_display_rows = AlarmDbSettings.internals.display_rows;
		b_display_log_rows = AlarmDbSettings.internals.display_log_rows;
		b_display_active_rows = AlarmDbSettings.internals.display_active_rows;
	}
	if($("#search_btn").find(".glyphicon").hasClass("glyphicon-search") || searchTerm == "") {
		searchTerm = "";
		$("#search").val("");
		$("#search_btn").find(".glyphicon").removeClass("glyphicon-remove").addClass("glyphicon-search");
		pushTableAlert("hide", "");
		AlarmDbSettings.internals.search_active = false;
		if ($("#active_alarm_tab").hasClass("active")) {
			$("#alarm_list").html("");
			$("#alarm_list").html(AlarmDbSettings.internals.active_content);
			AlarmDbSettings.internals.display_active_rows = b_display_active_rows;
			AlarmDbSettings.internals.display_rows = AlarmDbSettings.internals.display_active_rows;
			updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
			updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
			updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page)
		}
		if ($("#alarm_log_tab").hasClass("active")) {
			$("#alarm_list").html("");
			$("#alarm_list").html(AlarmDbSettings.internals.log_content);
			AlarmDbSettings.internals.display_log_rows = b_display_log_rows;
			AlarmDbSettings.internals.display_rows = AlarmDbSettings.internals.display_log_rows;
			updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
			updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
			updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
		return;
	}
	var listItem = $('.searchable').children('tr');
	var searchSplit = searchTerm.replace(/ /g, "'):contains('");
	AlarmDbSettings.internals.active_page = 1;
	$.extend($.expr[':'], {'contains': function(elem, i, match, array){
		return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
		}
	});
	if ($("#alarm_log_tab").hasClass("active")) {
		AlarmDbSettings.internals.display_log_rows = 0;
		$(".searchable tr").not(":contains('" + searchSplit + "')").each(function(e){
			$(this).remove();
		});
		$(".searchable tr:contains('" + searchSplit + "')").each(function(e){
			$(this).show();
			AlarmDbSettings.internals.display_log_rows += 1;
		});
	}
	if ($("#active_alarm_tab").hasClass("active")) {
		AlarmDbSettings.internals.display_active_rows = 0;
		$(".searchable tr[ackn!='true']").not(":contains('" + searchSplit + "')").each(function(e){
			$(this).remove();
		});
		$(".searchable tr[ackn!='true']:contains('" + searchSplit + "')").each(function(e){
			$(this).show();
			AlarmDbSettings.internals.display_active_rows += 1;
		});
	}
	var jobCount = $('.searchable tr[style="display: table-row;"]').length;
	AlarmDbSettings.internals.display_rows = jobCount;
	if(jobCount == "0") {
		pushTableAlert("warning", "No records are matching search keywords...");
		if ($("#active_alarm_tab").hasClass("active")) {
			$("#alarm_list").html("");
			$("#alarm_list").html(AlarmDbSettings.internals.active_content);
			AlarmDbSettings.internals.display_active_rows = b_display_active_rows;
			AlarmDbSettings.internals.display_rows = AlarmDbSettings.internals.display_active_rows;
			updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
			updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
			updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page)
		}
		if ($("#alarm_log_tab").hasClass("active")) {
			$("#alarm_list").html("");
			$("#alarm_list").html(AlarmDbSettings.internals.log_content);
			AlarmDbSettings.internals.display_log_rows = b_display_log_rows;
			AlarmDbSettings.internals.display_rows = AlarmDbSettings.internals.display_log_rows;
			updatePaginationInfo(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
			updatePagination(AlarmDbSettings.internals.display_rows, AlarmDbSettings.internals.page_size);
			updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
	} else {
		var message = "Results: "+jobCount+" records with matching keywords";
		pushTableAlert("success", message);
		updatePaginationInfo(jobCount, AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		updatePagination(jobCount, AlarmDbSettings.internals.page_size);
		if ($("#active_alarm_tab").hasClass("active")) {
			updateActiveTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page)
		}
		if ($("#alarm_log_tab").hasClass("active")) {
			updateLogTableRowList(AlarmDbSettings.internals.page_size, AlarmDbSettings.internals.active_page);
		}
	}
	return true;
}

function refreshButtonLoadingStyle(update) {
	if (update === true) {
		$("#controls_refresh").toggleClass("disabled");
		$("#controls_refresh i").toggleClass("glyphicon-refresh-animate");
		return true;
	} else {
		$("#controls_refresh").toggleClass("disabled");
		$("#controls_refresh i").toggleClass("glyphicon-refresh-animate");
		return false;
	}
}

function alarmIconRingStyle(animate_icon) {
	if (animate_icon === true) {
		if (!$("#active_alarm_tab span").hasClass("glyphicon-alarm-animate")) {
			$("#active_alarm_tab span").addClass("glyphicon-alarm-animate");
		}
	} else {
		if ($("#active_alarm_tab span").hasClass("glyphicon-alarm-animate")) {
			$("#active_alarm_tab span").removeClass("glyphicon-alarm-animate");
		}
	}
	return true;
}

function pushTableAlert(style, msg) {
	var msg = `<td colspan="6"><i class="glyphicon glyphicon-info-sign"></i> `+msg+`</td>`;
	if (style == "hide") {
		$("#alarm_line").html("");
		$("#alarm_line").hide();
	} else {
		$("#alarm_line").html("");
		$("#alarm_line").append(msg);
		$("#alarm_line").removeClass("default").removeClass("active").removeClass("success").removeClass("warning").removeClass("danger").removeClass("info");
		$("#alarm_line").addClass(style);
		$("#alarm_line").show();
	}
	return true;
}

function alarmHtmlRender(alarm) {
	var content = "";
	var alarm_class = "default";

	if (alarm.priority >= AlarmDbSettings.ui.table.priorityRanges.danger.min && alarm.priority <= AlarmDbSettings.ui.table.priorityRanges.danger.max) {
		alarm_class = "danger";
	} else {
		if (alarm.priority >= AlarmDbSettings.ui.table.priorityRanges.warning.min && alarm.priority <= AlarmDbSettings.ui.table.priorityRanges.warning.max ) {
			alarm_class = "warning";
		} else {
			if (alarm.priority >= AlarmDbSettings.ui.table.priorityRanges.primary.min && alarm.priority <= AlarmDbSettings.ui.table.priorityRanges.primary.max ) {
				alarm_class = "primary";
			} else {
				if (alarm.priority >= AlarmDbSettings.ui.table.priorityRanges.info.min && alarm.priority <= AlarmDbSettings.ui.table.priorityRanges.info.max ) {
					alarm_class = "info";
				} else {
					if (alarm.priority >= AlarmDbSettings.ui.table.priorityRanges.success.min && alarm.priority <= AlarmDbSettings.ui.table.priorityRanges.success.max ) {
						alarm_class = "success";
					}
				}
			}
		}
	}
	
	content += `<tr id="`+alarm.id+`" class="alarmrow" ackn_user="`+alarm.ackn_user+`" ackn="`+alarm.ackn+`" adate="`+alarm.adate+`">
					<td class="col1"><span class="glyphicon glyphicon-unchecked select_f" aria-hidden="true"></span>
					<span class="label label-`+alarm_class+` tags">`+alarm.priority+`</span></td>`;	
	var ackn = "";
	var ackn_user = "";
	var ackn_b_style = "alarm_b_ackn";
	var alarm_b_style = "alarm_b_delete_disabled disabled";
	if (alarm.ackn == "true" && alarm.ackn != null && alarm.adate != null) {
		ackn_b_style = "alarm_b_ackn_disabled disabled";
		alarm_b_style = "alarm_b_delete";
		ackn = `<p class="adate"><span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span><small><i>`+alarm.adate+`</i></small></p>`;
		if (ackn_user != null) {
			ackn_user = `<p class="ackn_user"><small><i>`+alarm.ackn_user+`</i></small></p>`;
		}
	}
	content += `<td class="dates col2"><p class="alarm_date"><span class="glyphicon glyphicon glyphicon-bell" aria-hidden="true"></span><small>`+alarm.date+`</small></p>`+ackn+`</td>`;
	content += `<td class="col3">`;
	var values = alarm.value.split(',');
	$.each(values, function(index, value) {
		content += `<span class="label label-`+alarm_class+` tags">`+value+`</span>`;
	});
	content += `</td>`;
	var attachment = "";
	content += `<td class="alarm_text col4"><p class="text">`+alarm.text+` `+attachment+`</p>`+ackn_user+`</td>
				<td class="col5">`;
	var tags = alarm.tags.split(',');
	$.each(tags, function(index, value) {
		content += `<span class="label label-info tags">`+value+`</span>`;
	});
	content += `</td>
				<td class="col6"><div class="btn-group" role="group" aria-label="action">
					<button type="button" class="controls btn btn-default `+ackn_b_style+`"><span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span></button>
					<button type="button" class="controls btn btn-default `+alarm_b_style+`"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>`;
	if (alarm.notes != null) {
		notes_b_style = "active_icon";
	} else {
		notes_b_style = "disabled_icon";
	}
	content += `	<button type="button" class="btn btn-default alarm_b_notes" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-comment `+notes_b_style+` aria-hidden="true"></span></button>
				</div>
				<div class="notes-panel panel-default hide">
					<div class="notes-panel-heading">
						<div class="btn-group">
							<span class="glyphicon glyphicon-remove note-close" aria-hidden="true"></span>
						</div>
					</div>
					<div class="notes-panel-body">
						<ul class="notes"></ul>
					</div>
					<div class="panel-footer">
						<div class="input-group">
							<input id="btn-input" type="text" class="form-control input-sm" placeholder="Type your message here...">
							<span class="input-group-btn">
								<button class="btn btn-warning btn-sm" id="btn-notes">Send</button>
							</span>
						</div>
					</div>
				</div>
				</td>
				</tr>`;
	return content;
}

function noteHtmlRender(alarm) {
	var content = `
				<li class="left clearfix">
					<span class="notes-img pull-left">
						<div class="img-circle user-icon-img"><span class="glyphicon glyphicon-user user-icon" aria-hidden="true"></span></div>
					</span>
					<div class="notes-body clearfix">
						<div class="note-header">
							<strong class="primary-font">`+alarm.user+`</strong> <small class="pull-right text-muted">
							<span class="glyphicon glyphicon-time"></span>`+alarm.date+`</small>
						</div>
						<p>`+alarm.text+`</p>
					</div>
				</li>
	`;
	return content;
}

function renderLogin() {
	var template = `<div class="modal fade" id="alarmdb_login_modal">
			<div class="login-wrapper">
				
				<div id="form-login" class="form-login"> 
					<div class="login-close">
						<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
					</div>
					<h2 class="form-login-heading">Login</h2>
					<div id="login-error" class="alert alert-danger hide" role="alert"></div>
					<input type="text" id="username" class="form-control login-control login-control-input-text" size="60" name="username" placeholder="User name" required="" autofocus="" />
					<input type="password" id="password" class="form-control login-control login-control-input-pass" size="60" name="password" placeholder="Password" required=""/>      
					<label class="checkbox login-remember-box"><input type="checkbox" value="remember" id="remember" name="rememberMe"> Remember me</label>
					<button class="btn btn-lg btn-primary btn-block" id="btn-login" type="submit">Login</button>   
				</div>
			</div>
		</div>`;		
	if (!$("#alarmdb_login_modal").length){
		$('body').append(template);
		return true;
    }
	return false;
}

function validateLogin(login) {
	$("#alarmdb_login_modal").modal("show");
	$("#alarmdb_login_modal").ready(function() {
		$("#btn-login").on('click', function(e) {
			e.preventDefault();
			$("#login-error").addClass("hide").text("");
			var user = $("input[type=text][name=username]").val();
			var user_count = $("input[type=text][name=username]").val().length;
			if(user=="") {
				$("#login-error").removeClass("hide").text("User name is empty");
				return;
			}
			if(user_count >= 60) {
				$("#login-error").removeClass("hide").text("User name is too long. Max 60 simbols");
				return;
			}
			var pass = $("input[type=password][name=password]").val();
			var pass_count = $("input[type=password][name=password]").val().length;
			if(pass=="") {
				$("#login-error").removeClass("hide").text("Password is empty");
				return;
			}
			if(pass_count >= 60) {
				$("#login-error").removeClass("hide").text("Password is too long. Max 60 simbols");
				return;
			}
			var rem = false;
			if ($("input[type=checkbox][name=rememberMe]").is(":checked")) {
				rem = true;
			}
			apiLogin(user,pass,rem);
		});
		$(".login-close").on('click', function(e) {
			$("#alarmdb_login_modal").modal("hide");
		});
	});
	return;
}

function validateLogout() {
	var logoutAPI = AlarmDbSettings.api.auth.logout.href;
	window.location.replace(logoutAPI);
}

function apiLogin(user,pass,rem) {
	var loginAPI = AlarmDbSettings.api.auth.login.href;
	var data = {
		user: user,
		password: pass,
		remember: rem
	}
	var headers = $.extend( true, data, AlarmDbSettings.api.auth.login.headers);
	$("#login-error").addClass("hide");
	$("#btn-login").text("loading...");
	$.post(loginAPI, headers)
	.done(function(data) {
		$("#alarmdb_login_modal").modal("hide");
		$("#btn-login").text("Login");
		$("input[type=text][name=username]").val("");
		$("input[type=password][name=password]").val("");
		$("#login-error").text("");
		$("#login-error").addClass("hide");
		loadAlarmDB();
		return true;
	})
	.fail(function(data, textStatus, xhr) {
		$("#login-error").removeClass("hide");
		$("#login-error").text(data.status+":"+xhr);
		$("#btn-login").text("Login");
		return false;
	});
}

function export_file(type) {
	ids = "";
	$("#alarm_list tr").each(function() {
		if (ids == "") {
			ids += $(this).attr("id");
		}else {
			ids += ","+$(this).attr("id");
		}
	});
	var alarmAPI = AlarmDbSettings.api.location;
	var apiComands = {
			"www-command": "alarmdb-get",
			"format": type,
			"id": ids,
			"file":""
		};
	var headers = $.extend( true, apiComands, AlarmDbSettings.api.headers);
	refreshButtonLoadingStyle(true);
	$.post(alarmAPI, headers)
	.done(function(data) {
		if (typeof(data.export_status) != "undefined") {
			if(data.export_status == "ready") {
				pushTableAlert("info", "Export file was generated at "+data.date+". To download the file follow the link: <a href=\""+data.href+"\" id=\"download_link\" target=\"_blank\">Download</a>");
			} 
		} else {
			pushTableAlert("warning", "Server failed to generate an export file");
		}
		if (data.warning) {
			pushTableAlert("warning", data.warning);
		}
		if (data.error) {
			pushTableAlert("danger", data.error);
		}
		if (data.info) {
			pushTableAlert("info", data.info);
		}
		refreshButtonLoadingStyle(false);
		return true;
	})
	.fail(function(data, textStatus, xhr) {
		if (data.status == "401") {
			validateLogin(data.login);
		}
		pushTableAlert("danger", textStatus+": "+data.status+"-"+xhr);
		refreshButtonLoadingStyle(false);
		return false;
	})
}

jQuery.each( [ "put", "delete" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = undefined;
    }
    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    });
  };
});

function loadAlarmDB(){
	var settings = validateSettings(AlarmDbSettings);
	var bStyle = ""
	var template = `
	<div class="header">
				<ul class="nav nav-tabs">
					<li id="active_alarm_tab" class="controls"><a data-toggle="tab" href="#"><span class="glyphicon glyphicon-bell" aria-hidden="true"></span> `+settings.ui.tabs.active.title+`</a></li>
					<li id="alarm_log_tab" class="controls active"><a data-toggle="tab" href="#"><span class="glyphicon glyphicon-list" aria-hidden="true"></span> `+settings.ui.tabs.log.title+`</a></li>
					<a class="pull-right" href="`+AlarmDbSettings.href+AlarmDbSettings.version+`" target="_blank"><img src="`+settings.ui.logo.img+`" class="logo pull-right" alt="`+settings.ui.logo.alt+` `+AlarmDbSettings.version+`">
					<i class="logo-version">`+AlarmDbSettings.version+`</i>
					</a>
				</ul>
			</div>
			<div class="tab-content">
				<div class="row table-toolbar">`;
	if (settings.ui.controlBar.enabled === true) {
		template += `	<div id="controls_top" class="btn-group pull-right">`;
		if (settings.ui.controlBar.manualUpdate.enabled === true) {
			template += `	<button class="controls btn btn-default" type="button" id="controls_refresh" aria-label="Refresh" title="`+settings.ui.controlBar.manualUpdate.title+`"><i class="glyphicon glyphicon-refresh"></i></button>`;
		}
		if (settings.ui.controlBar.periodicUpdate.enabled === true) {
			bStyle = "";
			if (settings.ui.controlBar.periodicUpdate.active === true) {
				bStyle = "active";
			}
			template += `	<button class="btn btn-default `+bStyle+`" type="button" id="controls_timer" aria-label="Atomatic refresh" title="`+settings.ui.controlBar.periodicUpdate.title+`"><i class="glyphicon glyphicon-time"></i></button>`;
		}
		if (settings.ui.controlBar.pagination.enabled === true) {
			template += `	<button class="btn btn-default active" type="button" id="controls_paginationSwitch" aria-label="Pagination Switch" title="`+settings.ui.controlBar.pagination.title+`"><i class="glyphicon glyphicon-collapse-down"></i></button>`;
		}
		if (settings.ui.controlBar.tableColumns.enabled === true) {
			template += `	<div class="btn-group" title="`+settings.ui.controlBar.tableColumns.title+`">
								<button type="button" aria-label="columns" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><i class="glyphicon glyphicon-th-list"></i> <span class="caret"></span></button>
								<ul id="control_columns" class="dropdown-menu dropdown-menu-right" role="menu">
									<li role="menuitem" column_name="col1"><a href="#"><span id="wcol1" class="glyphicon glyphicon-check control_icon" aria-hidden="true"></span>`+settings.ui.controlBar.tableColumns.columns.priority.title+`</a></li>
									<li role="menuitem" column_name="col2"><a href="#"><span id="wcol2" class="glyphicon glyphicon-check control_icon" aria-hidden="true"></span>`+settings.ui.controlBar.tableColumns.columns.date.title+`</a></li>
									<li role="menuitem" column_name="col3"><a href="#"><span id="wcol3" class="glyphicon glyphicon-check control_icon" aria-hidden="true"></span>`+settings.ui.controlBar.tableColumns.columns.value.title+`</a></li>
									<li role="menuitem" column_name="col4"><a href="#"><span id="wcol4" class="glyphicon glyphicon-check control_icon" aria-hidden="true"></span>`+settings.ui.controlBar.tableColumns.columns.text.title+`</a></li>
									<li role="menuitem" column_name="col5"><a href="#"><span id="wcol5" class="glyphicon glyphicon-check control_icon" aria-hidden="true"></span>`+settings.ui.controlBar.tableColumns.columns.tags.title+`</a></li>
									<li role="menuitem" column_name="col6"><a href="#"><span id="wcol6" class="glyphicon glyphicon-check control_icon" aria-hidden="true"></span>`+settings.ui.controlBar.tableColumns.columns.action.title+`</a></li>
								</ul>
							</div>`;
		}
		if (settings.ui.controlBar.export.enabled === true) {
			template += `	<div class="export btn-group">
								<button class="btn btn-default dropdown-toggle" aria-label="export type" title="`+settings.ui.controlBar.export.title+`" data-toggle="dropdown" type="button"><i class="glyphicon glyphicon-export"></i> <span class="caret"></span></button>
								<ul id="control_export" class="dropdown-menu dropdown-menu-right" role="menu">`;
								
			$.each(settings.ui.controlBar.export.formats, function(i, value){
				if (value.enabled === true) {
					template += `	<li role="menuitem" data-type="`+value.format+`"><a href="#" type="`+value.format+`"><i class="glyphicon glyphicon-save-file control_icon"></i>`+value.title+`</a></li>`;
				}
			});							
									
			template += `		</ul>
							</div>`;
		}
		if (settings.ui.controlBar.usermenu.enabled === true) {
			template += `	<div class="btn-group">
								<button class="btn btn-default dropdown-toggle" aria-label="user" title="user" data-toggle="dropdown" type="button"><i class="glyphicon glyphicon-user"></i> <span class="caret"></span></button>
								<ul id="control_user" class="dropdown-menu dropdown-menu-right" role="menu">`;				
			var loggedin = getCookies("alarmdb_user_login");
			if (loggedin == "true")	{
				if (settings.ui.controlBar.usermenu.links.myAcount.enabled === true) {
					template += `		<li role="menuitem"><a href="`+settings.ui.controlBar.usermenu.links.myAcount.href+`"><i class="glyphicon glyphicon-user control_icon"></i>`+settings.ui.controlBar.usermenu.links.myAcount.title+`</a></li>`;
				}
				if (settings.ui.controlBar.usermenu.links.apiSettings.enabled === true) {
					template += `		<li role="menuitem"><a href="`+settings.ui.controlBar.usermenu.links.apiSettings.href+`"><i class="glyphicon glyphicon-link control_icon"></i>`+settings.ui.controlBar.usermenu.links.apiSettings.title+`</a></li>`;
				}
				template += `			<li role="separator" class="divider"></li>`;
				template += `			<li role="menuitem"><a href="javascript:validateLogout();"><i class="glyphicon glyphicon-log-out control_icon"></i>Logout</a></li>`;
			} else {
				template += `			<li role="menuitem"><a href="javascript:validateLogin();"><i class="glyphicon glyphicon-log-in control_icon"></i>Login</a></li>`;			
			}			
			template += `		</ul>
							</div>`;
		}
		template += `	</div>`;
	}
	if (settings.ui.search.enabled === true) {
		template += `<div id="search_tab" class="input-group col-xs-6 col-sm-4 col-md-3 search pull-right">
						<input id="search" type="text" class="form-control search" placeholder="`+settings.ui.search.title+`">
						<span class="input-group-btn">
							<button id="search_btn"class="btn btn-default" type="button"><span class="glyphicon glyphicon-search"></span></button>
						</span>
					</div>`;
	}
	template += `</div>
				<div class="tab-pane fade in active">
					<div class="row">
						<div class="col-xs-12" id="alarm_container">
							<div class="panel panel-default">
								<table class="table" id="alarm_table">
									<thead class="table_header">
										<tr>
											<th class="col1 col-xs-1 col-md-1 col-lg-1"><span class="glyphicon glyphicon-unchecked select_all_f" aria-hidden="true"></span>`+settings.ui.controlBar.tableColumns.columns.priority.title+`</th>
											<th class="col2 col-xs-3 col-md-2 col-lg-2">`+settings.ui.controlBar.tableColumns.columns.date.title+`</th>
											<th class="col3 col-xs-1 col-md-1 col-lg-1">`+settings.ui.controlBar.tableColumns.columns.value.title+`</th>
											<th class="col4 col-xs-4 col-md-5 col-lg-5">`+settings.ui.controlBar.tableColumns.columns.text.title+`</th>
											<th class="col5 col-xs-1 col-md-1 col-lg-1">`+settings.ui.controlBar.tableColumns.columns.tags.title+`</th>
											<th class="col6 col-xs-2 col-md-2 col-lg-2">`+settings.ui.controlBar.tableColumns.columns.action.title+`</th>
										</tr>
										<tr id="alarm_line" class="info">
										</tr>
									</thead>
									<tbody id="alarm_list" class="searchable">
									</tbody>
								</table>
							</div>
							<div class="table-pagination row">
								<div class="pagination-total col-xs-12 col-md-3 col-lg-3">
								</div>
								<div class="pagination-info col-xs-12 col-md-3 col-lg-3">
									<span></span>
								</div>
								<div class="pagination-detail col-xs-12 col-md-6 col-lg-6">
									<div class="btn-group dropup hide">
										<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
											<span class="page-size">10</span> <span class="caret"></span>
										</button>
											<ul class="dropdown-menu" role="menu">
												<div class="panel-heading">Rows per page</div>
												<li role="separator" class="divider"></li>
												<li role="menuitem" class="link active">
													<a href="#">10</a>
												</li>
												<li role="menuitem" class="link">
													<a href="#">25</a>
												</li>
												<li role="menuitem" class="link">
													<a href="#">50</a>
												</li>
												<li role="menuitem" class="link">
													<a href="#">100</a>
												</li>
												<li role="menuitem" class="link">
													<a href="#">All</a>
												</li>
											</ul>
										<ul id="pagination-list" class="pagination"></ul>
									</div>
									
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
	`;
	$(AlarmDbSettings.ui.loadContainer.divId).html("");
	$(AlarmDbSettings.ui.loadContainer.divId).append(template);
	AlarmDbSettings.internals.page_size = $(".pagination-detail").find(".page-size").text();
	renderLogin();
	getDbAlarms();
	return;
}

function updatePaginationTotal(active,ackn,notes) {
	content = `
		<i>`+AlarmDbSettings.ui.footer.totals.title+`</i>
		<span class="glyphicon glyphicon-bell" aria-hidden="true"></span><i>`+active+`</i>
		<span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span><i>`+ackn+`</i>
		<span class="glyphicon glyphicon-comment active_icon" aria-hidden="true"></span><i>`+notes+`</i>
	`;
	$(".pagination-total").html("");
	$(".pagination-total").append(content);
	return true;
}

function validateSettings(newSettings){
	//NEED some validation for future releases before merging settings
	if(getCookies("alarmdb_user_settings")) {
		var cookie_user_settings = JSON.parse(getCookies("alarmdb_user_settings"));
		AlarmDbSettings = $.extend(true, AlarmDbSettings, cookie_user_settings);
	}
	AlarmDbSettings = $.extend(true, AlarmDbSettings, newSettings);
	return AlarmDbSettings;
};

function getCookies(name){
	var name = name;
	var pairs = document.cookie.split("; ");
	var cookies = {};
	for (var i=0; i<pairs.length; i++){
		var pair = pairs[i].split("=");
		cookies[pair[0]] = unescape(pair[1]);
	}
	return cookies[name];
}

function confirmAlert(text) {
	return confirm(text);
}