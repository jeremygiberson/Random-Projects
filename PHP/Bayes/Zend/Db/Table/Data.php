<?php

    class Data extends Zend_Db_Table
    {
    	protected $_name = 'data';
    	protected $_primary = 'id';

    	public static function exists($sha1)
    	{
			$db = Zend_Db_Table::getDefaultAdapter();
			$id = $db->fetchOne("select id from data where hash = ?", $sha1);
			if($id)
				return true;
			return false;
    	}

    	public static function add($text, $hamCount, $spamCount, $source = 4)
    	{
			$hash = sha1($text);
			if(self::exists($hash))
				return;
			$data = new Data();
			$row = $data->createRow();
			$row->source = $source;
			$row->text = $text;
			$row->hash = $hash;
			$row->spam_count = $spamCount;
			$row->ham_count = $hamCount;
			$row->save();
    	}
    }
