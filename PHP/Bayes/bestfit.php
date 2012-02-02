<?php

    require_once 'zendframework.php';
    require_once 'Zend/Http/Client.php';
    require_once 'Zend/Db/Table/Data.php';
    require_once 'Zend/Db/Table/Dictionary.php';
    require_once 'Zend/Db/Table/Rating.php';
    require_once 'Bayes.php';

	$p = 0.5;

	$table = new Rating();
	$db = $table->getAdapter();
	$entries = $db->fetchAll("select * from rating order by random() limit 100");

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


