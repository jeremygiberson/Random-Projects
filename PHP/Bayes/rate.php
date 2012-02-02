<?php

    require_once 'zendframework.php';
    require_once 'Zend/Http/Client.php';
    require_once 'Zend/Db/Table/Data.php';
    require_once 'Zend/Db/Table/Dictionary.php';
    require_once 'Zend/Db/Table/Rating.php';
    require_once 'Bayes.php';


    $bayes = new Bayes(1);

	$table = new Rating();
	$db = $table->getAdapter();
	$entries = $db->fetchAll("select * from data where id not in (select message_id from rating) order by rand() limit 1000");
	$i = 0;
	foreach($entries as $entry)
	{
		$i ++;
		echo "Processing $i\n";
		$content = $entry['text'];
		$rating = $bayes->predict($content);

		$db->insert('rating', array('message_id' => $entry['id'],
									'filter_id' => 1,
									'rating' => $rating));
	}


