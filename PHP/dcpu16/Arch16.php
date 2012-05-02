<?

	class Arch16
	{
		public function highByte($word)
		{
			return $word >> 8;
		}
		public function lowByte($word)
		{
			return ($word & 255);
		}
	}
	
	$a = new Arch16();
	echo $a->highByte('ab') . "\n";
	echo $a->lowByte('ab') . "\n";