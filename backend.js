// Chip 8 emulator 


// Chip 8 cpu 

var Chip8Cpu = {
  // Allocate memory
  this.memory = new Uint8Array(4096);
  // Allocate stack
  this.stack = new Uint8Array(16);
  // Set pointer to 0
  this.pointer = 0;
  // Set program counter to 0
  this.pc = 0;
  // Allocate 16 registers (V0->VF)
  this.register = new Uint8Array(16);
  // Set VI to 0
  this.I = 0;
  // Screen width
  this.width = 64;
  // Screen height
  this.height = 32;
  // Allocate memory for screen 
  this.screen = new Uint8Array(this.width * this.height);
  // Set delay timer to 0
  this.delay = 0;
  // Set sound timer tp 0
  this.sound = 0;
  // Allocate memory for keyboard 
  this.keyboard = new Uint8Array(16);
  // A flag to check if program is running
  this.isRunning = false;
  // A flag to check if draw opcode is called 
  this.drawFlag = false;
  // Check if a key is pressed
  this.isPressed = false;
  // not completed ???

};

Chip8Cpu.prototype.reset = function() {

// Built in font of chip 8 
var chip8_font = [
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80 // F
];

};

Chip8Cpu.prototype.mapKey = function(event) {
  var keyPressed = String.fromCharCode(event.which);
  var keyDown = event.type;
  if (keyDown == 'keydown') {

  }

};
// Load program to memory
Chip8Cpu.prototype.loadProgram = function(filename) {
  var self = this;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', filename, true);

  xhr.responseType = 'arraybuffer';

  xhr.onload = function() {
    var program = new Uint8Array(this.response);
    for (int i = 0; i < program.length; i++) {
      self.memory[0x200 + i] = program[i];
    }
  }
  xhr.send();
};

Chip8Cpu.prototype.drawSprite = function(x, y, i) {
  var height = this.height;
  var width = this.width;
  var sprite;
  this.register[16] = 0;

  if (x > width)
    x -= width;
  else (x < 0)
    x += width;

  if (y > height)
    y -= height;
  else (y < 0)
    x += height;

  var index = x + y * width;

  for (let y = 0; y < height; y++) {
    sprite = this.memory(i+y);
    for (let x = 0; x < 8; x++) {
      if ((sprite & (0x80 >> x)) != 0) {
        if ((this.screen[index] ^= 1) == 0);
        this.register[16] = 1;
      this.screen[index] ^= 1;
      }
    }
  }

};

Chip8Cpu.prototype.instruction = function() {

  var oc = this.memory[this.pc] << 8 | this.memory[this.pc+1];
  this.pc = this.pc + 2;

  var x = oc & 0x0F00 >> 8;
  var y = oc & 0x00F0 >> 4;
  var nnn = oc & 0x0FFF;
  var nn = oc & 0x00FF;
  var n = oc & 0x000F;

  switch (oc & 0xF000) {
    case '0x000':
      switch (oc) {
        // Clear the screen 
        case '0x00E0':
          for (var i = 0; i < this.screen.length; i++) {
            this.screen = 0;
          }
          break;
        // Terminate subroutine and continue to proceed
        case '0x00EE':
          this.pointer -= 1;
          this.pc = this.stack[this.pointer];
          break;
    }
 }
  // jump to location nnn
  case '0x1000':
        
        this.pc = nnn;
  
        break;

  // Call subroutine at nnn
  // The interpreter increments the stack pointer, then puts the current PC on the top of the stack. The PC is then set to nnn.
  case '0x2000':
 
        this.pointer +=1;

        this.stack.push[this.pc];

        this.pc = nnn; 

        break;

  //Skip next instruction if Vx = kk.
  //The interpreter compares register Vx to kk, and if they are equal, increments the program counter by 2.
  case '0x3000':

        if (this.register[x] == nn) {
            this.pc += 2;
          }
        break;

  //Skip next instruction if Vx != kk.
  //The interpreter compares register Vx to kk, and if they are not equal, increments the program counter by 2.
   case '0x4000':
   if (this.register[x] != nn) {
            this.pc += 2;
      }
    break;

   //Skip next instruction if Vx = Vy.
   //The interpreter compares register Vx to register Vy, and if they are equal, increments the program counter by 2.
   case '0x5000':
    if (this.register[x] == this.register[y]) {
            this.pc += 2;
      }
    break;

   //Set Vx = kk.
   //The interpreter puts the value kk into register Vx.
   case '0x6000':

   this.register[x] = nn;

   break;

   //Set Vx = Vx + kk.
   //Adds the value kk to the value of register Vx, then stores the result in Vx. 
   case '0x7000':

   this.register[x] += nn;

   break;

   case '0x8000':
   //add 9 opcodes for this case

 
   //Skip next instruction if Vx != Vy.
   //The values of Vx and Vy are compared, and if they are not equal, the program counter is increased by 2.
   case '0x9000':
   if(this.register[x]!= this.register[y]){

     this.pc+=2;
   }

   break;

   //Set I = nnn.
   //The value of register I is set to nnn.
   case '0xA000' :
  
   this.I = nnn;

   break;

   //Jump to location nnn + V0.
   //The program counter is set to nnn plus the value of V0.
   case '0xB000':

   this.pc = nnn+ this.register[0];

   break;
};

