<?php
$uid = NULL;

if ($uid = @$_COOKIE['eknid']) {
    //uid laetud cookiest
} else {
	//cookiet pole..
	
	if ($uid = @$_GET['u']) {
		//uid laetud URLi parameetrist
		header('X-ulr-uid: '. $uid);
	} else {
		$uid = uniqid();
		header('X-ulr-gen: '. $uid);
	}
	
    //loome cookie
    setcookie(
        "eknid",
        $uid,
        mktime(0, 0, 0, 11, 25, 2017)
    );
}
?>
