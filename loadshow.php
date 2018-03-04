<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config.php');
	
	$id=$_GET['id'];											// Get ID
	$id=addEscapes($id);										// ID
	if (strlen($id) == 9) {										// Must be a key
		$id[0]=($id[0]-0)&7;									// Get only 1st 3 bits of 1st char
		$query="SELECT * FROM qshow WHERE email = '$id'";		// Look for key in email
		$result=mysql_query($query);							// Run query
		if (($result == false) || (!mysql_numrows($result))) {	// Not found
			$oid=$id;											// Save original
			$nn=$id[0];											// Get shift order
			$id=substr($id,3);									// Trim order and student
			while ($nn-- > 0) 									// For each shift
				$id=substr($id,1,5).$id[0];						// Shift-left
			$id=intval($id);									// Number
			$query="SELECT * FROM qshow WHERE id = '$id'";		// Make query
			$result=mysql_query($query);						// Run query
			if (($result == false) || (!mysql_numrows($result))) // Error
				print("LoadShow({ \"qmfmsg\":\"error 1\"})");
			else{												// Good result
				$script=mysql_result($result,0,"script");		// Get script
				$title=mysql_result($result,0,"title");			// Get title
				$query="INSERT INTO qshow (email, password, title, script, version) VALUES ('";
				$query.=addEscapes($oid)."','";
				$query.=addEscapes($oid)."','";
				$query.=addEscapes($title)."','";
				$query.=addEscapes($script)."','";
				$query.=addEscapes(0)."')";
				$result=mysql_query($query);							
				if ($result == false)							// Bad save
					print("LoadShow({ \"qmfmsg\":\"error 2\"})");
				else
					$id=mysql_insert_id();						// Get ID of new resource
				}
			}
		else													// Found it
			$id=mysql_result($result,0,"id");					// Load this id
		}														// Key closure
	
	$query="SELECT * FROM qshow WHERE id = '$id'";				// Make query
	$result=mysql_query($query);								// Run query
	if (($result == false) || (!mysql_numrows($result)))		// Error
		print("LoadShow({ \"qmfmsg\":\"error 3\"})");			// Show it
	else{														// Good result
		$p=mysql_result($result,0,"script");					// Get script
		$p=substr($p,0,strlen($p)-3).",\"newId\":".$id."})";	// Add id
		print($p);												// Send script
		}
	mysql_close();												// Close
	
	function addEscapes($str)									// ESCAPE ENTRIES
	{
		if (!$str)												// If nothing
			return $str;										// Quit
		$str=addslashes($str);									// Add slashes
		$str=str_replace("\r","",$str);							// No crs
		return $str;
	}
	
?>