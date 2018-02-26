////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CImageFind
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var CImageFindObj=null;																// Points at object

function CImageFind()																// CONSTRUCTOR
{
	CImageFindObj=this;																// Save pointer to obj
	this.rawData=null;																// Holds raw search results
	this.data=null;																	// Folds formatted search results
	this.filter="";																	// No filter
	this.filterCollect="";															// No collection filter
	this.filterPlace="";															// No place filter
	this.user="";																	// No user
	this.type="PrimaryAccess";														// Start with PA
	this.previewMode="";															// Mode of preview ( 'Preview', '')
	this.curItem=-1;																// Currently selected item
	this.era=0;																		// Era
	this.ncssEras=[ "Any",															// NCSS eras
		"1. Three Worlds Meet (Beginnings - 1620)",
		"2. Colonization & Settlement (1585-1763)",
		"3.	Revolution & the New Nation (1754-1820s)",
		"4. Expansion and Reform (1801-1861)",
		"5. Civil War & Reconstruction (1850-1877)",
		"6. Development of Industrial US (1870-1900)",
		"7. Emergence of Modern America (1890-1930)",
		"8. The Great Depression & WW-II (1929-1945)",
		"9.	Postwar US (1945 to early 1970s)",
		"10. Contemporary US (1968 to the present)",
		"11. The World" 
		];
}

CImageFind.prototype.ImportDialog=function()				// IMPORTER DIALOG
{
	var i;
	var _this=this;																	// Save context
	$("#dialogDiv").remove();														// Remove any dialogs
	var collections=["PrimaryAccess","Library of Congress","Wikimedia","Web"];// Supported collections
	var str="<hr style='margin-top:12px'><p><span class='pa-bodyTitle'>Find pictures</span>";	// Title
	str+="&nbsp;&nbsp;&nbsp;&nbsp;<i>(<span id='numItemsFound'>No</span> items found)</i>"; 	// Number of items
	str+="<span style='float:right'>";												// Hold controls
	str+="Search for: <input class='pa-is' id='mdFilter' type='text' value='"+this.filter+"' style='width:200px;height:17px;vertical-align:0px'>";
	str+="&nbsp;&nbsp;From: "+MakeSelect("mdType",false,collections,this.type);		// From where
	str+="</span></p><div id='mdAssets' class='pa-dialogResults'></div>";			// Scrollable container
	str+="<br>Limit by NCSS era: "+MakeSelect("mdEra",false,this.ncssEras); 		// Add eras
	$("#bodyDiv").append(str+"</div>");												// Add to body
	if (this.era)	$("#mdEra")[0].selectedIndex=this.era;							// Set era
	
	LoadCollection();															// Load 1st collection
 	
 	$("#mdType").on("change", function() {											// ON CHANGE COLLECTION
			_this.type=$(this).val();												// Save for later											
		 	LoadCollection();														// Load it
			});
	
	$("#mdFilter").on("change", function() {										// ON CHANGE FILTER
			_this.filter=$(this).val();												// Save for later											
		 	LoadCollection();														// Load it
			});
	$("#mdFilterCollect").on("change", function() {									// ON CHANGE FILTER COLLECT
			_this.filterCollect=$(this).val();										// Save for later											
			 LoadCollection();														// Load it
			});
	$("#mdEra").on("change", function() {											// ON CHANGE ERA
			_this.era=$(this)[0].selectedIndex;										// Save era										
			LoadCollection();														// Load it
		});
			
 	function LoadCollection() {													// LOAD COLLECTION FROM DB
		var era=CImageFindObj.era;													// Index of era
		CImageFindObj.LoadingIcon(true,32,"mdAssets");								// Show loading icon
		var url="//viseyes.org/pa/getresources.php";
		if (CImageFindObj.filter && CImageFindObj.era) url+="?q="+CImageFindObj.filter+"&era="+era;	// Q and era
		else if (CImageFindObj.filter) url+="?q="+CImageFindObj.filter;				// Q
		else if (CImageFindObj.era) url+="?era="+era;								// Era
		$.ajax( { url: url,  dataType: 'jsonp' });
		}
	}																					// End closure

	function GetPaRes(data)															// HADLE JSONP AJAX LOAD
	{
		var i,o;
		CImageFindObj.LoadingIcon(false);											// Hide loading icon
		CImageFindObj.data=[];														// New results store 
		for (i=0;i<data.length;++i) 												// For each doc returned
			CImageFindObj.data.push(data[i]);										// Add result to array
		$("#numItemsFound").text(CImageFindObj.data.length);						// Show number of results
		CImageFindObj.DrawAsGrid();													// Draw
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SHOW RESULTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

CImageFind.prototype.DrawAsGrid=function()											// SHOW RESULTS AS GRID
{	
	var i,str="";
	var _this=this;																	// Save context
	for (i=0;i<this.data.length;++i) {												// For each doc returned
		o=this.data[i];																// Point at doc
		str+="<div class='pa-gridItem' id='mdres-"+i+"'>";							// Div start
		str+="<div class='pa-gridPic'>";											// Pic div start
		if (o.src)																	// If a thumbnail defined
			str+="<img src='"+o.src+"' width='100%'>";								// Add it
		str+="</div><span style='color:#27ae60'>"+(o.id)+". </span>";				// Add pic num
		str+=this.ShortenString(o.title,70);										// Add title
		str+="</div>";																// Close div	
		}
	$("#mdAssets").html(str);														// Add results to panel
	$('[id^="mdres-"]').off();														// Remove old handlers
	$('[id^="mdres-"]').on("click",function(e) {									// ON CLICK ON ITEM
		var id=$(this).prop("id").substr(6);										// Isolate id
		_this.Preview(id);															// Preview
		});
}

CImageFind.prototype.Preview=function(num)												// PREVIEW RESULT
{
	var o=this.data[num];																// Point at item
	if (o.src) {																		// If a pic
		$("#addImg").prop("src",o.src);													// Show it
		$("#zoomaddBut").css("display","inline-block");									// Show zoom button
		}
	$("#addUrl").val(o.src);															// Src
	$("#addTitle").val(o.title);														// Title
	$("#addDesc").val(o.desc);															// Desc
	$("#addLink").val(o.html);															// Link
	if (o.era)	$("#addEra")[0].selectedIndex=o.era;									// Set it
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

CImageFind.prototype.LoadingIcon=function(mode, size, container)					// SHOW/HIDE LOADING ICON		
{
	container=container ? "#"+container: "#bodyDiv";								// If no container spec'd, use dialog
	if (!mode) {																	// If hiding
		$("#sf-loadingIcon").remove();												// Remove it
		return;																		// Quit
		}
	var str="<img src='img/loading.gif' width='"+size+"' ";							// Img
	str+="id='sf-loadingIcon' style='position:absolute;top:calc(50% - "+size/2+"px);left:calc(50% - "+size/2+"px);z-index:5000'>";	
	$(container).append(str);														// Add icon to container
}

CImageFind.prototype.Sound=function(sound, mute)									// PLAY SOUND
{
	var snd=new Audio();															// Init audio object
	if (!snd.canPlayType("audio/mpeg") || (snd.canPlayType("audio/mpeg") == "maybe")) 
		snd=new Audio("img/"+sound+".ogg");											// Use ogg
	else	
		snd=new Audio("img/"+sound+".mp3");											// Use mp3
	if (!mute)	{																	// If not initing or muting	
		snd.volume=50/100;															// Set volume
		snd.play();																	// Play it
		}
	}

CImageFind.prototype.ShortenString=function(str, len)								// SHORTEN A STRING TO LENGTH
{
	if (str && str.length > len)													// Too long
		str=str.substr(0,(len-3)/2)+"..."+str.slice((len-3)/-2);					// Shorten	
	return str;																		// Return string}
}
