<?php
/*
	$m = new Memory();
	$m->set(0x040, 0x400);
	$v = $m->get(0x040);
	var_dump($v);
	$m->set(0x1, (ord('a')<<8) | ord('b'));
	$v = $m->get(0x1);
	var_dump($v);
	echo $m->toString();
*/

	/**
	 * Memory 
	 * 
	 * Usage
	 * $m = new Memory();
	 * $m->set(0x1, ord('a'));
	 * $char = chr($m->get(0x1));
	 * $m->set(0x2, 3);
	 * $int = $m->get(0x2)
	 *
	 */
	class Memory
	{
		protected $mem = array();
		protected $size;

		/**
		 * Intialize memory object
		 * Create an array of 2byte words (16 bits)
		 *
		 */
		public function __construct($size = 0x10000)
		{
			$this->size = $size;
			// 8,000 null characters = 8 kilobytes
			for($i = 0; $i < $this->size; $i++)
				$this->mem[] = chr(0).chr(0); // 2 byte/1word/16 bits
		}
		
		/**
		 * Set $position in memory to $wordValue
		 *
		 * @param int $position
		 * @param int $wordValue
		 */
		public function set($position, $wordValue)
		{
			$low = (intval($wordValue) & 255);
			$high = ((intval($wordValue) >> 8) & 255);
			$this->mem[$position] = chr($high).chr($low);
		}
		
		/**
		 * Get value at $position in memory
		 *
		 * @param int $position
		 * @return int
		 */
		public function get($position)
		{
			$high = ord($this->mem[$position][0]);
			$low = ord($this->mem[$position][1]);
			return ($high << 8) | $low;
		}
		
		public function max() { return $this->size; }
		
		/**
		 * Debug output contents of memory
		 */
		public function dump()
		{
			for($i = 0; $i < $this->size; $i++)
			{
				if(($i) % 8 == 0)
					echo "\n" . str_pad(dechex($i), 4, '0', STR_PAD_LEFT) . ': ';
				
				echo str_pad(dechex($this->get($i)), 4, '0', STR_PAD_LEFT) . ' ';
				
				if($i > 8 * 32)
					break;
			}
			echo "\n";
		}
		
		/**
		 * Convert section of memory to string representation
		 *
		 * @param int $from
		 * @param int $to
		 */
		public function toString($from = 0x0, $to = 0x1000)
		{
			if($from < 0 || $from > $this->size)
				throw new Exception("From memory address out of bounds");
			if($to < 0 || $to < $from || $to > $this->size)
				throw new Exception("To memory address out of bounds");
			$str = '';
			for($i = $from; $i <= $to; $i++)
				$str .= $this->mem[$i];
			return $str;
		}
		
		/**
		 * Starting at $position loads $string'ized memory
		 * returns the last position of memory that was loaded
		 *
		 * @param int $position
		 * @param string $string
		 * @return int $boundary
		 */
		public function fromString($position, $string)
		{
			if($position < 0 || $position > $this->size)
				throw new Exception("Position memory address out of bounds");
			if(strlen($string) % 2 != 0)
				throw new Exception("Memory string is not a factor of 2");
			if($position + (strlen($string)/2) > $this->size)
				throw new Exception("Loaded memory (from $position) exceeds memory bounds");
				
			$to = strlen($string)/2;
			
			for($i = $position; $i < $to; $i++)
				$this->mem[$i] = substr($string, $i*2, 2);
			return $to;
		}
	}
