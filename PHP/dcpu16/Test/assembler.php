<?php
	require_once '../Assembler.php';
	
	$asm = new Assembler();
	$asm->compile('SET A,0x1234');