<?php

    class Bayes
    {
        protected $hamCount = 0;
        protected $spamCount = 0;
        protected $messageCount = 0;
        protected $overalSpamProbability;
		protected $db;
		protected $filterId;

		public function __construct($filterId)
		{
			$this->filterId = $filterId;
			$this->db = Zend_Db_Table::getDefaultAdapter();
			$spams = $this->db->fetchOne("select count(*) from data where spam_count > ham_count limit 2200");
			$hams = $this->db->fetchOne("select count(*) from data where spam_count < ham_count limit 2200");
			$messages = $this->db->fetchOne("select count(*) from data limit 2200");
			$this->hamCount = $hams;
			$this->spamCount = $spams;
			$this->messageCount = $messages;
		}

        /**
         * Overall probability content is spam
         *
         */
        public function pContentIsSpam()
        {
			return $this->spamCount / $this->messageCount;
        }

        /**
         * Overall probability content is ham
         *
         */
        public function pContentIsHam()
        {
			return $this->hamCount / $this->messageCount;
        }

        /**
         * Probability that $word appears in spam
         * (how many times is word in spam) / (how many spam messages)
         * @param string $word
         * @return real
         */
        public function pWordInSpam($word)
        {
            $r = $this->db->fetchRow("select spam_count from dictionary where word = ? and filter_id = ?",
            							array($word, $this->filterId));
            if(!$r)
            	return 0.5;
            return $r['spam_count'] / $this->spamCount;
        }

        /**
         * Probability that $word appears in ham
         * (how many times is word in ham) / (How many ham messages)
         * @param string $word
         * @return real
         */
        public function pWordInHam($word)
        {
            $r = $this->db->fetchRow("select ham_count from dictionary where word = ? and filter_id = ?",
            							array($word, $this->filterId));
            if(!$r)
            	return 0.5;
            return $r['ham_count'] / $this->hamCount;
        }

		/**
		 * Probability that content is spam knowing $word is in it
		 *
		 * @param string $word
		 * @return real
		 */
		public function pSpaminess($word)
		{
			$ps = $this->pContentIsSpam();
			$ph = $this->pContentIsHam();
			$pws = $this->pWordInSpam($word);
			$pwh = $this->pWordInHam($word);
			$psw = ($pws * $ps) / ($pws * $ps + $pwh * $ph);
			if($psw == 1)
				$psw = 0.99;
			if($psw == 0)
				$psw = 0.01;
			return $psw;
		}

		/**
		 * Probabilty that content is spam
		 *
		 * @param string $content
		 * @return real
		 */
		public function predict($content)
		{
			$words = $this->tokenize($content);
			$pProducts = 1;
			$pSums = 1;
			foreach($words as $word)
			{
				$p = $this->pSpaminess($word);
				echo "$word: $p\n";
				$pProducts *= $p;
				$pSums *= (1 - $p);
			}
			return $pProducts / ($pProducts + $pSums);
		}

		/**
		 * Sanitize word by removing casing
		 * @param string $word
		 * @return string
		 */
		public static function sanitize($word)
		{
			$w = strtolower($word);
			$w = preg_replace("/[^\\s\\d\\w']/", '', $w);
			$w = trim($w);
			return $w;
		}

		/**
		 * Tokenize content string into list of unique words
		 *
		 * @param string $content
		 * @return array
		 */
		public function tokenize($content)
		{
            $uniqueWords = array();
            $words = preg_split('/[\s,]+/', $content);
            foreach($words as $word)
            {
                $sword = self::sanitize($word);
                if(in_array($sword, $uniqueWords))
                    continue;
                $uniqueWords[] = $sword;
            }
            return $uniqueWords;
		}
    }