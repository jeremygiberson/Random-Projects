<?php
    // p(a) == probability of a
    // p(b) == probability of b
    // p(a|b) == conditional probability of a given b
    // p(b|a) == conditional probability of b given a
    
    $msg[] = 'The quick brown fox jumped over the lazy dog.';
    $msg[] = 'Now you can get replica watches at super low prices';
    $msg[] = 'Extend your sex life with viagra! viagra is the cheap effective method to have great fun.';
    $msg[] = 'Hey joe, welcome back. How was your trip? I hope that bottle of viagra worked out for you.';
    $msg[] = 'Cheap airline tickets. Buy online now!';
    
    $bayes = new Bayes();
    $bayes->train($msg[0], false);
    $bayes->train($msg[1], true);
    $bayes->train($msg[2], true);
    $bayes->train($msg[3], false);
    $bayes->train($msg[4], true);
    
    Probability::Report();
    
    
    class Bayes
    {
        // identify $content as spam
        // word probabilities will be updated to reflect addtion of content
        public function train($content, $spam = true)
        {
            $uniqueWords = array();
            $words = self::tokenize($content);
            foreach($words as $word)
            {
                if(!Probability::IsSignificant($word))
                    continue;
                $sword = Probability::Sanitize($word);
                if(in_array($sword, $uniqueWords))
                    continue;
                $uniqueWords[] = $sword;
            }
            
            foreach($uniqueWords as $word)
                Probability::Train($word, $spam);
                
            if($spam)
                Probability::$spamCount ++;
            else 
                Probability::$hamCount ++;
        }
        
        // predict whether $content is likely to be spam or ham
        public function predict($content)
        {
            
        }
        
        /**
         * Chunks content in to word list
         *
         * @param string $content
         * @return array
         */
        protected function tokenize($content)
        {
            return explode(' ', $content);
        }
    }
    
    class Probability
    {
        public static $dictionary = array();
        public static $hamCount = 0;
        public static $spamCount = 0;
        
        /**
         * Overall probability content is spam
         *
         */
        public static function ContentIsSpam()
        {
            
        }
        
        /**
         * Overall probability content is ham
         *
         */
        public static function ContentIsHam()
        {
            
        }
        
        /**
         * Probability that word appears in spam
         *
         * @param string $word
         * @return real
         */
        public static function AppearsInSpam($word)
        {
            $dict = self::FindOrCreate($word);
            $count = $dict['spam'] + $dict['ham'];
            return ($count == 0 ? 0 : $dict['spam'] / $count);
        }
        
        /**
         * Probability that word appears in ham
         *
         * @param string $word
         * @return real
         */
        public static function AppearsInHam($word)
        {
            $dict = self::FindOrCreate($word);
            $count = $dict['spam'] + $dict['ham'];
            return ($count == 0 ? 0 : $dict['ham'] / $count);           
        }
        
        /**
         * Train word on spaminess
         * If word does not exist, it is created
         *
         * @param string $word
         * @param boolean $spam
         */
        public static function Train($word, $spam = true)
        {
            // use foc to make sure word exists
            $dict = self::FindOrCreate($word);
            // get key
            $sword = self::Sanitize($word);
            if($spam)
                self::$dictionary[$sword]['spam'] ++;
            else 
                self::$dictionary[$sword]['ham'] ++;
        }
        
        /**
         * Test if word is significant enough to keep track of
         *
         * @param unknown_type $word
         * @return unknown
         */
        public static function IsSignificant($word)
        {
            $sword = self::Sanitize($word);
            // ingore short words
            if(strlen($sword) < 3)
                return false;
            // ignore numbers
            if(is_numeric($sword))
                return false;
            // ignore other things?
            // ..
            return true;
        }
        
        /**
         * Sanitize words so we dont have duplicates
         *
         * @param string $word
         * @return string
         */
        public static function Sanitize($word)
        {
            return strtolower($word);
        }
        
        
        /**
         * Get word statistics creating if necessary
         *
         * @param string $word
         * @return array
         */
        protected static function FindOrCreate($word)
        {
            $sword = self::Sanitize($word);
            if(key_exists($sword, self::$dictionary))
                return self::$dictionary[$sword];
            self::$dictionary[$sword] = array('sanitized' => $sword, 'spam' => 0, 'ham' => 0);
            return self::$dictionary[$sword];
        }
        
        public static function Report()
        {
            echo "Word\t%Spam\t%Ham\n";
            foreach(self::$dictionary as $dict)
            {
                $count = $dict['spam'] + $dict['ham'];
                if($count == 0) $count = 1;
                echo "{$dict['sanitized']}\t".($dict['spam']/$count) . "\t" . ($dict['ham']/$count) . "\n";
            }
        }
    }