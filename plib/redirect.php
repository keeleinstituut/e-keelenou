<?php

if ($_SERVER['HTTP_HOST'] === 'keelenou.tk') {
    header("HTTP/1.1 301 Moved Permanently");
    if (empty($_SERVER['QUERY_STRING'])) {
        header("Location: http://kn.eki.ee/?u=$uid");
    } else {
        header("Location: http://kn.eki.ee/?{$_SERVER['QUERY_STRING']}&u=$uid");
    }

}


?>