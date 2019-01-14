<?php
header('Access-Control-Allow-Origin: *');

session_start();
$id = $_SESSION['id'];
$god = base64_decode($_GET['god']);
$filename = str_replace(" ", ".", $god);

//Remove non-ascii signs from file names
$filename = preg_replace("[^A-Za-z0-9]", "", $filename);

if(strlen($filename) == 0) $filename = md5(mktime("ymdhis"));

$thefile = "/var/www/html/bibles/".$filename.".pdf";
$command = "bash /var/www/html/bible.sh ".$filename." > /var/www/html/workfiles/err.txt 2>&1 &";

/*
echo "\r\ncommand: ".$command;
echo "\r\ngod: ".$god;
echo "\r\nfilename: ".$filename;
echo "\r\nthefile: ".$thefile;
*/

//Create file
if($_SESSION['filename'] != $filename && !is_file($thefile) && strlen($god) > 0)
{
	$_SESSION['filename'] = $filename;

	echo exec($command);
	
	echo "Starting Bible creation process...";
}
elseif(is_file($thefile))
{
	touch($thefile);
	echo "Your Bible is ready. Click <a href='bibles/$filename.pdf'>here</a> to download.";
	$_SESSION['progress'] = "";
}
else
{
	echo "Creation is underway. Please wait.";
  echo $_SESSION['progress'];
	$_SESSION['progress'] = $_SESSION['progress'].".";
}

?>
