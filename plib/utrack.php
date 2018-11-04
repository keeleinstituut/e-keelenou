<?php
$uid = NULL;
$iscookie = false;

if ($uid = @$_COOKIE['eknid']) {
    //uid laetud cookiest
    $iscookie = true;

	if ($u = @$_GET['u']) {
		//log
	}

} else {
	//cookiet pole..
	
	if ($uid = @$_GET['u']) {
		//uid laetud URLi parameetrist
		//header('X-ulr-uid: '. $uid);
	} else {
		$uid = uniqid();
		//header('X-ulr-gen: '. $uid);
	}
	
}

//loome/updateme cookie
setcookie(
	"eknid",
	$uid,
	mktime(0, 0, 0, 11, 25, 2019),
	'/'
);


?>
