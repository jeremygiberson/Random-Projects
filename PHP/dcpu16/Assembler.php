<?php
	require_once 'Memory.php';
	
	/**
	 * symbols:
	 * register: [a..cx..zijA..CX..ZIJ]
	 * literal: -1..30
	 * stack pointer: sp
	 * program counter: pc
	 * ram: [register|sp|pc]
	 * 
	 *
	 */
	
	/**
	 * Assembler
	 *
	 * compiler based on http://compilers.iecc.com/crenshaw
	 */
	class Assembler
	{
		protected $memory;
		protected $labels = array();
		protected $ic = 0; // instruction counter
		
		// parser
		protected $source;		
		protected $position;
		protected $look;		
		
		/**
		 * Compile specified source into a program
		 *
		 * @param String $src
		 * @return String
		 */
		public function compile($src) 
		{
			// reset memory
			$this->memory = new Memory();	
			$this->labels = array();
			$this->ic = 0;
			
			// reset parser
			$this->source = $src;
			$this->position = -1;
			$this->look = '';
			$this->getChar();
			
			// kick off compile
			while(!$this->isEnd())
			{
				$token = $this->scan();
				switch($token)
				{
					default:
						//throw new Exception("Token ($token) not expected");
						var_dump($token);
				}
			}
				
			// return compiled program
			return $memory->toString(0x0, $this->ic);
		}
		
		
		// end parsing and throw exception explaining why
		protected function abort($msg)
		{
			throw new Exception("Error (@ {$this->position}): $msg");
		}
		
		// abort wrapper for expected input
		protected function expected($msg)
		{
			$this->abort($msg . ' Expected');
		}
		
		// read next character of source
		public function getChar() 
		{ 
			$this->position++;
			// read
			$this->look = $this->source{$this->position};
		}
		
		// match specific input
		public function match($char) 
		{
			if($this->look == $char)
				$this->getChar();
			else $this->expected("'$char'");
		}
		
		// test if character is digit
		public function isDigit() 
		{
			return preg_match('/\d/', $this->look) ? true : false;
		}
		
		// test if character is alpha
		public function isAlpha() 
		{
			return preg_match('/[a..zA..Z]/', $this->look) ? true : false;
		}
		
		// test if character is whitespace
		public function isWhitespace()
		{
			return preg_match('/\s/', $this->look) ? true : false;
		}
		
		// test if character is space
		public function isSpace()
		{
			return $this->look == ' ';
		}
		
		// test if character is alpha or digit
		public function isAlphaNum()
		{
			return ($this->isAlpha() || $this->isDigit()) ? true : false;
		}
		
		public function isNull() 
		{
			return $this->look === null;
		}
		
		public function is($char)
		{
			return $this->look === $char;
		}
		
		public function skipWhite() 
		{
			while($this->position < strlen($this->source) && $this->isWhitespace())
				$this->getChar();
		}
		
		public function skipComma()
		{
			$this->skipWhite();
			if($this->isComma())
			{
				$this->match(',');
				$this->skipWhite();
			}
		}
		
		// special character tests
		public function isUnderscore() { return $this->look == '_'; }
		public function isOpenBrace() { return $this->look == '{'; }
		public function isCloseBrace() { return $this->look == '}'; }
		public function isOpenBracket() { return $this->look == '['; }
		public function isCloseBracket() { return $this->look == ']'; }
		public function isColon() { return $this->look == ':'; }
		public function isComma() { return $this->look == ','; }
		public function isEnd() { return $this->position > strlen($this->source); }

		/**
		 * Read in identifier string
		 *
		 * @return string
		 */
		public function getIdentifier() 
		{
			$x = '';
			if(!$this->isAlpha())
				$this->expected('Identifier');
			while($this->isAlphaNum())
			{
				$x .= strtoupper($this->look);
				$this->getChar();
			}
			$this->skipWhite();
			return $x;
		}
		
		/**
		 * Read in hex number
		 *
		 * @return integer
		 */
		public function getNumber() 
		{
			$this->match('0');	
			$this->match('x');
			$num = '';
			while($this->isDigit())
			{
				$num .= $this->look;
				$this->getChar();
				if(strlen($num) > 4)
					$this->expected('Number (0x####)');				
			}
			$this->skipWhite();
			return intval($num);
		}
		
		public function getRam()
		{
			$this->match('[');
			if($this->isDigit())
				$ram = $this->getNumber();
			else if($this->isAlpha())
				$ram = $this->getIdentifier();
			$this->match(']');
			$this->skipComma();
			// how to process named ram (registers, sp, pc,sp++,pc++,push,pop,etc)
			return $ram;
		}

		/**
		 * Skan next token
		 *
		 * @return unknown
		 */
		public function scan()
		{
			$this->skipWhite();
			if($this->isAlpha())
				return $this->getIdentifier();
			else if($this->isDigit())
				return $this->getNumber();
			// [0x1234],[A] (ram value)				
			else if($this->isOpenBracket())
				return $this->getRam();
			
			// :label (label value)
			else 
			{
				$t = $this->look;
				$this->getChar();
				return $t;
			}
		}

	}