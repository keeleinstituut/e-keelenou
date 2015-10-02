<?php

$extdir=ini_get('extension_dir');

$modules=get_loaded_extensions();
foreach($modules as $m){
    $lib=$extdir.'/'.$m.'.so';
    if (file_exists($lib)) {
        print "$m: dynamically loaded\n";
    } else {
        print "$m: statically loaded\n";
    }
}

?>