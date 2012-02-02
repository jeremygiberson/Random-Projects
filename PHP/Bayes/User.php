<?php

    class User extends Zend_Db_Table_Abstract
    {
        protected $_name = 'user';
        protected $_primary = 'id';

        public function insert(array $data)
        {
            $data['password'] = new Zend_Db_Expr($this->getAdapter()->quoteInto('SHA1(?)', $data['password']));

            return parent::insert($data);
        }

        public function update(array $data, $where)
        {
        	if(isset($data['password'])
        		$data['password'] = new Zend_Db_Expr($this->getAdapter()->quoteInto('SHA1(?)', $data['password']));

            return parent::update($data, $where);
        }