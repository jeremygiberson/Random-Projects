<?php

	require_once 'Memory.php';
	require_once 'Instruction.php';

	// http://0x10c.com/doc/dcpu-16.txt
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

		public function getRegisterValue($register)
		{
			return $this->registers[$register];
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
			while($this->pc < $this->boundary)
			{
				echo "PC: {$this->pc}, END: {$this->boundary}\n";
				$this->tick();
			}
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
			// (lteral value 0x00-0x1f)
			else if($b >= 0x20 && $b <= 0x3f)
				return ($b - 0x20);
			// next word (literal)
			else if($b == 0x1f)
				return $this->memory->get($this->pc++);
			// [next word],

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
			// (lteral value 0x00-0x1f)
			// since literrals dont map to a register or position in mem
			// i dont think it makes sense to be able to set a litteral to something
			else if($a >= 0x20 && $a <= 0x3f)
				throw new Exception("Set param illegal (cant set a litteral value to a value)");
			// [next word], next word (literal)
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
			// increment pc
			$this->pc++;
			echo "\n\nins: $opp, $a, $b\n\n";
			// increment clock cycle count
			$this->clocks++;
			switch($opp)
			{
				// handle set instruction
				case Instruction::OPP_SET:
					$this->set($a, $this->read($b));
					// increment program counter
					//$this->pc++;
					break;
				case Instruction::OPP_ADD:
					$val = $this->read($a) + $this->read($b);
					If($val > 0xffff)
					{
						$this->overflow = 0x1;
						$val -= 0xffff;
					}
					else $this->overflow = 0x0;
					$this->set($a, $val);
					// increment program counter
					//$this->pc++;
					break;
				default:
					throw new Exception("Opp ($opp) not implemented");
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
			/*
			echo "\nValues of ram pointed to by registers:\n[A]  [B]  [C]  [X]  [Y]  [Z]  [I]  [J]\n";
			foreach($this->registers as $r)
				$values[] = str_pad(dechex($this->memory->get($r)), 4, '0', STR_PAD_LEFT);
			echo join(' ', $values) . "\n";
			*/

			echo "\nRam:";
			$this->memory->dump();
		}
	}