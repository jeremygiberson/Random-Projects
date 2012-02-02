<?php

	require_once 'zendframework.php';
	require_once 'Zend/Http/Client.php';
	require_once 'Zend/Db/Table/Data.php';
	require_once 'Zend/Db/Table/Dictionary.php';

	$filterId = 1;
	$offset = 0;
	$limit = 100;
	$count = $db->fetchOne('select count(*) from data');


	while($offset < $count-$limit)
	{
		echo "Processing $offset, $limit of $count\n";
		$corpus = $db->fetchAll("select * from data limit $offset, $limit");

		// process data
		foreach($corpus as $entry)
		{
			$words = tokenize($entry['text']);
			// train each unique word
			foreach($words as $word)
				Dictionary::train($filterId, $word, $entry['ham_count'], $entry['spam_count']);
		}

		$offset += $limit;
	}

	/**
	 * Sanitize words so we dont have duplicates
	 *
	 * @param string $word
	 * @return string
	 */
	function sanitize($word)
	{
		$w = strtolower($word);
		$w = preg_replace("/[^\\s\\d\\w']/", '', $w);
		$w = trim($w);
		return $w;
	}

	/**
	 * Chunks content in to word list
	 *
	 * @param string $content
	 * @return array
	 */
	function tokenize($content)
	{
		$words = preg_split('/[\s,]+/', $content);
		$unique = array();
		foreach($words as $w)
		{
			$w = sanitize($w);
			if($w == '')
				continue;
			if(in_array($w, $unique))
				continue;
			array_push($unique, $w);
		}
		return $unique;
	}
