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
	this.type="Images";																// Start with Images
	this.previewMode="";															// Mode of preview ( 'Preview', '')
	this.curItem=-1;																// Currently selected item
	this.era="";																	// Era
	this.ncssEras=[ "Any",																// NCSS eras
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

CImageFind.prototype.ImportDialog=function(maxDocs, callback, mode)				// IMPORTER DIALOG
{
	var i;
	var _this=this;																	// Save context
	this.maxDocs=maxDocs;															// Maximum docs to load
	$("#dialogDiv").remove();														// Remove any dialogs
	var collections=["Web","PrimaryAccess","Library of Congress","Wikimedia","Images"];			// Supported collections
	var str="<hr style='margin-top:12px'><p><span class='pa-bodyTitle'>Find pictures</span>";	// Title
	str+="<span style='float:right'>";															// Hold controls
	str+="Search for: <input class='pa-is' id='mdFilter' type='text' value='"+this.filter+"' style='width:200px;height:17px;vertical-align:0px'>";
	str+="&nbsp;&nbsp;From: "+MakeSelect("mdType",false,collections,this.type);					// From where
	str+="</span></p><div id='mdAssets' class='pa-dialogResults'></div>";						// Scrollable container
	str+="<br>Limit by NCSS era: "+MakeSelect("mdEra",false,this.ncssEras,this.era); 			// Add eras
	str+="<i><span style='float:right'><span id='numItemsFound'>No</span> items found</i></span>"; // Number of items
	$("#bodyDiv").append(str+"</div>");	
	
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
			_this.era=$(this).val();												// Save era										
			});
			
 	function LoadCollection() {													// LOAD COLLECTION FROM DB
		var str;
		_this.LoadingIcon(true,64);													// Show loading icon
		var type=_this.type;														// Get type to show
		if (type == "Images") type="Picture";										// Images are picture
		var search="asset_type%3A%22"+type.toLowerCase()+"%22";						// Add asset type						
		if (_this.filter) {															// If a filter spec'd
			str="%22*"+_this.filter.toLowerCase()+"*%22";							// Search term
			search+=" AND (title%3A"+str;											// Look at title
			search+=" OR summary%3A"+str+")";										// Or summary
			}
		if (_this.filterCollect) {													// If a collection filter spec'd
			str="%22*"+_this.filterCollect.toLowerCase()+"*%22";					// Search term
			search+=" AND collection_title%3A"+str;									// Or collection title
			}
		if (_this.user) 															// If a user spec'd
			search+=" AND node_user%3A*"+_this.user+"*";							// Look at user
		var url="https://ss395824-us-east-1-aws.measuredsearch.com/solr/kmassets/select?"+"q="+search + 
   				 "&fl=*&wt=json&json.wrf=?&rows="+_this.maxDocs+"&limit="+_this.maxDocs;

		$.ajax( { url: url,  dataType: 'jsonp', jsonp: 'json.wrf' }).done(function(data) {
			   		_this.FormatItems(data);
			   		});
		}
}																					// End closure

CImageFind.prototype.FormatItems=function(data, sortBy)							// SHOW ITEMS
{
	var i,r,o;
	var _this=this;																	// Save context
	this.LoadingIcon(false);														// Hide loading icon
	this.rawData=data;																// Save raw data
	if (data) {																		// If not just sorting
		this.data=[];																// New results store 
		for (i=0;i<data.response.docs.length;++i) {									// For each doc returned
			r=data.response.docs[i];												// Point at it
			o={ title:"No title", desc:""};											// Create obj												
			o.date=r.timestamp.substr(5,2)+"/"+r.timestamp.substr(8,2)+"/"+r.timestamp.substr(0,4);	// Munge date
			if (r.title)															// If a title
				o.title=r.title[0];													// Extract it
			else if (r.caption)														// If a caption defined but no title
				o.title=r.caption;													// Use it
			o.id=r.id;																// Save id
			o.thumb=r.url_thumb;													// Save thumb
			if (o.thumb)	o.thumb=o.thumb.replace(/dev\-/,"");					// Remove 'dev-' prefix, if there
			o.ajax=r.url_ajax;														// Save ajax
			if (o.ajax)		o.ajax=o.ajax.replace(/dev\-/,"");						// Remove dev
			o.json=r.url_json;														// Save json
			if (o.json)		o.json=o.json.replace(/dev\-/,"");						// Remove dev
			o.html=r.url_html;														// Save html
			if (o.html)		o.html=o.html.replace(/dev\-/,"");						// Remove dev
			o.embed=r.url_embed;													// Add embed 
			if (o.embed) 	o.embed=o.embed.replace(/dev\-/,"");					// Remove dev
			if ((r.asset_type == "picture") || (r.asset_type == "image")) {			// An image
				if (r.url_huge)			o.ajax=r.url_huge.replace(/dev\-/,"");		// If huge, set url and remove 'dev-' prefix
				else if (r.url_large)	o.ajax=r.url_large.replace(/dev\-/,"");		// Else use large
				else if (r.url_normal)	o.ajax=r.url_normal.replace(/dev\-/,"");	// Else use normal
				else 					o.ajax=o.thumb;								// Else use thumb
				}
			o.kmap=r.kmapid;														// Save kmap array
			o.user=r.node_user;														// Add user
			o.summary=r.summary;													// Add summary
			o.type=r.asset_type;													// Add type
			this.data.push(o);														// Add result to array
			}
		}
	else if (this.data) {															// Just sorting and some data
		var order=1;																// Assume ascending
		if (this.data[0][sortBy] < this.data[this.data.length-1][sortBy])			// Ascending already
			order=-1;																// Make it descending
		this.data.sort(function(a,b) { 												// Reshuffle chairs on Titanic
				if (a[sortBy] < b[sortBy])    	return -1*order;
				else if (a[sortBy] > b[sortBy])	return 1*order;
				else 			   				return 0;
				});					
		}
	$("#numItemsFound").text(this.data.length);										// Show number of results
	this.DrawAsGrid();																// Draw
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
		if (o.thumb)																// If a thumbnail defined
			str+="<img src='"+o.thumb+"' width='100%'>";							// Add it
		str+="</div><span style='color:#27ae60'>"+(i+1)+". </span>";				// Add pic num
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
	if (o.ajax)																			// If a pic
		$("#addImg").prop("src",o.ajax);												// Show it
	$("#addUrl").val(o.ajax);															// Src
	$("#addTitle").val(o.title);														// Title
	$("#addDesc").val(o.desc);															// Desc
	$("#addLink").val(o.html);															// Link
	$("#addEra").val(this.era == "Any"? "" : this.era );								// Era
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
