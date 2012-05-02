<?php
	
	require_once 'Memory.php';
	
	// http://0x10c.com/doc/dcpu-16.txt
	
	/**
	 * Helper class for constructing and destructing word values
	 * into and from instructions
	 *
	 */
	class Instruction
	{
		const OPP_NONBASIC = 0x0;
		const OPP_SET = 0x1;
		const OPP_ADD = 0x2;
		const OPP_SUB = 0x3;
		const OPP_MUL = 0x4;
		const OPP_DIV = 0x5;
		const OPP_MOD = 0x6;
		const OPP_SHL = 0x7;
		const OPP_SHR = 0x8;
		const OPP_AND = 0x9;
		const OPP_BOR = 0xa;
		const OPP_XOR = 0xb;
		const OPP_IFE = 0xc;
		const OPP_IFN = 0xd;
		const OPP_IFG = 0xe;
		const OPP_IFB = 0xf;		
		
		public static function Factory($opp, $a, $b)
		{
			return (($b & 0x3f) << 10) | (($a & 0x3f) << 4) | ($opp & 0xf);	
		}
		
		public static function opp($word) { return ($word & 0xf); }
		public static function a($word) { return ($word & 0x3f0) >> 4; }
		public static function b($word) { return ($word & 0xfc00) >> 10; }
	}
	
	class Dcpu16
	{
		protected $memory;
		// registers
		protected $registers = array(/*A*/ 0x0 => 0, /*B*/ 0x1 => 0, /*C*/ 0x2 => 0,
									 /*X*/ 0x3 => 0, /*Y*/ 0x4 => 0, /*Z*/ 0x5 => 0,
									 /*I*/ 0x6 => 0, /*J*/ 0x7 => 0);
		// program counter
		protected $pc = 0x0;
		// stack pointer
		protected $sp = 0xffff;
		// program boundary
		protected $boundary;
		// overflow flag
		protected $overflow = 0x0;
		
		protected $clocks = 0;
		
		public function __construct($memSize = 0x1000)
		{
			$this->memory = new Memory($memSize);
			$this->sp = $memSize-1;
		}
		
		public function loadProgram($program)
		{
			$this->boundary = $this->memory->fromString(0x0, $program);
			$this->pc = 0;
			$this->sp = $this->memory->max();
		}
		
		/**
		 * run the cpu
		 *
		 */
		public function run()
		{
			while($this->pc <= $this->boundary)
				$this->tick();
		}
		
		/**
		 * read the value of $val
		 *
		 * @param int $b
		 * @return int
		 */
		protected function read($b)
		{
			// set register
			if($b >= 0x0 && $b <= 0x7)
				return $this->registers[$b];
			// set ram pointed to by register
			else if($b >= 0x8 && $b <= 0xf)
				return $this->memory->get($this->registers[$b]);
			else if($b >= 0x10 && $b <= 0x17)
				throw new Exception("Read param not implemented");
			// pop
			else if($b == 0x18)
				return $this->memory->get($this->sp++);
			// peek
			else if($b == 0x19)
				return $this->memory->get($this->sp);
			// push
			else if($b == 0x1a)
				return $this->memory->get(--$this->sp);
			// set sp
			else if($b == 0x1b)
				return $this->sp;
			// set pc
			else if($b == 0x1c)
				return $this->pc;
			// set O
			else if($b == 0x1d)
				return $this->overflow;
			// [next word], next word (literal), (lteral value 0x00-0x1f)
			else 
				throw new Exception("Read param not implemented");
		}
		
		/**
		 * Set a to val
		 *
		 * @param int $a
		 * @param int $val
		 */
		protected function set($a, $val)
		{
			// set register
			if($a >= 0x0 && $a <= 0x7)
				$this->registers[$a] = $val;
			// set ram pointed to by register
			else if($a >= 0x8 && $a <= 0xf)
				$this->memory->set($this->registers[$a], $val);
			else if($a >= 0x10 && $a <= 0x17)
				throw new Exception("Opp param not implemented");
			// pop
			else if($a == 0x18)
				$this->memory->set($this->sp++, $val);
			// peek
			else if($a == 0x19)
				$this->memory->set($this->sp, $val);
			// push
			else if($a == 0x1a)
				$this->memory->set(--$this->sp, $val);
			// set sp
			else if($a == 0x1b)
				$this->sp = $val;
			// set pc
			else if($a == 0x1c)
				$this->pc = $val;
			// set O
			else if($a == 0x1d)
				$this->overflow = $val;
			// [next word], next word (literal), (lteral value 0x00-0x1f)
			else 
				throw new Exception("Opp param not implemented");
		}
		
		/**
		 * Do a single clock of the cpu
		 *
		 */
		public function tick()
		{
			$instruction = $this->memory->get($this->pc);
			$opp = Instruction::opp($instruction);
			$a = Instruction::a($instruction);
			$b = Instruction::b($instruction);
			var_dump('ins', $opp, $a, $b);			
			// increment clock cycle count
			$this->clocks++;			
			switch($opp)
			{
				// handle set instruction
				case Instruction::OPP_SET:
					$this->set($a, $b);
					// increment program counter
					$this->pc++;
					break;
				case Instruction::OPP_ADD:
					$val = $this->read($a) + $this->read($b);
					If($val > 0xffff)
						$this->overflow = 0x1;
					else $this->overflow = 0x0;
					$this->set($a, $val);
					// increment program counter
					$this->pc++;
				default:
					throw new Exception("Opp not implemented");
			}
		}
		
		protected function nextWord()
		{
			
		}
		
		/**
		 * Debug output
		 *
		 */
		public function dump()
		{
			$values = array();
			echo "Registers:\nA    B    C    X    Y    Z    I    J\n";
			foreach($this->registers as $r)
				$values[] = str_pad(dechex($r), 4, '0', STR_PAD_LEFT);
			echo join(' ', $values) . "\n";
			
			$values = array();
			echo "\nValues of ram pointed to by registers:\n[A]  [B]  [C]  [X]  [Y]  [Z]  [I]  [J]\n";
			foreach($this->registers as $r)
				$values[] = str_pad(dechex($this->memory->get($r)), 4, '0', STR_PAD_LEFT);
			echo join(' ', $values) . "\n";

			echo "\nRam:";
			$this->memory->dump();
		}	
	}

	// compile program
	$mem = new Memory();
	$mem->set(0x0, Instruction::Factory(Instruction::OPP_SET, 0x0, 0x5));
	$mem->set(0x1, Instruction::Factory(Instruction::OPP_SET, 0x1, 0x4));	
	$mem->set(0x2, Instruction::Factory(Instruction::OPP_ADD, 0x0, 0x1));
	$program = $mem->toString(0x0, 0x1);
	var_dump($program);

	// run
	$cpu = new Dcpu16(0xf);
	$cpu->loadProgram($program);
	//$cpu->dump();	
	$cpu->tick();
	//$cpu->dump();
	$cpu->tick();
	$cpu->tick();
	$cpu->dump();
