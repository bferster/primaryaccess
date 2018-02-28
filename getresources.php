<?php
header('Cache-Control: no-cache, no-store, must-revalidate'); 
header('Expires: Sun, 01 Jul 2005 00:00:00 GMT'); 
header('Pragma: no-cache'); 
require_once('config.php');
	
	$q=addEscapes($_GET['q']);												
	$era=addEscapes($_GET['era']);												
	$query="SELECT * FROM resource WHERE ";							// Make query
	$str="GetPaRes([";												// Function
	if ($q) {														// If q spec'd
		$query.="(title LIKE '%$q%' ";								
		$query.="OR who LIKE '%$q%' OR what LIKE '%$q%')";
		}
	if ($era && $q)													// If both
		$query.=" AND ";											// Add AND
	if ($era)														// If era spec'd
		$query.="era = '$era'";										// Match it
	$query.=" LIMIT 1000";											// Limit
	$result=mysql_query($query);									// Run query
	if (($result != false) && (mysql_numrows($result)))	{			// No Error
		$num=mysql_numrows($result);								// Get num rows
		for ($i=0;$i<$num;$i++) {									// For each row
			$str.="{id:\"".addEscapes(mysql_result($result,$i,"id"))."\",";			// Id
			$str.="title:\"".addEscapes(mysql_result($result,$i,"title"))."\",";	// Title
			$str.="desc:\"".addEscapes(mysql_result($result,$i,"who"))." ";			// Who
			$str.=addslashes(mysql_result($result,$i,"what"))."\",";				// What
			$str.="src:\"".addEscapes(mysql_result($result,$i,"src"))."\",";		// Src
			$str.="link:\"".addEscapes(mysql_result($result,$i,"link"))."\",";		// Link
			$str.="std:\"".addEscapes(mysql_result($result,$i,"standard"))."\","; 	// Std
			$str.="era:\"".addEscapes(mysql_result($result,$i,"era"))."\"";// Era
			$str.="}";
			if ($i != $num-1)										// Not last one
				$str.=",";											// Add comma
			}
		}
	print($str."])");												// Print JSONP	
	mysql_close();													// Close

	function addEscapes($str)									// ESCAPE ENTRIES
	{
		if (!$str)												// If nothing
			return $str;										// Quit
		$str=addslashes($str);									// Add slashes
		$str=str_replace("\r","",$str);							// No crs
		$str=str_replace("\n","",$str);							// No lfs
		return $str;
	}

/*	Rupert, Idaho. Former CCC (Civilian Conservation Corps) camp now under FSA (Farm Security Administration) management. Japanese-Americans taking down their flag in the evening
*/
?>
