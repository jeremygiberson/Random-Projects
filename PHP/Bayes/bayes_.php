<?php
	require_once 'zendframework.php';

	class Bayes
	{
		/**
		 Will train the bayes values with the message and rating
		 **/
		public function train($content, $isGood)
		{
			$words = explode(' ',$content);
			foreach($words as $word)
			{
				$word = strtolower(trim($word));
				if($word == '')
					continue;

				// update table
			}
		}
	}
?>