

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GOOGLE DRIVE ACCESS 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function gTest()
	{
//		gdrive.LoadFile("12mLmXY0LILmspBDOd2DuEcti7kqe5pwWIGh4jdKSQF8",true);
		var o={};																		// New obj
		o.script=$("#scriptTextDiv").text();										// Get script text 
		o.title=$("#titleDiv").text();												// Get title text 
		o.voice=player.voice;														// Get audio mode
		o.audioRate=player.audioRate;												// Get rate multiplier
		o.pitch=player.pitch;														// Get TTS pitch
		o.mp3=player.mp3;															// Get audio file
		o.binPics=$.parseJSON(JSON.stringify(bin.pics));							// Clone bin pics
		o.scriptPics=$.parseJSON(JSON.stringify(script.pics));						// Clone script pics
		trace(JSON.stringify(o));
	}

	function Gdrive()															// CONSTRUCTOR
	{
		this.clientId="745573675109-38u53k0dg71c9lj23522csfgr58095h7.apps.googleusercontent.com";	// Google client id
		this.appID="745573675109";													// Google app id
		this.scope="https://www.googleapis.com/auth/spreadsheets";					// Scope of access
		this.apiKey="AIzaSyDUJ3d7mPKO9zX6xuERr43m6cxJrWu8Q5w";						// Google API key
		this.contentType="image/svg+xml";											// SVG mime type
		this.lastId="";																// Id of last one saved/loaded
		this.lastName="";															// Name of last file
	}

	Gdrive.prototype.SaveFile=function(id)										// SAVE GOOGLE SPREADSHEET
	{
		var i,a,o,oauthToken;
		var _this=this;																// Save context
		gapi.load('auth', { 'callback': onAuthApiLoad });							// Load auth
		var data={  "majorDimension": "ROWS", "values":[["type", "title", "url", "link", "desc"]] };		// Data to save
		for (i=0;i<bin.pics.length;++i) {											// For each bin pic
			a=["pic"];																// Add type
			o=bin.pics[i];															// Point at pic
			a.push(o.title ? o.title : "");											// Add title 
			a.push(o.src ? o.src : "");												// Add src 
			a.push(o.link ? o.link : "");											// Add link 
			a.push(o.desc ? o.desc : "");											// Add desc 
			data.values.push(a)
			}
		data.values.push(["script",$("#scriptTextDiv").text(),"","",""]);			// Save script
		data.values.push(["title",$("#titleDiv").text(),"","",""]);					// Save title
		o={};																		// New obj
		o.script=$("#scriptTextDiv").text();										// Get script text 
		o.title=$("#titleDiv").text();												// Get title text 
		o.voice=player.voice;														// Get audio mode
		o.audioRate=player.audioRate;												// Get rate multiplier
		o.pitch=player.pitch;														// Get TTS pitch
		o.mp3=player.mp3;															// Get audio file
		o.binPics=$.parseJSON(JSON.stringify(bin.pics));							// Clone bin pics
		o.scriptPics=$.parseJSON(JSON.stringify(script.pics));						// Clone script pics
		data.values.push(["data","Don't edit this line!",JSON.stringify(o,8),"",""]);	// Save data

		function onAuthApiLoad() {													// ON AUTH API LOADED
      		window.gapi.auth.authorize({											// Authorize
            	client_id: _this.clientId,											// Set client ID
            	scope: _this.scope,													// Set scope
				discoveryDocs:["https://sheets.googleapis.com/$discovery/rest?version=v4"],
            	immediate: false													// Not immediate
         		 }, handleAuthResult);
    		}

		function handleAuthResult(authResult) {										// ON OATH
			if (authResult && !authResult.error) {									// No error
        		oauthToken=authResult.access_token;									// Get token
				if (id) 	writeData();											// If has an id, writer to it
				 else		writeNewData();											// Otherwise create a new file
      			}
			}
	
		function writeNewData()													// CREATE NEW DOC ON G-DRIVE
		{
			var d=new Date();														// Get date
			var name="PrimaryAccess - ";											// Prefix
			name+=(d.getMonth()+1)+"/"+d.getDate()+" "+d.getHours()+":"+d.getMinutes();	// Add
			var request=gapi.client.request({										// Make request object
				path: "/drive/v3/files/", method: "POST",
		       	headers: {
		           	"Content-Type": "application/json",
		           	"Authorization": "Bearer "+oauthToken,             
		      		},
		       body:{
		           	name: name,
					mimeType: "application/vnd.google-apps.spreadsheet",
		  	     	}
		  	 	});
			request.execute(function(response) {									// Get data
				id=_this.lastId=response.id;										// Save id
				writeData(true);													// Write file
				});	
			}	
	
		function writeData(create) {
			var accessToken=gapi.auth.getToken().access_token;
			var str="https://sheets.googleapis.com/v4/spreadsheets/"+id+"/values/Sheet1!A1:E50?valueInputOption=USER_ENTERED";
			var xhr=new XMLHttpRequest();											// Ajax
 			xhr.open("PUT",str);													// Set open url
			xhr.setRequestHeader('Authorization','Bearer '+ accessToken);			// Auth
			xhr.onload=function() { 												// On successful load
				Sound("ding");														// Ding sound
				if (create)
					PopUp("<p style='color:#009900'><b>New\ doc created</b></p>Make sure to set sharing to<br><i> Anyone can view it</i> in Google Docs",8000);  // Popup success
				else
					PopUp("<p style='color:#009900'><b>Successfully saved!</b></p>"); 	// Popup success
				}
			xhr.onreadystatechange=function(e)  { 									// On readystate change
				if ((xhr.readyState === 4) && (xhr.status !== 200)) {  				// Ready, but no load
					Sound("delete");												// Delete sound
					PopUp("<p style='color:#990000'><b>Error saving Google Doc!</b></p>",5000); // Popup warning
					}
				 };		
   			xhr.send(JSON.stringify(data));												// Do it
			}
	}

	Gdrive.prototype.LoadFile=function(id, logIn)								// LOAD GOOGLE SPREADSHEET
	{
		var _this=this;																// Save context
		if (!logIn) {																// If not logging in
			var str="https://docs.google.com/spreadsheets/d/"+id+"/export?format=tsv";	// Access tto
		trace(str)
			var xhr=new XMLHttpRequest();											// Ajax
			xhr.open("GET",str);													// Set open url
			xhr.onload=function() { 												// On successful load
				doc.AddCSV(xhr.responseText);										// Parse CSV  
				};			
			xhr.onreadystatechange=function(e)  { 									// On readystate change
				if ((xhr.readyState === 4) && (xhr.status !== 200)) {  				// Ready, but no load
					Sound("delete");												// Delete sound
					PopUp("<p style='color:#990000'><b>Couldn't load Google Doc!</b></p>Make sure that <i>anyone</i><br>can view it in Google",5000); // Popup warning
					}
				 };		
			xhr.send();																// Do it
			return;																	// Quit
			}

 		var pickerApiLoaded=false, oauthToken;
		gapi.load('auth', { 'callback': onAuthApiLoad });							// Load auth
		gapi.load('picker', { 'callback': onPickerApiLoad });						// Load picker

		function onAuthApiLoad() {													// ON AUTH API LOADED
      		window.gapi.auth.authorize({											// Authorize
            	client_id: _this.clientId,											// Set client ID
            	scope: _this.scope,													// Set scope
            	immediate: false													// Not immediate
         		 }, handleAuthResult);
    		}
		function onPickerApiLoad() {												// ON PICKER API LOADED
      		pickerApiLoaded=true;													// Set flag
      		createPicker();															// Create picker
   			}

		function handleAuthResult(authResult) {										// ON OATH
    		 if (authResult && !authResult.error) {									// No error
        		oauthToken=authResult.access_token;									// Get token
 	      		createPicker();
      			}
			}
		function createPicker() {													// CREATE PICKER
			if (pickerApiLoaded && oauthToken) {
				var view=new google.picker.DocsView(google.picker.ViewId.DOCS)		// Create view
					.setMimeTypes("application/vnd.google-apps.spreadsheet")		// Accept Sheets only
					.setOwnedByMe(true)												// Only ones I own
					.setIncludeFolders(true);										// Show folders
				var picker=new google.picker.PickerBuilder()						// Create picker
					.setAppId(_this.appID)											// Set appID
					.setOAuthToken(oauthToken)										// Oath token
					.setDeveloperKey(_this.apiKey)									// Api key
					.setCallback(pickerCallback)									// Callback
					.addView(view)													// Add view
					.build();														// Done
				picker.setVisible(true);											// Show it
      			}
    		}

		function pickerCallback(data) {												// ON PICK
      		if (data.action == google.picker.Action.PICKED) {						// If picked
				gdrive.LoadFile(data.docs[0].id);									// Load file
				_this.lastId=data.docs[0].id;										// Save id
			  	}
			 }
 	}
	 