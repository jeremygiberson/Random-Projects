Attempting to write a DCPU-16 emulator (cpu for notch's new game) in PHP. 

Asside from taking an assembly language programming class in college many years ago I dont have any knowledge about how a CPU emulator should work.

So to be frank, this implementation is pretty much entirely based on the contents of the file http://0x10c.com/doc/dcpu-16.txt and my own naive interpritation what it all means.

Files
Memory.php is the class for working with memory. The cleanest way (I could think of) to handle working with 16 bit values is to use a collection of two byte strings. So I implemented an array manager where each position in memory points to a two byte string. The class handles encoding/decoding a single int value into the high/low byte chars.

Instruction.php is a helper class that contains functions for interpreting the a/b/o components of a 16 bit word value.

Dcpu16.php is the implementation of the emulator. You can instantiate the cpu with a specified amount of ram, load a program and execute it.

test.php has some sample code to create a program, instantiate a cpu and execute.