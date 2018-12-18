<?php
session_cache_expire(3600);
session_start();

//Housekeeping
$days = "10"; // delete all files older than this many days
$seconds = ($days*24*60*60);

$dir    = './bibles/';
$files = scandir($dir);

if(count($files) > 5000)
{
foreach ($files as $num => $fname){
	if (!is_dir("{$dir}{$fname}") && file_exists("{$dir}{$fname}") && ((time() - filemtime("{$dir}{$fname}")) > $seconds)) {
		$mod_time = filemtime("{$dir}{$fname}");
		unlink("{$dir}{$fname}");
	}
}
}

if(!isset($_SESSION['ip']))
{
	$_SESSION['ip'] = $_SERVER['REMOTE_ADDR']; 
	$_SESSION['id'] = md5($_SESSION['ip'].date("dmyhis"));
}

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">
   
<html>
      
<head>
<title>Make Me God</title>
<link rel = "stylesheet" type="text/css" href="style.css">
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<script src="prototype.js" type="text/javascript"></script>

<?PHP
if($_POST['create'] == "y" && strlen($_POST['god']) > 0)
{
	//Notify me by mail
	$mail="audun@kvasbo.no";
	$title="[makemegod] Bible ordered: ".$_POST['god'];
	$message="Bible ordered with the name ".$_POST['god'];
	mail($mail, $title, $message);


	$god = addslashes(strip_tags($_POST['god']));
	$god = base64_encode($god);
?>

<script type="text/javascript">

Event.observe(window, 'load', function() {
	var updater = new Ajax.PeriodicalUpdater('readyfile', '/ajax/bibelforlaget.php?god=<?PHP echo $god; ?>', 
	{
  		method: 'get', frequency: 1, decay: 0
  });
})
</script>

<?PHP
}

?>
</head>

<body>

<div id='logo'>
<a href="index.php"><img src="logo.png" alt="logo"></a>
</div>

<?PHP

if($_POST['create'] != "y")
{
	$_SESSION['progress'] = "";
	
?>
<div id='inputbox'>

<form method='post' id='godform' name='godform'  action='index.php'>
<input type='text' id='god' value=""  maxlength='30' name='god'><br>
<input type='hidden' name='create' value='y'>
<input type='submit' value='Make me god!'>
</form>

</div>

<div id='readyfile'>
Enter any name to create a bible with your chosen name substituted for "God".<br>
Currently, the script accepts A-Z, a-z, Norwegian characters, space and 0-9.
</div>

<?PHP
}
else {
?>

<div id='readyfile'>Starting process.</div>

<?PHP
}
?>

<div style="text-align: center; margin-top: 50px">
&copy; <?PHP echo date("Y"); ?> <a href="http://www.kvasbo.no">Audun Kvasb&oslash;</a>
</div>

</body>
</html>
