<?php

    class Dictionary extends Zend_Db_Table
    {
    	protected $_name = 'dictionary';
    	protected $_primary = 'id';

		public static function train($filterId, $word, $ham, $spam)
		{
			$ham -= 1; // get rid of original user +1
			if($ham > 20 && $ham > $spam+20)
			{
				$tham = 1;
				$tspam = 0;
			}
			else if($ham > 20 && $ham == $spam+20)
			{
				$tspam = 0.5;
				$tham = 0.5;
			}
			else
			{
				$tham = 0;
				$tspam = 1;
			}

			$db = Zend_Db_Table::getDefaultAdapter();
			$stmt = $db->query('insert into dictionary (filter_id, word, spam_count, ham_count, message_count)
				values(:filter, :word, :ham, :spam, 1) on duplicate key
				update spam_count = spam_count + :spam, ham_count = ham_count + :ham, message_count = message_count + 1',
				array(':filter'=>$filterId, ':word'=>$word, ':ham'=>$tham, ':spam'=>$tspam));
		}
    }
