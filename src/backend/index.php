<?php

header('Access-Control-Allow-Origin: http://makemegod.com');

$god = base64_decode($_GET['god']);
$filename = str_replace(" ", ".", $god);

if (!is_dir("./bibles")) {
  mkdir("./bibles");
  chmod("./bibles", 777);
}

if (!is_dir("./workfiles")) {
  mkdir("./workfiles");
  chmod("./workfiles", 777);
}

//Remove non-ascii signs from file names
$filename = preg_replace("[^A-Za-z0-9]", "", $filename);

// Some fail states
if(strlen($filename) == 0 || strlen($god) == 0 || strlen($god) > 50) {
  http_response_code(400);
  echo("no_god_or_god_too_long");
  exit;
}

// Create the file names etc.
$thefile = "bibles/".$filename.".pdf";
$workingfile = "bibles/".$filename.".creating";
$command = "bash bible.sh ".$filename." > err.txt 2>&1 &";

if(!is_file($thefile) && !is_file($workingfile)) // Start working
{
  fopen($workingfile , "w"); // Create file to say we're working on it.
  echo exec($command); // Run the bash script
	http_response_code(202); // "Working on it"
  echo "in_progress"; // Gotta return something
}
elseif(is_file($thefile)) // Done!
{
  http_response_code(201); // "Created"
  touch($thefile); // Update date of file
  if(is_file($workingfile)) {
    unlink($workingfile); // Delete "am working on this"-file
  }
  echo "done";
}
elseif(!is_file($thefile) && is_file($workingfile)) // Working on it
{
  http_response_code(202);
	echo "working";
}
else {
  http_response_code(500);
  unlink($workingfile);
  unlink($thefile);
  echo "shit";
}
