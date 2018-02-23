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
	this.view="Grid";																// Start with grid
	this.previewMode="";															// Mode of preview ( 'Preview', '')
	this.curItem=-1;																// Currently selected item
}

CImageFind.prototype.ImportDialog=function(maxDocs, callback, mode)				// IMPORTER DIALOG
{
	var i;
	var _this=this;																	// Save context
	this.maxDocs=maxDocs;															// Maximum docs to load
	$("#dialogDiv").remove();														// Remove any dialogs
	var collections=["Web","PrimaryAccess","Library of Congress","Wikimedia","Images"];		// Supported collections
	var str="<hr style='margin-top:12px'><p style='text-align:right'>";
	str+="<span style='float:left'>&nbsp;<i><span id='numItemsFound'>No</span> items found</i></span>";		// Number of items
	str+="Search for: <input class='pa-is' id='mdFilter' type='text' value='"+this.filter+"' style='width:150px;height:17px;vertical-align:0px'>";
	str+="&nbsp;&nbsp;From: "+MakeSelect("mdType",false,collections,this.type);
	str+="</p><div id='mdAssets' class='pa-dialogResults'></div>";						// Scrollable container
	str+="<br>View as: "+MakeSelect("mdView",false,["Grid","List"],this.view);
	str+="&nbsp;&nbsp;&nbsp;NCSS standard: "+MakeSelect("mdView",false,["Grid","List"],this.view);
	str+="&nbsp;&nbsp;&nbsp;Era: "+MakeSelect("mdView",false,["Grid","List"],this.view);
	str+="<div style='float:right;display:inline-block'><div id='dialogOK' style='display:none' class='pa-greenbs'>Get picture</div>&nbsp;&nbsp;";
	str+="<div id='dialogCancel' class='pa-bs'>Cancel</div></div>";
	$("#bodyDiv").append(str+"</div>");	
	
	$("#dialogOK").on("click", function() {											// ON OK BUT
					$("#previewDiv").remove();										// Remove preview
					_this.previewMode="";											// No mode
					if (callback)	callback(_this.data[_this.curItem]); 			// If callback defined, run it and return  data
					});

	$("#dialogCancel").on("click", function() {										// ON CANCEL BUT
					$("#previewDiv").remove();										// Remove preview
					_this.previewMode="";											// No mode
					});

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
		$("#mdUser").on("change", function() {										// ON CHANGE USER
			_this.user=$(this).val();												// Save for later											
		 	LoadCollection();														// Load it
			});
   	$("#mdView").on("change", function() {											// ON CHANGE VIEW
			_this.view=$(this).val();												// Save for later											
		 	LoadCollection();														// Load it
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
	if (this.view == "List")														// If showing List
		this.DrawAsList();															// Draw row view
	else																			// Grid view
		this.DrawAsGrid();															// Draw
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SHOW RESULTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

CImageFind.prototype.DrawAsList=function()											// SHOW RESULTS AS LIST
{
	var i;
	var _this=this;																	// Save context
	var trsty=" class='pa-listItem'  onclick='CImageFindObj.Preview(this.id.substr(6))'";	// Row style
	var str="<table style='width:100%;text-align:left'>";							// Header row
	str+="<tr style='font-weight:bold;cursor:url(img/sortcur.gif),ns-resize'><td style=width:100%' id='mdh-title'>Title</td><td id='mdh-date'>Date</td><td id='mdh-id'>&nbsp;ID&nbsp;</td><td  id='mdh-user'>&nbsp;User</td></tr>";
	str+="<tr><td colspan='4'><hr></td></tr>";
	
	for (i=0;i<this.data.length;++i) {												// For each doc returned
		o=this.data[i];																// Point at doc
		str+="<tr id='mdres-"+i+"'"+trsty+"><td>"+this.ShortenString(o.title,80)+"</td>";	// Add title
		str+="<td>"+o.date;															// Add date
		str+="</td><td>&nbsp;"+o.id+"<td>"											// Add id
		if (o.user)																	// If a user spec'd
			str+=this.ShortenString(o.user,12);										// Add user		
		str+="</td></tr>";															// Close line	
		}
	str+="</table>";																// Close table
	
	$("#mdAssets").html(str);														// Add results
	
	$('[id^="mdh-"]').off();														// Remove old handlers

	$('[id^="mdh-"]').on("click",function(e) {										// ON CLICK ON HEADER
		var field=$(this).prop("id").substr(4);										// Isolate field
		_this.FormatItems(null,field);											// Sort by field
		});
}

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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PREVIEW
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


CImageFind.prototype.Preview=function(num)												// PREVIEW RESULT
{
	var _this=this;																		// Save context
	var o=this.data[num];																// Point at item
	this.curItem=num;																	// Current item
	this.previewMode="Preview";															// Preview mode
	$("#previewDiv").remove();															// Remove any old ones
	$("#dialogOK").css("display","inline-block");										// Show add button

	for (i=0;i<this.data.length;++i)													// For each result
		$("#mdres-"+i).css({ "color":"#000", "font-weight":"normal" });					// Make default
	$("#mdres-"+num).css({ "color":"#009900", "font-weight":"bold" });					// Highlight

	var h=368, w=244;																	// Get size												
	var maxHgt=window.innerHeight-100;													// Max height
	var maxWid=window.innerWidth-200;													// Max width
	var y=$("#mdAssets").offset().top;													// Top
	var x=$("#mdAssets").offset().left+901-w;											// Left
	
	var str="<div class='unselectable pa-prevDiv' id='previewDiv' style='";				// Div head
	str+="height:"+h+"px;width:"+w+"px;";												// Size
	str+="left:"+x+"px;top:"+y+"px'>";													// Position
	str+="<div class='pa-prevId'>Mandala item "+o.id+"</div>";							// Show id
	if (o.title)																		// If a title
		str+="<p class='pa-dialogTitle'>"+o.title+"</p>";								// Show title 
	if (o.ajax && o.ajax.match(/\.png|.gif|\.jpg|.jpeg/i)) 								// An image
		str+="<div id='previewImg' style='width:"+(w-8)+"px;overflow-y:auto;padding:12px;padding-top:0'><img id='myImg' style='width:100%' src='"+o.ajax+"'></div>";
	else
		str+="<iframe frameborder='0'style='width:100%;padding:12px;padding-top:0;height:210px' src='"+o.ajax+"'/>";
	str+="<div>";
	if (o.summary)	str+="<p>"+o.summary+"</p>";										// Add summary
	if (o.date)		str+="<br>"+o.date;													// Add date
	if (o.user)		str+=" by "+o.user;													// Add user
	if (o.html)		str+="<p><a target='_blank' href='"+o.html+"'><b>View webpage</b></a></p>"	// Add link to page
	$("body").append(str+"</div></div>");												// Add content
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
