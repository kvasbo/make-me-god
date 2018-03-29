<?php

session_start();
$id = $_SESSION[id];
$god = base64_decode($_GET['god']);
$filename = str_replace(" ", ".", $god);

//Remove non-ascii signs from file names
$filename = preg_replace("[^A-Za-z0-9]", "", $filename);

if(strlen($filename) == 0) $filename = md5(mktime("ymdhis"));

$thefile = "../bibles/".$filename.".pdf";;

//Create file
if($_SESSION[filename] != $filename && !is_file($thefile) && strlen($god) > 0)
{
	$_SESSION[filename] = $filename;
	
	// exec("/bin/bash ../bible.sh ".$filename." > /dev/null 2>&1 &");
	exec("/bin/bash ../bible.sh ".$filename);
	
	echo "Starting Bible creation process...";
}
elseif(is_file($thefile))
{
	touch($thefile);
	echo "Your Bible is ready. Click <a href='bibles/$filename.pdf'>here</a> to download.";
	$_SESSION[progress] = "";
}
else
{
	echo "Creation is underway. Please wait.";
	echo $_SESSION['progress'];
	$_SESSION[progress] = $_SESSION[progress].".";
}

?>
