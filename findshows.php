<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
header("Access-Control-Allow-Origin: *");
require_once('config.php');
			
	$ver=0;
	$q="";
	$email="";
	if (isSet($_GET['ver'])) 		 							// If set
		$ver=addslashes($_GET['ver']);							// Get deleted
	if (isSet($_GET['q'])) 		 								// If set
		$q=strtolower(addslashes($_GET['q']));					// Get query
	if (isSet($_GET['email'])) 		 							// If set
		$email=strtolower(addslashes($_GET['email']));			// Get query
	$query="SELECT * FROM qshow WHERE version = '$ver'";		// Query start
	if ($ver == 0)	$query.=" OR version = '1'";				// Version 0 should load 1 also
	if ($q)	{													// If a query
		$query.=" AND (LOWER(title) LIKE '%$q%'";				// Add title search to query
		$query.=" OR LOWER(script) LIKE '%$q%')";				// Add script search to query
		}
	if ($email)													// If an email address
		$query.=" AND email = '$email'";						// Add email search to query
	$query.=" ORDER by date DESC";								// Sort
	$result=mysql_query($query);								// Query
	if ($result == false) {										// Bad query
		print("-1\n");											// Return error
		exit();													// Quit
		}

	$num=mysql_numrows($result);								// Get num rows
	print("[");													// Open array
	for ($i=0;$i<$num;$i++) {									// For each row
		print("{\"id\":\"".mysql_result($result,$i,"id")."\",");		// Id
		print("\"title\":\"".mysql_result($result,$i,"title")."\",");	// Title
		print("\"date\":\"".mysql_result($result,$i,"date")."\"}");		// Date
		if ($i != $num-1)	print(",\n");						// Comma
		}		
	print("\n]");												// Close function
	mysql_close();												// Close session
?>
