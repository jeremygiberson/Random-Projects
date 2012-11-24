<?php
	require_once 'Memory.php';
	require_once 'Instruction.php';
	require_once 'dcpu16.php';

	/**
	 * Adding small literals
	 */
	// compile program
	$mem = new Memory();
	// set A to 5
	$mem->set(0x0, Instruction::Factory(Instruction::OPP_SET, Instruction::VAL_REGISTER_A, Instruction::literal(0x5)));
	// set B to 4
	$mem->set(0x1, Instruction::Factory(Instruction::OPP_SET, Instruction::VAL_REGISTER_B, Instruction::literal(0x4)));
	// Set A to A + B (9)
	$mem->set(0x2, Instruction::Factory(Instruction::OPP_ADD, Instruction::VAL_REGISTER_A, Instruction::VAL_REGISTER_B));
	$program = $mem->toString(0x0, 0x2);
	var_dump($program);

	// create a new cpu (with limited ram)
	$cpu = new Dcpu16(0xf);
	// load our program
	$cpu->loadProgram($program);
	// get initial cpu states
	$cpu->dump();
	// process first instruction
	$cpu->tick(); // A = 5
	// dump cpu state
	$cpu->dump();
	// process second instruction
	$cpu->tick(); // B = 4
	// dump cpu state
	$cpu->dump();
	// process final instruction
	$cpu->tick(); // A = A+B
	// dump cpu state
	$cpu->dump();

	// if our program ran correctly, register A should be the value 9
	var_dump('Register A: ',$cpu->getRegisterValue(Instruction::VAL_REGISTER_A));
	
	/**
	 * Adding large values
	 */
	// compile program
	$mem = new Memory();
	// set A, 0xfff0
	$mem->set(0x0, Instruction::Factory(Instruction::OPP_SET, Instruction::VAL_REGISTER_A, Instruction::VAL_LIT_NEXTWORD));
	$mem->set(0x1, 0xfff0);
	// add A, 0x05
	$mem->set(0x2, Instruction::Factory(Instruction::OPP_ADD, Instruction::VAL_REGISTER_A, Instruction::literal(5)));	
	// set B, 0xf3a
	$mem->set(0x3, Instruction::Factory(Instruction::OPP_SET, Instruction::VAL_REGISTER_B, Instruction::VAL_LIT_NEXTWORD));
	$mem->set(0x4, 0xf3a);
	// add B, 0x1bc
	$mem->set(0x5, Instruction::Factory(Instruction::OPP_ADD, Instruction::VAL_REGISTER_B, Instruction::VAL_LIT_NEXTWORD));		
	$mem->set(0x6, 0x1bc);
	// 
	$program = $mem->toString(0x0, 0x6);
	var_dump($program);

	// create a new cpu (with limited ram)
	$cpu = new Dcpu16(0xf);
	// load our program
	$cpu->loadProgram($program);
	// get initial cpu states
	$cpu->run();
	$cpu->dump();

	// if our program ran correctly, register A should be the value 0xfff5,
	var_dump('Register A: ',$cpu->getRegisterValue(Instruction::VAL_REGISTER_A));
	// and register B should be 0x10f6
	var_dump('Register B: ',$cpu->getRegisterValue(Instruction::VAL_REGISTER_B));