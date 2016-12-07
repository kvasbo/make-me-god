<?php

$handle = @fopen("bible.txt", "r");
$out = fopen("output.txt","w");

$tp = "foo";
$tv = "bar";


if ($handle) {
    while (!feof($handle)) {
        
    	$l = fgets($handle, 4096);
       
		$towrite = true;

    	//Fikser de forskjellige bøkene.
        if(substr($l,0,4) == "Book"){
         	
	        $pat[0] = "/^\s+/";
			$pat[1] = "/\s{2,}/";
			$pat[2] = "/\s+\$/";
			$rep[0] = "";	
			$rep[1] = " ";
			$rep[2] = "";
		
			$outp = preg_replace($pat,$rep,$l);
        	
			$outp = substr($outp,8);
			
			$outp = "\chapter{".$outp."}\n";
			
        	fwrite($out, $outp);
        	
        	$towrite = false;
        	
        }
        
        //the rest
        if(substr($l,0,1) == "0")
        {
        	$v = substr($l,0,3);
        	$p = substr($l,4,3);
        	$l = substr($l,8);
        	       
			       	
        	if($tv != $v && strlen($v) > 0)
        	{
        		$section = "\n\section*{".$v."}\n";
        		fwrite($out, $section);
        		$tv = $v;
           	}
        	
           	if(strlen($p) > 0)
           	{
	        	$s = "\n\\textbf**$p@@\n";
	        	fwrite($out,$s);       
           	}	
        }
        
        
        	$pat[0] = "/^\s+/";
			$pat[1] = "/\s{2,}/";
			$pat[2] = "/\s+\$/";
			$rep[0] = " ";	
			$rep[1] = " ";
			$rep[2] = "";
		
			$l = preg_replace($pat,$rep,$l);
			
			$god = "dundun";
			
			if(false)
			{
				$l = str_ireplace("the lord god", $god, $l);
				$l = str_ireplace("lord god", $god, $l);
				$l = str_ireplace("the lord", $god, $l);
				$l = str_ireplace("god", $god, $l);
				$l = str_ireplace("lord", $god, $l);
				
			}
					
			
        	if($towrite) fwrite($out,$l);
        
                
        
    }
    fclose($handle);
}


?>
