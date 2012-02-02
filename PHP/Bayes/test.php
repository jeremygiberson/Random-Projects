<?php

    require_once 'zendframework.php';
    require_once 'Zend/Http/Client.php';
    require_once 'Zend/Db/Table/Data.php';
    require_once 'Zend/Db/Table/Dictionary.php';
    require_once 'Bayes.php';


    $bayes = new Bayes(1);


$content = "Maybe I'm just a terrible programmer, but I think the author may be a little over emphasizing the seriousness of the bug. To me, this is one of those throw away issues that you keep in the back of your mind. Unless I'm coding something that is extremely datacentric and critical in that sense. But it's not like its on one of my \"top 20 must run tests\" or anything. It's always one of those issues I ignore or assume is correct until I find out it isn't. When I find out, it's simply a matter of tossing in a code page translation at either the input or output end and I'm done with it.
Or maybe I've just been fortunate enough to be in an environment where an occasional goof of this caliber doesn't have any serious consequences.";

	var_dump($bayes->predict($content));
