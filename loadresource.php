<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config.php');
	
	$id=$_GET['id'];												// Get ID
	$i=$id=addEscapes($id);											// ID
	$end=$id+1;
	for ($id=$i;$id<$end;$id++) {
		$query="SELECT * FROM resource WHERE id = '$id'";			// Make query
		$result=mysql_query($query);								// Run query
		if (($result == false) || (!mysql_numrows($result)))		// Error
				print("Error:".$id);
		else{														// Good result
			$str="GetResource({ id:".$id.",";									// Id
			$str.="title:\"".mysql_result($result,0,"title")."\",";	// Title
			$str.="desc:\"".mysql_result($result,0,"who").".";		// Who
			$str.=mysql_result($result,0,"what")." \",";			// What
			$str.="src:\"".mysql_result($result,0,"src")."\",";		// Src
			$str.="link:\"".mysql_result($result,0,"link")."\",";	// Link
			$str.="std:".mysql_result($result,0,"standard").","; 	// Std
			$str.="era:".mysql_result($result,0,"era")." })"; 		// Era
			print("id:".mysql_result($result,0,"src"));				// Src
			print($str);											// Print JSONP	
			$check_url_status = check_url(mysql_result($result,0,"src"));

/*			if ($check_url_status != '200') {						// Bad link
				$query="DELETE FROM resource WHERE id = '$id'";		// Make query
				$result=mysql_query($query);						// Run query
				print("   DELETED");
			}
*/
		}	
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

	function check_url($url) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HEADER, 1);
		curl_setopt($ch , CURLOPT_RETURNTRANSFER, 1);
		$data = curl_exec($ch);
		$headers = curl_getinfo($ch);
		curl_close($ch);
		return $headers['http_code'];
	}	

?>