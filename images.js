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
	var collections=["PrimaryAccess","Web","WikiMedia","Library of Congress", "National Archives"];// Supported collections
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
			
 	function LoadCollection() {													// LOAD COLLECTION 

		if (CImageFindObj.type == "PrimaryAccess") {								// From PA DB				
			var era=CImageFindObj.era;												// Index of era
			LoadingIcon(true,32,"mdAssets");										// Show loading icon
			var url="//viseyes.org/pa/getresources.php";
			if (CImageFindObj.filter && CImageFindObj.era) url+="?q="+CImageFindObj.filter+"&era="+era;	// Q and era
			else if (CImageFindObj.filter) url+="?q="+CImageFindObj.filter;			// Q
			else if (CImageFindObj.era) url+="?era="+era;							// Era
			$.ajax( { url: url,  dataType: 'jsonp' });
			}
		else if (CImageFindObj.type == "WikiMedia") {								// From  Wikimedia			
			LoadingIcon(true,32,"mdAssets");										// Show loading icon
			$.ajax( { url: "//commons.wikimedia.org/w/api.php",
				jsonp: "callback", 	dataType: 'jsonp', 
				data: { action: "query", list: "search", srsearch: "javascript",  format: "json",
						gimlimit:300, redirects:1, generator:"images", prop:"imageinfo", iiprop:"url|mediatype",	
						titles:CImageFindObj.filter
						},
				xhrFields: { withCredentials: true },
				success: function(res) {											// When loaded
					var i=0,o,u,data=[];
					if (res && res.query && res.query.pages) {						// If valid
						for (var p in res.query.pages)	{							// For each page
							p=res.query.pages[p];									// Turn into actual pointer to obj
							u=p.imageinfo[0];										// Point at URL section
							if (u.mediatype != "BITMAP")							// In not a bitmap
								continue;											// Ignore
							o={desc:"", era:"", link:"", title:"No title",id:++i};	// Shell
							if (p.title)											// If a title
								o.title=p.title.match(/(?<=File:).+?(?=\.)/)[0];	// Strip
							o.src=u.url;											// Set url
							data.push(o);											// Add to arrat
							}
						}
					GetPaRes(data);													// Add to viewer
					},
				error: function(res) {												// On error
					trace(res)
					LoadingIcon();													// Hide loading icon
					}
				});
			}
			else if (CImageFindObj.type == "Web") {									// Web
				GetPaRes([]);														// Add to viewer
				$("#mdAssets").html("Support coming soon...");						// Add results to panel
				}
			else if (CImageFindObj.type == "Library of Congress") {					// LOC
				LoadingIcon(true,32,"mdAssets");									// Show loading icon
				$.ajax( {   url: "https://www.loc.gov/photos?fo=json&c=300",
					jsonp: "callback", 	dataType: 'jsonp', 
					data: { q: CImageFindObj.filter },
					xhrFields: { withCredentials: true },
					success: function(res) {											// When loaded
						var i,o,data=[];
						for (i=0;i<res.results.length;++i) {							// For each result
								p=res.results[i];										// Point a obj
								if (!p.image_url)										// If no image
									continue;											// Skip				
								if (!p.image_url.length)								// If no image
									continue;											// Skip				
								o={desc:"", era:"", link:"", title:"No title",id:i};	// Shell
								o.src=p.image_url[Math.max(0,p.image_url.length-1)];	// Get last
								if (p.title)	o.title=p.title;						// Add title
								if (p.url)		o.link=p.url;							// Add Link
								data.push(o);											// Add to data
								}
							GetPaRes(data);												// Add to viewer
							},
						error: function(res) {											// On error
							trace(res)
							LoadingIcon();												// Hide loading icon
							}
					});
				}
			else if (CImageFindObj.type == "National Archives") {					// NARA
				GetPaRes([]);														// Add to viewer
				$("#mdAssets").html("Support coming soon...");						// Add results to panel
				}
			}			
	}																					// End closure

	function GetPaRes(data)															// HADLE JSONP AJAX LOAD
	{
		var i,o;
		LoadingIcon(false);															// Hide loading icon
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
		str+=ShortenString(o.title,70);										// Add title
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
