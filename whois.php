<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config.php');
			
	$query="SELECT * FROM qshow";								// Query 
	if (isSet($_GET['v'])) 		 								// If v set
		$query.=" WHERE version = '".$_GET['v']."'";			// Add ver
	$query.=" ORDER by date DESC";								// Sort
	$result=mysql_query($query);								// Query
	if ($result == false) {										// Bad query
		print("Error getting projects");						// Return error
		exit();													// Quit
		}
	$num=min(mysql_numrows($result),200);						// Get num rows, cap at max
	$pass=$_GET['pass'];										// Password
	
	print("<font face='sans-serif'>");							// Font
	print("<b>The current 200 PrimaryAccess  projects</b>:<br>");	// Header
	for ($i=0;$i<$num;++$i) {									// For each record
		print("<blockquote>");									// Indent
		print(mysql_result($result,$i,"date")." | ");			// Date
		print(mysql_result($result,$i,"email")." | ");			// Email
		print("<a href='//www.viseyes.org/pa?".mysql_result($result,$i,"id")."*' target='blank'>ID = ".mysql_result($result,$i,"id")."</a> | ");	// Id
		print(mysql_result($result,$i,"title"));				// Title
		if ($pass)												// If wanting password
			print(" | ".mysql_result($result,$i,"password"));	// Password
		print("<br></blockquote>");								// BR
		}
	print("</font>");											// Font
	mysql_close();												// Close session
?>
	
