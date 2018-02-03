///////////////////////////////////////////////////////////////////////////////////////////////
//  QMEDIA FILE SYSTEM
///////////////////////////////////////////////////////////////////////////////////////////////
	
	
	function QmediaFile(host, version) 										// CONSTRUCTOR
	{
		qmf=this;																// Point to obj
		this.host=host;															// Get host
		this.version=version;													// Get version
		this.email=this.GetCookie("email");										// Get email from cookie
		this.curFile="";														// Current file
		this.password=this.GetCookie("password");								// Password
		this.butsty=" style='border-radius:10px;color#666;padding-left:6px;padding-right:6px' ";	// Button styling
		this.deleting=false;													// Not deleting
	}
	
	QmediaFile.prototype.Load=function() 									//	LOAD FILE DIALOG
	{
		var _this=this;															// Save context
		var str="<br/>To load one of your projects, type your email address in the box below. If you were given an ID to use, use that instead."
		str+="<br><br><div style='text-align:center'>";							// Center	
		str+="<b>Email or Id:&nbsp;&nbsp</b> <input class='pa-is' type='text' id='email' value='"+this.email+"'/>";
		str+="</div><br><div style='text-align:right'><br>";					// Right justify	
		str+="<div class='pa-bs' id='logBut'>Login</div>&nbsp;&nbsp;";			// OK but
		str+="<div class='pa-bs' id='cancelBut'>Cancel</div></div>";			// Cancel but
		this.ShowLightBox("Login",str);
		
		$("#cancelBut").on("click", function() {								// CANCEL BUTTON
			$("#lightBoxDiv").remove();											// Close
			});
	
		$("#logBut").on("click",function() {									// LOGIN BUTTON
			_this.ListFiles();													// Get list of files
			});
	}	

	QmediaFile.prototype.Save=function(saveAs) 								//	SAVE FILE TO DB
	{
		if (saveAs)																// If save as...
			curShow=this.curFile="";											// Force a new file to be made
		var str="<br/>To load one of your projects, type your email address in the box below. If you were given an ID to use, use that instead. Type in a password if you want to protect it. "
		str+="<br/><blockquote><table cellspacing=0 cellpadding=0 style='font-size:11px'>";
		str+="<tr><td><b>Email</b><span style='color:#990000'> *</span></td><td><input"+this.butsty+"type='text' id='email' size='20' value='"+this.email+"'/></td></tr>";
		str+="<tr><td><b>Password</b><span style='color:#990000'></span>&nbsp;&nbsp;</b></td><td><input"+this.butsty+"type='password' id='password' size='20' value='"+this.password+"'/></td></tr>";
		str+="</table></blockquote><div style='font-size:12px;text-align:right'><br>";	
		str+="<div class='pa-bs' id='saveBut'>Save</div>&nbsp;&nbsp;";			// Save but
		str+="<div class='pa-bs' id='cancelBut'>Cancel</div>";					// Cancel but
		this.ShowLightBox("Save your project",str);								// Show dialog
		var _this=this;															// Save context
		
		$("#saveBut").on("click",function() {									// SAVE BUTTON
			var dat={};
			_this.password=$("#password").val();								// Get current password
			if (_this.password)													// If a password
				_this.password=_this.password.replace(/#/g,"@");				// #'s are a no-no, replace with @'s	
			_this.email=$("#email").val();										// Get current email
			if (!_this.email) 													// Missing email
				 return _this.LightBoxAlert("Need email");						// Quit with alert
			_this.SetCookie("password",_this.password,7);						// Save cookie
			_this.SetCookie("email",_this.email,7);								// Save cookie
			$("#lightBoxDiv").remove();											// Close
			var url=_this.host+"saveshow.php";									// Base file
			dat["id"]=curShow;													// Add id
			dat["email"]=_this.email;											// Add email
			dat["password"]=_this.password;										// Add password
			dat["ver"]=_this.version;											// Add version
			dat["private"]=0;													// Add private
			dat["script"]="LoadShow("+JSON.stringify(curJson,null,'\t')+")";	// Add jsonp-wrapped script
			if (curJson.title)													// If a title	
				dat["title"]=AddEscapes(curJson.title);							// Add title
			$.ajax({ url:url,dataType:'text',type:"POST",crossDomain:true,data:dat,  // Post data
				success:function(d) { 			
					if (d == -1) 												// Error
				 		AlertBox("Error","Sorry, there was an error saving that project.(1)");		
					else if (d == -2) 											// Error
				 		AlertBox("Error","Sorry, there was an error saving that project. (2)");		
					else if (d == -3) 											// Error
				 		AlertBox("Wrong password","Sorry, the password for this project does not match the one you supplied.");	
				 	else if (d == -4) 											// Error
				 		AlertBox("Error","Sorry, there was an error updating that project. (4)");		
				 	else if (!isNaN(d)){										// Success if a number
				 		curShow=this.curFile=d;									// Set current file
						Sound("ding");											// Ding
						Draw();													// Redraw menu
						}
					},
				error:function(xhr,status,error) { trace(error) },				// Show error
				});		
			});
	
		$("#cancelBut").on("click", function() {								// CANCEL BUTTON
			$("#lightBoxDiv").remove();											// Close
			});
	}
	
	QmediaFile.prototype.LoadFile=function(id) 								//	LOAD A FILE FROM DB
	{
		id=id.substr(3);														// Strip off prefix
		$("#lightBoxDiv").remove();												// Close
		var url=this.host+"loadshow.php";										// Base file
		url+="?id="+id;															// Add id
		this.curFile=id;														// Set as current file
		$.ajax({ url:url, dataType:'jsonp'});									// Get data and pass to LoadProject() in Edit
	}	
		
	QmediaFile.prototype.ListFiles=function() 								//	LIST PROJECTS IN DB
	{
		this.email=$("#email").val();											// Get current email
		this.SetCookie("email",this.email,7);									// Save cookie
		var url=this.host+"listshow.php?ver="+this.version+"&deleted=0";		// Base file
		if (this.email)															// If email
			url+="&email="+this.email;											// Add email and deleted to query line
		$.ajax({ url:url, dataType:'jsonp', complete:function() { Sound('click'); } });	// Get data and pass qmfListFiles()
	}
	
	function qmfListFiles(files)											// CALLBACK TO List()
	{
		var trsty=" style='height:20px;cursor:pointer' onMouseOver='this.style.backgroundColor=\"#dee7f1\"' ";
		trsty+="onMouseOut='this.style.backgroundColor=\"#f8f8f8\"' onclick='";
		trsty+="qmf.LoadFile(this.id)'";										// Load
		qmf.password=$("#password").val();										// Get current password
		qmf.email=$("#email").val();											// Get current email
		qmf.SetCookie("email",qmf.email,7);										// Save cookie
		$("#lightBoxDiv").remove();												// Close old one
		str="<br>Choose project from the list below:<br>";						// Title
		str+="<br><div style='width:100%;max-height:300px;overflow-y:auto'>";	// Scrolling div
		str+="<table style='font-size:12px;width:100%;padding:0px;border-collapse:collapse;'>";
		str+="<tr></td><td><b>Title </b></td><td><b>Date&nbsp;&&nbsp;time</b></td><td style='float:right'><b> Show ID</b></tr>";
		str+="<tr><td colspan='3'><hr></td></tr>";
		for (var i=0;i<files.length;++i) 										// For each file
			str+="<tr id='qmf"+files[i].id+"' "+trsty+"><td>"+files[i].title+"</td><td>"+files[i].date.substr(5,11)+"</td><td align=right>"+files[i].id+"</td></tr>";
		str+="</table><br><div class='pa-bs' style='float:right' id='cancelBut'>Cancel</div>";	// Cancel but
		
		qmf.ShowLightBox("Load a project",str);									// Show lightbox
		this.deleting=false;													// Done deleting
		
		$("#cancelBut").on("click", function() {								// CANCEL BUTTON
			$("#lightBoxDiv").remove();											// Close
			});
							}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// UNDO / REDO
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function Do(name)														// SAVE SHOW IN SESSION STORAGE
	{
		var o={};
 		o.date=new Date().toString().substr(0,21);								// Get date
		o.script=JSON.stringify(curJson);										// Stringify
		o.name="Preview save";													// Normal preview save
		if (name == "bookmark") {												// If a bookmark
			GetTextBox("Set a bookmark", "Type the name of the bookmark you want to save the current project under. This bookmark will disappear when the browser is refreshed","",
				function(b) {  													// On entry
					o.name=b; 													// Save name
					sessionStorage.setItem("do-"+sessionStorage.length,JSON.stringify(o));	// Add new do												
					});									
			}
		else
			sessionStorage.setItem("do-"+sessionStorage.length,JSON.stringify(o));	// Add new do												
	}
	
	function Undo()
	{
		var i,o;
		var trsty="style='height:20px;cursor:pointer' onMouseOver='this.style.backgroundColor=\"#dee7f1\"'";
		trsty+="onMouseOut='this.style.backgroundColor=\"#f8f8f8\"'";
		$("#lightBoxDiv").remove();												// Close old one
		str="<br>Choose an undo to load from the list below:<br>";				// Prompt
		str+="<br><div style='width:100%;max-height:300px;overflow-y:auto'>";	// Div start
		str+="<table style='font-size:12px;width:100%;padding:0px;border-collapse:collapse;'>";	// Table start
		str+="<tr><td><b>Date</b></td><td><b>Name</b></tr>";					// Header
		str+="<tr><td colspan='2'><hr></td></tr>";								// Line
		var undos=[];
		for (i=0;i<sessionStorage.length;++i) {									// For each undo saved
			o=$.parseJSON(sessionStorage.getItem(sessionStorage.key(i)));		// Get undo from local storage
			o.id=i;																// Add id
			undos.push(o);														// dd to array
			}	
		undos.sort(function(a,b) { return b.date > a.date });					// Sort by time, latest first
		for (i=0;i<undos.length;++i) 											// For each undo
			str+="<tr id='und"+undos[i].id+"' "+trsty+"><td>"+undos[i].date+"</td><td>"+undos[i].name+"</td></tr>";
		str+="</table></div><div style='font-size:12px;text-align:right'><br>";	// End table
		str+=" <button"+qmf.butsty+"id='cancelBut'>Cancel</button></div>";		// Add button
		qmf.ShowLightBox("Load an undo",str);									// Show lightbox
	
		for (i=0;i<sessionStorage.length;++i) 									// For each undo
			$("#und"+i).click(function() {										// CANCEL BUTTON
				var key=sessionStorage.key(this.id.substr(3));					// Get key for undo
				var o=$.parseJSON(sessionStorage.getItem(key));					// Get undo from local storage
				curJson=$.parseJSON(o.script);									// Set curJson
				Draw(curPane);													// Show page
				Sound("ding");													// Ding
				$("#lightBoxDiv").remove();										// Close
				});
	
		$("#cancelBut").button().click(function() {								// CANCEL BUTTON
			Sound("delete");													// Delete sound
			$("#lightBoxDiv").remove();											// Close
			});
						
	}


///////////////////////////////////////////////////////////////////////////////////////////////
//  HELPERS
///////////////////////////////////////////////////////////////////////////////////////////////

	
	QmediaFile.prototype.SetCookie=function(cname, cvalue, exdays)			// SET COOKIE
	{
		var d=new Date();
		d.setTime(d.getTime()+(exdays*24*60*60*1000));
		var expires = "expires="+d.toGMTString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	}
	
	QmediaFile.prototype.GetCookie=function(cname) {						// GET COOKIE
		var name=cname+"=",c;
		var ca=document.cookie.split(';');
		for (var i=0;i<ca.length;i++)  {
		  c=ca[i].trim();
		  if (c.indexOf(name) == 0) 
		  	return c.substring(name.length,c.length);
		  }
		return "";
	}

	QmediaFile.prototype.ShowLightBox=function(title, content)				// LIGHTBOX
	{
		var str="<div id='lightBoxDiv' style='position:fixed;width:100%;height:100%;";	
		str+="background:url(img/overlay.png) repeat;top:0px;left:0px';</div>";
		$("body").append(str);														
		var	width=500;
		var x=$("#lightBoxDiv").width()/2-250;
		if (this.version == 1) 
			x=Math.max(x,950)
		var y=$("#lightBoxDiv").height()/2-200;
		if (this.xPos != undefined)
			x=this.xPos;
		str="<div id='lightBoxIntDiv' class='unselectable' style='position:absolute;padding:16px;width:400px;font-size:12px";
		str+=";border-radius:12px;z-index:2003;"
		str+="border:1px solid; left:"+x+"px;top:"+y+"px;background-color:#f8f8f8'>";
		str+="<img src='img/logo64.gif' style='vertical-align:-10px;width:32px'/>&nbsp;&nbsp;";								
		str+="<span id='lightBoxTitle' style='font-size:18px;text-shadow:1px 1px #ccc'><b>"+title+"</b></span>";
		str+="<div id='lightContentDiv'>"+content+"</div>";					
		$("#lightBoxDiv").append(str);	
		$("#lightBoxDiv").css("z-index",2500);						
	}
	
	QmediaFile.prototype.LightBoxAlert=function(msg) 						//	SHOW LIGHTBOX ALERT
	{
		Sound("delete");														// Delete sound
		$("#lightBoxTitle").html("<span style='color:#990000'>"+msg+"</span>");	// Put new
	}
	
	function MakeColorDot(title, name, color)								// MAKE COLORPICKER DOT
	{
		var str=title+"&nbsp;&nbsp;<div id='"+name+"' "; 
		str+="style='vertical-align:-2px;display:inline-block;height:12px;width:12px;border-radius:12px;border:1px ";
		if (!color || (color == -1)  || (color == "none")) 	
			str+="dashed #000;background-color:#fff"; 	
		else
			str+="solid #000;background-color:"+color; 	
		str+="' onclick='ColorPicker(\""+name+"\")'>";
		str+="</div>";
		return str;
	}		
	
	function ColorPicker(name, transCol) 									//	DRAW COLORPICKER
	{
		if (!transCol)															// If no transparent color set
			transCol="";														// Use null
		$("#colorPickerDiv").remove();											// Remove old one
		var x=$("#"+name).offset().left+10;										// Get left
		var y=$("#"+name).offset().top+10;										// Top
		var	str="<div id='colorPickerDiv' style='position:absolute;left:"+x+"px;top:"+y+"px;width:160px;height:225px;z-index:100;border-radius:12px;background-color:#eee'>";
		$("body").append("</div>"+str);											// Add palette to dialog
		$("#colorPickerDiv").draggable();										// Make it draggable
		str="<p style='text-shadow:1px 1px white' align='center'><b>Choose a new color</b></p>";
		str+="<img src='colorpicker.gif' style='position:absolute;left:5px;top:28px' />";
		str+="<input id='shivaDrawColorInput' type='text' style='position:absolute;left:22px;top:29px;width:96px;background:transparent;border:none;'>";
		$("#colorPickerDiv").html(str);											// Fill div
		$("#colorPickerDiv").on("click",onColorPicker);							// Mouseup listener
	
		function onColorPicker(e) {
			
			var col;
			var cols=["000000","444444","666666","999999","CCCCCC","EEEEEE","E7E7E7","FFFFFF",
					  "FF0000","FF9900","FFFF00","00FF00","00FFFF","0000FF","9900FF","FF00FF",	
					  "F4CCCC","FCE5CD","FFF2CC","D9EAD3","D0E0E3","CFE2F3","D9D2E9","EDD1DC",
					  "EA9999","F9CB9C","FFE599","BED7A8","A2C4C9","9FC5E8","B4A7D6","D5A6BD",
					  "E06666","F6B26B","FFD966","9C347D","76A5AF","6FA8DC","8E7CC3","C27BA0",
					  "CC0000","E69138","F1C232","6AA84F","45818E","3D85C6","674EA7","A64D79",
					  "990000","B45F06","BF9000","38761D","134F5C","0B5394","351C75","741B47",
					  "660000","783F04","7F6000","274E13","0C343D","073763","20124D","4C1130"
					 ];
			var x=e.pageX-this.offsetLeft;										// Offset X from page
			var y=e.pageY-this.offsetTop;										// Y
			if ((x < 102) && (y < 45))											// In text area
				return;															// Quit
			$("#colorPickerDiv").off("click",this.onColorPicker);				// Remove mouseup listener
			if ((x > 102) && (x < 133) && (y < 48))	{							// In OK area
				if ($("#shivaDrawColorInput").val())							// If something there
					col="#"+$("#shivaDrawColorInput").val();					// Get value
				else															// Blank
					x=135;														// Force a quit
				}
			$("#colorPickerDiv").remove();										// Remove
			if ((x > 133) && (y < 48)) 											// In quit area
				return;															// Return
			if (y > 193) 														// In trans area
				col=transCol;													// Set trans
			else if (y > 48) {													// In color grid
				x=Math.floor((x-14)/17);										// Column
				y=Math.floor((y-51)/17);										// Row
				col="#"+cols[x+(y*8)];											// Get color
				}
			if (col == transCol)												// No color 
				$("#"+name).css({ "border":"1px dashed #000","background-color":"#fff" }); 	// Set dot
			else				
				$("#"+name).css({ "border":"1px solid #000","background-color":col }); 		// Set dot
			$("#"+name).data(name,col);											// Set color
		}

	}
	
	function AlertBox(title, content, callback)								// ALERT BOX
	{
		$("#alertBoxDiv").remove();												// Remove any old ones
		Sound("delete");														// Delete sound
		$("body").append("<div class='unselectable' id='alertBoxDiv'></div>");														
		var str="<img src='img/logo64.gif' style='vertical-align:-10px;width:32px'/>&nbsp;&nbsp;";								
		str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#990000'><b>"+title+"</b></span></p>";
		str+="<div style='font-size:14px;margin:16px'>"+content+"</div>";
		$("#alertBoxDiv").append(str);	
		$("#alertBoxDiv").dialog({ width:400, buttons:{"OK": function() { $(this).remove(); if (callback) callback(); }}});	
		if (qmf.version == 1)	
			$("#alertBoxDiv").dialog("option","position",{ my:"center", at:"right center", of:window });
		$(".ui-dialog-titlebar").hide();
		$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
		$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
  		$(".ui-button").css({"border-radius":"30px","outline":"none"});
	}

	function ConfirmBox(content, callback)									// COMFIRM BOX
	{
		Sound("delete");														// Delete sound
		$("#alertBoxDiv").remove();												// Remove any old ones
		$("body").append("<div class='unselectable' id='alertBoxDiv'></div>");														
		var str="<img src='img/logo64.gif' style='vertical-align:-10px;width:32px'/>&nbsp;&nbsp;";								
		str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#990000'><b>Are you sure?</b></span><p>";
		str+="<div style='font-size:14px;margin:14px'>"+content+"</div>";
		$("#alertBoxDiv").append(str);	
		$("#alertBoxDiv").dialog({ width:400, buttons: {
					            	"Yes": function() { $(this).remove(); callback() },
					            	"No":  function() { $(this).remove(); }
									}});	
		if (qmf.version == 1)	
			$("#alertBoxDiv").dialog("option","position",{ my:"center", at:"right center", of:window });
		$(".ui-dialog-titlebar").hide();
		$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
		$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
 		$(".ui-button").css({"border-radius":"30px","outline":"none"});
 	}

	function GetTextBox(title, content, def, callback)					// GET TEXT LINE BOX
	{
		Sound("click");														// Ding sound
		$("#alertBoxDiv").remove();											// Remove any old ones
		$("body").append("<div class='unselectable' id='alertBoxDiv'></div>");														
		var str="<img src='img/logo64.gif' style='vertical-align:-10px;width:32px'/>&nbsp;&nbsp;";								
		str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#990000'><b>"+title+"</b></span><p>";
		str+="<div style='font-size:14px;margin:14px'>"+content;
		str+="<p><input class='is' type='text' id='gtBoxTt' value='"+def+"'></p></div>";
		$("#alertBoxDiv").append(str);	
		$("#alertBoxDiv").dialog({ width:400, buttons: {
					            	"OK": 		function() { callback($("#gtBoxTt").val()); $(this).remove(); },
					            	"Cancel":  	function() { $(this).remove(); }
									}});	
		if (qmf.version == 1)	
			$("#alertBoxDiv").dialog("option","position",{ my:"center", at:"right center", of:window });
		$(".ui-dialog-titlebar").hide();
		$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
		$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
 		$(".ui-button").css({"border-radius":"30px","outline":"none"});
 	}

	function GetSelectBox(title, content, def, options, callback)		// GET OPTION FROM SELECT MENU
	{
		Sound("click");														// Ding sound
		$("#alertBoxDiv").remove();											// Remove any old ones
		$("body").append("<div class='unselectable' id='alertBoxDiv'></div>");														
		var str="<img src='img/logo64.gif' style='vertical-align:-10px;width:32px'/>&nbsp;&nbsp;";								
		str+="<span id='gtBoxTi'style='font-size:18px;text-shadow:1px 1px #ccc;color:#990000'><b>"+title+"</b></span><p>";
		str+="<div style='font-size:14px;margin:14px'>"+content;
		str+="<p>"+MakeSelect('gtBoxTt',false,options,def)+"</p></div>";
		$("#alertBoxDiv").append(str);	
		$("#alertBoxDiv").dialog({ width:300, buttons: {
					            	"OK": 		function() { callback($("#gtBoxTt").val()); $(this).remove(); },
					            	"Cancel":  	function() { $(this).remove(); }
									}});	
		$(".ui-dialog-titlebar").hide();
		$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
		$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
 		$(".ui-button").css({"border-radius":"30px","outline":"none"});
 	}

	function GetHTMLEditor(val, callback)									// CALL HTML EDITOR
	{
		$("#alertBoxDiv").remove();												// Remove any old ones
		$("body").append("<div class='unselectable' id='alertBoxDiv'></div>");														
		var str="<img src='img/logo64.gif' style='vertical-align:-10px;width:32px'/>&nbsp;&nbsp;";								
		str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#000099'><b>HTML editor</b></span><p>";
		str+="<div style='font-size:14px;margin:14px'>";
		str+="<textarea id='htbx' style='width:100%'>";
		if (val)
			str+=val;
		str+="</textarea>";
		$("#alertBoxDiv").append(str+"</div>");	
		CKEDITOR.replace("htbx");
 		$("#alertBoxDiv").dialog({ width:550, buttons: {
	    	"OK": 		function() { 
	    					var s=CKEDITOR.instances.htbx.getData().replace(/[\n|\r]/g,"").replace(/"/g,"&quot;").replace(/&quot;/g,"\"");
	    					callback(s);										// Send to callback	
		    				$(this).remove();									// Remove dialog
		    				},
			"Cancel":  	function() { $(this).remove(); }
							}
			});	
		$(".ui-dialog-titlebar").hide();
		$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
		$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
 		$(".ui-button").css({"border-radius":"30px","outline":"none"});
	}

	function GetFlickrImage(callback)										// GET FLICKR IMAGE
	{
		$("#alertBoxDiv").remove();												// Remove any old ones
		$("body").append("<div class='unselectable' id='alertBoxDiv'></div>");														
		var str="<img src='img/logo64.gif' style='vertical-align:-10px;width:32px'/>&nbsp;&nbsp;";								
		str+="<span style='font-size:18px;text-shadow:1px 1px #ccc;color:#000099'><b>Get Flickr Image</b></span><p>";
		str+="<div style='font-size:14px;margin:14px'>";
		str+="<br><br><div style='display:inline-block;width:300px;max-height:200px;overflow-y:auto;background-color:#f8f8f8;padding:8px;border:1px solid #999;border-radius:8px'>";		// Scrollable container
		str+="<table id='collectTable' style='font-size:13px;width:100%;padding:0px;border-collapse:collapse;'>";	// Add table
		str+="<tr><td><b>Collection</b></td><td width='20'></td></tr>";			// Add header
		str+="<tr><td colspan='2'><hr></td></tr>";								// Add rule
		str+="</table></div>&nbsp;&nbsp;&nbsp;"									// End table
	
		str+="<div style='vertical-align:top;display:inline-block;width:300px;max-height:200px;overflow-y:auto;background-color:#f8f8f8;padding:8px;border:1px solid #999;border-radius:8px'>";		// Scrollable container
		str+="<dl id='setTable' style='font-size:13px;margin-top:2px;margin-bottom:2px'>";		// Add table
		str+="<dt><b>Set</b></dt>";												// Add header
		str+="<dt><hr></dt>";													// Add rule
		str+="</dl></div><div style='font-size:12px'<br><p><hr></p>";			// End table
	
		$("#alertBoxDiv").append(str+"</div>");	
		$("#alertBoxDiv").dialog({ width:800, buttons: {
					            	"Done":  function() { $(this).remove(); }
									}});	
		if (qmf.version == 1)	
			$("#alertBoxDiv").dialog("option","position",{ my:"center", at:"right center", of:window });
		$(".ui-dialog-titlebar").hide();
		$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").css("border","none");
		$(".ui-dialog").css({"border-radius":"14px", "box-shadow":"4px 4px 8px #ccc"});
 		$(".ui-button").css({"border-radius":"30px","outline":"none"});
 	}

	function AddEscapes(str)												// ESCAPE TEXT STRING
	{
		if (str) {																// If a string
			str=""+str;															// Force as string
			str=str.replace(/"/g,"\\\"");										// " to \"
			str=str.replace(/'/g,"\\\'");										// ' to \'
			}
		return str;																// Return escaped string
	}
	