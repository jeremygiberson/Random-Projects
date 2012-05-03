<?php
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

        const VAL_REGISTER_A = 0x0;
        const VAL_REGISTER_B = 0x1;
        const VAL_REGISTER_C = 0x2;
        const VAL_REGISTER_X = 0x3;
        const VAL_REGISTER_Y = 0x4;
        const VAL_REGISTER_Z = 0x5;
        const VAL_REGISTER_I = 0x6;
        const VAL_REGISTER_J = 0x7;

        const VAL_RAM_REGISTER_A = 0x8;
        const VAL_RAM_REGISTER_B = 0x9;
        const VAL_RAM_REGISTER_C = 0xa;
        const VAL_RAM_REGISTER_X = 0xb;
        const VAL_RAM_REGISTER_Y = 0xc;
        const VAL_RAM_REGISTER_Z = 0xd;
        const VAL_RAM_REGISTER_I = 0xe;
        const VAL_RAM_REGISTER_J = 0xf;

        // ..

        const VAL_POP = 0x18;
        const VAL_PEEK = 0x19;
        const VAL_PUSH = 0x1a;
        const VAL_SP = 0x1b;
        const VAL_PC = 0x1c;
        const VAL_O = 0x1d;
        const VAL_RAM_NEXTWORD = 0x1e;
        const VAL_LIT_NEXTWORD = 0x1f;

        // contruct instruction (bbbbbbaaaaaaoooo)
        public static function Factory($opp, $a, $b)
        {
            return (($b & 0x3f) << 10) | (($a & 0x3f) << 4) | ($opp & 0xf);
        }
        // get opp bits (0000000000001111)
        public static function opp($word) { return ($word & 0xf); }
        // get a bits (0000001111110000)
        public static function a($word) { return ($word & 0x3f0) >> 4; }
        // get b bits (1111110000000000)
        public static function b($word) { return ($word & 0xfc00) >> 10; }
        // offset literal values (and keep between 0x0-0x1f)
        public static function literal($val) { return ($val + 0x20) & 0x3f; }
    }