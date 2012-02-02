<?php
	require_once 'zendframework.php';
	require_once 'Zend/Http/Client.php';
	require_once 'Zend/Db/Table/Data.php';


	// subs
	// startups
	//


	$after = '';

	for($i = 0; $i < 100; $i++)
	{
		echo 'processing ' . $after . "\n";
		$after = processSubReddit('startups', $after);
	}

	function processSubReddit($sub, $after)
	{
		$client = new Zend_Http_Client();
		$client->setUri('http://www.reddit.com/r/'.$sub.'/.json?after='.$after);
		$client->setConfig(array('timeout'=>30));
		$response = $client->request();
		$body = $response->getBody();
		$obj = json_decode($body);

		processPosts($obj);

		return $obj->data->after;
	}

	function processPosts($listing)
	{
		// only process listings
		if($listing->kind != "Listing")
			return;

		$data = $listing->data;
		$children = $data->children;
		if(!$children)
			return;
		foreach($children as $post)
		{
			if($post->kind != "t3")
				continue;

			$data = $post->data;
			$link = $data->permalink;
			$score = $data->score;
			$num_comments = $data->num_comments;
			// process comments page?
			if($score > 100 && $num_comments > 50)
				processComments($link);

		}
	}

	// process comment thread
	function processComments($link)
	{
		$client = new Zend_Http_Client();
		$client->setUri('http://www.reddit.com'.$link.'.json');
		$client->setConfig(array('timeout'=>30));
		$response = $client->request();
		$body = $response->getBody();
		$obj = json_decode($body);
		$replies = $obj[1]; // second listing

		processReplies($replies);
	}

	// process replies of a comment thread
	function processReplies($listing)
	{
		// only process listings
		if($listing->kind != "Listing")
			return;

		$data = $listing->data;
		$children = $data->children;
		if(!$children)
			return;
		foreach($children as $reply)
		{
			if($reply->kind != "t1")
				continue;

			$data = $reply->data;
			$text = $data->body;
			$spam_count = $data->downs;
			$ham_count = $data->ups;

			Data::add($text, $ham_count, $spam_count, 1);

			$replies = $data->replies;
			if($replies != null)
				processReplies($replies);
		}
	}

?>
