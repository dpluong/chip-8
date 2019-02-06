const { expect } = require('chai');
const Chip8Cpu = require('../src/index').backend;
const MockFrontend = require('./mockFrontend');

describe('Emulator', () => {
  let mockFrontend = new MockFrontend();
  let emulator = new Chip8Cpu(mockFrontend);
  beforeEach(() => {
    mockFrontend = new MockFrontend();
    emulator = new Chip8Cpu(mockFrontend);
    emulator.programCounter = 0x200;
  });

  describe('Opcode 0x0NNN', () => {
    it('should throw an error because this opcode is not implemented', async () => {
      emulator.memory[0x200] = 0x0F;
      emulator.memory[0x201] = 0xFF;
      expect(emulator.runNextInstruction).to.throw();
    });
  });

  describe('Opcode 0x00E0', () => {
    it('should clear the screen', async () => {
      emulator.memory[0x200] = 0x00;
      emulator.memory[0x201] = 0xE0;
      emulator.runNextInstruction();
      expect(mockFrontend.currentDisplay.length).to.equal(64 * 32);
      expect(mockFrontend.currentDisplay.every(val => val === 0x0)).to.equal(true);
    });
  });

  describe('Opcode 0x00EE/0x2NNN', () => {
    it('jumps program control to the specified address when 0x2NNN is called', async () => {
      emulator.memory[0x200] = 0x25;
      emulator.memory[0x201] = 0x55;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x555);
    });

    it('returns control to the address that called the subroutine when 0x00EE is called', async () => {
      emulator.memory[0x200] = 0x22;
      emulator.memory[0x201] = 0x55;
      emulator.memory[0x255] = 0x00;
      emulator.memory[0x256] = 0xEE;
      emulator.runNextInstruction();
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x202);
    });

    it('throws an error when 0x2NNN is called if the stack has overerflown', async () => {
      for (let i = 0; i < 48; i += 2) {
        emulator.memory[0x200 + i] = 0x22;
        emulator.memory[0x201 + i] = 0x02 + i;
      }
      for (let i = 0; i < 12; i += 1) {
        emulator.runNextInstruction();
      }
      expect(emulator.runNextInstruction).to.throw();
    });

    it('throws an error when 0x00EE is called if there is no address to return to', async () => {
      emulator.memory[0x200] = 0x00;
      emulator.memory[0x201] = 0xEE;
      expect(emulator.runNextInstruction).to.throw();
    });
  });

  describe('Opcode 0x1NNN', () => {
    it('jumps to the specified spot', () => {
      emulator.memory[0x200] = 0x16;
      emulator.memory[0x201] = 0x66;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x666);
    });
  });

  describe('Opcode 0x3XNN', () => {
    it('skips the next instruction if the register equals NN', () => {
      emulator.memory[0x200] = 0x36;
      emulator.memory[0x201] = 0x13;
      emulator.registers[0x6] = 0x13;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x204);
    });

    it('does not skips the next instruction if the register doesnt equal NN', () => {
      emulator.memory[0x200] = 0x36;
      emulator.memory[0x201] = 0x13;
      emulator.registers[0x6] = 0x62;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x202);
    });
  });

  describe('Opcode 0x4XNN', () => {
    it('skips the next instruction if the register doesnt equal NN', () => {
      emulator.memory[0x200] = 0x46;
      emulator.memory[0x201] = 0x13;
      emulator.registers[0x6] = 0x61;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x204);
    });

    it('does not skips the next instruction if the register equals NN', () => {
      emulator.memory[0x200] = 0x46;
      emulator.memory[0x201] = 0x13;
      emulator.registers[0x6] = 0x13;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x202);
    });
  });

  describe('Opcode 0x5XY0', () => {
    it('skips the next instruction if the two registers are equal', () => {
      emulator.memory[0x200] = 0x53;
      emulator.memory[0x201] = 0x70;
      emulator.registers[0x3] = 0x61;
      emulator.registers[0x7] = 0x61;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x204);
    });

    it('does not skips the next instruction if the two registers are not equal', () => {
      emulator.memory[0x200] = 0x53;
      emulator.memory[0x201] = 0x70;
      emulator.registers[0x3] = 0x61;
      emulator.registers[0x7] = 0x66;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x202);
    });
  });

  describe('Opcode 0x5XY0', () => {
    it('skips the next instruction if the two registers are equal', () => {
      emulator.memory[0x200] = 0x53;
      emulator.memory[0x201] = 0x70;
      emulator.registers[0x3] = 0x61;
      emulator.registers[0x7] = 0x61;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x204);
    });

    it('does not skips the next instruction if the two registers are not equal', () => {
      emulator.memory[0x200] = 0x53;
      emulator.memory[0x201] = 0x70;
      emulator.registers[0x3] = 0x61;
      emulator.registers[0x7] = 0x66;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x202);
    });
  });

  describe('Opcode 0x6XNN', () => {
    it('sets the register in X with the value in NN', () => {
      emulator.memory[0x200] = 0x6A;
      emulator.memory[0x201] = 0xC3;
      emulator.runNextInstruction();
      expect(emulator.registers[0xA]).to.equal(0xC3);
    });
  });

  describe('Opcode 0x7XNN', () => {
    it('modifies register X by adding NN', () => {
      emulator.memory[0x200] = 0x74;
      emulator.memory[0x201] = 0x21;
      emulator.registers[0x4] = 0x34;
      emulator.runNextInstruction();
      expect(emulator.registers[0x4]).to.equal(0x55);
    });
  });

  describe('Opcode 0x8XY0', () => {
    it('sets register X to value of register Y', () => {
      emulator.memory[0x200] = 0x83;
      emulator.memory[0x201] = 0x60;
      emulator.registers[0x3] = 0x72;
      emulator.registers[0x6] = 0x14;
      emulator.runNextInstruction();
      expect(emulator.registers[0x3]).to.equal(0x14);
    });
  });

  describe('Opcode 0x8XY1', () => {
    it('sets register X to bitwise value of register X OR register Y', () => {
      emulator.memory[0x200] = 0x82;
      emulator.memory[0x201] = 0x11;
      emulator.registers[0x2] = 0xC1;
      emulator.registers[0x1] = 0xBB;
      emulator.runNextInstruction();
      expect(emulator.registers[0x2]).to.equal(0xFB);
    });
  });

  describe('Opcode 0x8XY2', () => {
    it('sets register X to bitwise value of register X AND register Y', () => {
      emulator.memory[0x200] = 0x8C;
      emulator.memory[0x201] = 0x52;
      emulator.registers[0xC] = 0xAA;
      emulator.registers[0x5] = 0xCB;
      emulator.runNextInstruction();
      expect(emulator.registers[0xC]).to.equal(0x8A);
    });
  });

  describe('Opcode 0x8XY3', () => {
    it('sets register X to bitwise value of register X XOR register Y', () => {
      emulator.memory[0x200] = 0x8F;
      emulator.memory[0x201] = 0xD3;
      emulator.registers[0xF] = 0x63;
      emulator.registers[0xD] = 0x17;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x74);
    });
  });

  describe('Opcode 0x8XY4', () => {
    it('sets register X to register X + register Y', () => {
      emulator.memory[0x200] = 0x8B;
      emulator.memory[0x201] = 0xA4;
      emulator.registers[0xB] = 0x13;
      emulator.registers[0xA] = 0x02;
      emulator.runNextInstruction();
      expect(emulator.registers[0xB]).to.equal(0x15);
    });

    it('sets VF to 0 when no carry happens', () => {
      emulator.memory[0x200] = 0x8B;
      emulator.memory[0x201] = 0xA4;
      emulator.registers[0xB] = 0x13;
      emulator.registers[0xA] = 0x02;
      emulator.registers[0xF] = 0x32;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x0);
    });

    it('sets VF to 1 when a carry happens', () => {
      emulator.memory[0x200] = 0x8B;
      emulator.memory[0x201] = 0xA4;
      emulator.registers[0xB] = 0xFF;
      emulator.registers[0xA] = 0x02;
      emulator.registers[0xF] = 0x32;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x1);
    });
  });

  describe('Opcode 0x8XY5', () => {
    it('sets register X to register X - register Y', () => {
      emulator.memory[0x200] = 0x83;
      emulator.memory[0x201] = 0x55;
      emulator.registers[0x3] = 0x50;
      emulator.registers[0x5] = 0x10;
      emulator.runNextInstruction();
      expect(emulator.registers[0x3]).to.equal(0x40);
    });

    it('sets VF to 0 when no borrowing happens', () => {
      emulator.memory[0x200] = 0x83;
      emulator.memory[0x201] = 0x55;
      emulator.registers[0x3] = 0x50;
      emulator.registers[0x5] = 0x10;
      emulator.registers[0xF] = 0x69;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x0);
    });

    it('sets VF to 1 when a carry happens', () => {
      emulator.memory[0x200] = 0x83;
      emulator.memory[0x201] = 0x55;
      emulator.registers[0x3] = 0x50;
      emulator.registers[0x5] = 0x51;
      emulator.registers[0xF] = 0x69;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x1);
    });
  });

  describe('Opcode 0x8XY6', () => {
    it('sets register X to register Y >> 1', () => {
      emulator.memory[0x200] = 0x81;
      emulator.memory[0x201] = 0x46;
      emulator.registers[0x1] = 0x14;
      emulator.registers[0x4] = 0x58;
      emulator.runNextInstruction();
      expect(emulator.registers[0x1]).to.equal(0x2C);
    });

    it('sets F register to 0x0 if least sig binary digit was 0', () => {
      emulator.memory[0x200] = 0x81;
      emulator.memory[0x201] = 0x46;
      emulator.registers[0x1] = 0x14;
      emulator.registers[0x4] = 0x58;
      emulator.registers[0xF] = 0x69;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x0);
    });

    it('sets F register to 0x1 if least sig binary digit was 1', () => {
      emulator.memory[0x200] = 0x81;
      emulator.memory[0x201] = 0x46;
      emulator.registers[0x1] = 0x14;
      emulator.registers[0x4] = 0x59;
      emulator.registers[0xF] = 0x69;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x1);
    });
  });

  describe('Opcode 0x8XY7', () => {
    it('sets register X to register Y - register X', () => {
      emulator.memory[0x200] = 0x8A;
      emulator.memory[0x201] = 0xC7;
      emulator.registers[0xA] = 0x50;
      emulator.registers[0xC] = 0x60;
      emulator.runNextInstruction();
      expect(emulator.registers[0xA]).to.equal(0x10);
    });

    it('sets VF to 0 when no borrowing happens', () => {
      emulator.memory[0x200] = 0x8A;
      emulator.memory[0x201] = 0xC7;
      emulator.registers[0xA] = 0x50;
      emulator.registers[0xC] = 0x60;
      emulator.registers[0xF] = 0x69;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x0);
    });

    it('sets VF to 1 when borrowing happens', () => {
      emulator.memory[0x200] = 0x8A;
      emulator.memory[0x201] = 0xC7;
      emulator.registers[0xA] = 0x50;
      emulator.registers[0xC] = 0x40;
      emulator.registers[0xF] = 0x69;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x1);
    });
  });

  describe('Opcode 0x8XYE', () => {
    it('sets register X to register Y << 1', () => {
      emulator.memory[0x200] = 0x85;
      emulator.memory[0x201] = 0x7E;
      emulator.registers[0x5] = 0xAA;
      emulator.registers[0x7] = 0x77;
      emulator.runNextInstruction();
      expect(emulator.registers[0x5]).to.equal(0xEE);
    });

    it('sets F register to 0x0 if most sig binary digit was 0', () => {
      emulator.memory[0x200] = 0x85;
      emulator.memory[0x201] = 0x7E;
      emulator.registers[0x5] = 0xAA;
      emulator.registers[0x7] = 0x01;
      emulator.registers[0xF] = 0x69;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x0);
    });

    it('sets F register to 0x1 if most sig binary digit was 1', () => {
      emulator.memory[0x200] = 0x85;
      emulator.memory[0x201] = 0x7E;
      emulator.registers[0x5] = 0xAA;
      emulator.registers[0x7] = 0xFF;
      emulator.registers[0xF] = 0x69;
      emulator.runNextInstruction();
      expect(emulator.registers[0xF]).to.equal(0x1);
    });
  });

  describe('Opcode 0xANNN', () => {
    it('sets register I to NNN', () => {
      emulator.memory[0x200] = 0xA3;
      emulator.memory[0x201] = 0x55;
      emulator.runNextInstruction();
      expect(emulator.iRegister).to.equal(0x355);
    });
  });

  describe('Opcode 0xBNNN', () => {
    it('jumps to the specified spot + offset in register 0', () => {
      emulator.memory[0x200] = 0xB6;
      emulator.memory[0x201] = 0x13;
      emulator.registers[0x0] = 0x16;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x629);
    });
  });

  describe('Opcode 0xCXNN', () => {
    it('changes the X register to a random number', () => {
      let registerChanged = false;
      for (let i = 0; i < 48; i += 2) {
        emulator.memory[0x200 + i] = 0xC4;
        emulator.memory[0x201 + i] = 0xFF;
      }
      for (let i = 0; i < 20; i += 1) {
        emulator.runNextInstruction();
        if (emulator.registers[0x4] !== 0x0) {
          registerChanged = true;
        }
      }
      expect(registerChanged).to.equal(true);
    });

    it('restricts the random values based off the mask', () => {
      for (let i = 0; i < 48; i += 2) {
        emulator.memory[0x200 + i] = 0xC6;
        emulator.memory[0x201 + i] = 0x0F;
      }
      for (let i = 0; i < 20; i += 1) {
        emulator.runNextInstruction();
        expect(emulator.registers[0x6]).to.be.lessThan(0x10);
      }
    });
  });

  describe('Opcode 0xDXYN', () => {
    it('draws a sprite to the correct XY values', () => {
      emulator.memory[0x200] = 0xDA;
      emulator.memory[0x201] = 0xB1;
      emulator.memory[0x202] = 0b01001101;
      emulator.iRegister = 0x202;
      emulator.registers[0xA] = 0x1;
      emulator.registers[0xB] = 0x2;
      emulator.runNextInstruction();
      expect(mockFrontend.currentDisplay.length).to.equal(64 * 32);
      expect(mockFrontend.currentDisplay[0b00010000001]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00010000010]).to.equal(1);
      expect(mockFrontend.currentDisplay[0b00010000011]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00010000100]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00010000101]).to.equal(1);
      expect(mockFrontend.currentDisplay[0b00010000110]).to.equal(1);
      expect(mockFrontend.currentDisplay[0b00010000111]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00010001000]).to.equal(1);
    });

    it('respects the N bytes parameter', () => {
      emulator.memory[0x200] = 0xDA;
      emulator.memory[0x201] = 0xB1;
      emulator.memory[0x202] = 0b01001101;
      emulator.memory[0x203] = 0xFF;
      emulator.iRegister = 0x202;
      emulator.registers[0xA] = 0x1;
      emulator.registers[0xB] = 0x2;
      emulator.runNextInstruction();
      expect(mockFrontend.currentDisplay[0b00011000001]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00011000010]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00011000011]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00011000100]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00011000101]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00011000110]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00011000111]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00011001000]).to.equal(0);
    });

    it('can draw on multiple lines', () => {
      emulator.memory[0x200] = 0xDA;
      emulator.memory[0x201] = 0xB2;
      emulator.memory[0x202] = 0b01001101;
      emulator.memory[0x203] = 0b11111101;
      emulator.iRegister = 0x202;
      emulator.registers[0xA] = 0x1;
      emulator.registers[0xB] = 0x2;
      emulator.runNextInstruction();
      expect(mockFrontend.currentDisplay[0b00011000001]).to.equal(1);
      expect(mockFrontend.currentDisplay[0b00011000010]).to.equal(1);
      expect(mockFrontend.currentDisplay[0b00011000011]).to.equal(1);
      expect(mockFrontend.currentDisplay[0b00011000100]).to.equal(1);
      expect(mockFrontend.currentDisplay[0b00011000101]).to.equal(1);
      expect(mockFrontend.currentDisplay[0b00011000110]).to.equal(1);
      expect(mockFrontend.currentDisplay[0b00011000111]).to.equal(0);
      expect(mockFrontend.currentDisplay[0b00011001000]).to.equal(1);
    });
  });

  describe('Opcode 0xEX9E', () => {
    it('skips the next instruction if key located in register X is pressed', () => {
      emulator.memory[0x200] = 0xE7;
      emulator.memory[0x201] = 0x9E;
      emulator.registers[0x7] = 0x4;
      mockFrontend.keyStates[0x4] = 1;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x204);
    });

    it('does not skip the next instruction if key located in register X is not pressed', () => {
      emulator.memory[0x200] = 0xE7;
      emulator.memory[0x201] = 0x9E;
      emulator.registers[0x7] = 0x4;
      mockFrontend.keyStates[0x4] = 0;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x202);
    });
  });

  describe('Opcode 0xEXA1', () => {
    it('skips the next instruction if key located in register X is not pressed', () => {
      emulator.memory[0x200] = 0xE3;
      emulator.memory[0x201] = 0xA1;
      emulator.registers[0x3] = 0xF;
      mockFrontend.keyStates[0xF] = 0;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x204);
    });

    it('does not skip the next instruction if key located in register X is pressed', () => {
      emulator.memory[0x200] = 0xE3;
      emulator.memory[0x201] = 0xA1;
      emulator.registers[0x3] = 0xF;
      mockFrontend.keyStates[0xF] = 1;
      emulator.runNextInstruction();
      expect(emulator.programCounter).to.equal(0x202);
    });
  });

  describe('Opcode 0xFX07', () => {
    it('sets register X to current value of the delay timer', () => {
      emulator.memory[0x200] = 0xF6;
      emulator.memory[0x201] = 0x07;
      emulator.registers[0x6] = 0x12;
      emulator.delay = 0xA2;
      emulator.runNextInstruction();
      expect(emulator.registers[0x6]).to.equal(0xA2);
    });
  });

  describe('Opcode 0xFX0A', () => {
    it('sets register X to key pressed if key already pressed', () => {
      emulator.memory[0x200] = 0xF7;
      emulator.memory[0x201] = 0x0A;
      emulator.registers[0x7] = 0x66;
      mockFrontend.keyStates[0xA] = 1;
      emulator.runNextInstruction();
      expect(emulator.registers[0x7]).to.equal(0xA);
    });

    it('stops execution while wating for a key to be pressed', () => {
      emulator.memory[0x200] = 0xF7;
      emulator.memory[0x201] = 0x0A;
      emulator.memory[0x202] = 0x67;
      emulator.memory[0x203] = 0xFF;
      emulator.registers[0x7] = 0x66;
      emulator.runNextInstruction();
      emulator.runNextInstruction();
      expect(emulator.registers[0x7]).to.equal(0x66);
    });

    it('sets register X to key pressed when key eventually pressed', () => {
      emulator.memory[0x200] = 0xF7;
      emulator.memory[0x201] = 0x0A;
      emulator.memory[0x202] = 0x67;
      emulator.memory[0x203] = 0xFF;
      emulator.registers[0x7] = 0x66;
      emulator.runNextInstruction();
      mockFrontend.keyStates[0xC] = 1;
      emulator.runNextInstruction();
      expect(emulator.registers[0x7]).to.equal(0xC);
    });

    it('allows execution to continue after key pressed', () => {
      emulator.memory[0x200] = 0xF7;
      emulator.memory[0x201] = 0x0A;
      emulator.memory[0x202] = 0x67;
      emulator.memory[0x203] = 0xFF;
      emulator.registers[0x7] = 0x66;
      emulator.runNextInstruction();
      mockFrontend.keyStates[0xC] = 1;
      emulator.runNextInstruction();
      emulator.runNextInstruction();
      expect(emulator.registers[0x7]).to.equal(0xFF);
    });
  });

  describe('Opcode 0xFX15', () => {
    it('sets delay timer to value in register X', () => {
      emulator.memory[0x200] = 0xF0;
      emulator.memory[0x201] = 0x15;
      emulator.registers[0x0] = 0xC3;
      emulator.runNextInstruction();
      expect(emulator.delay).to.equal(0xC3);
    });
  });

  describe('Opcode 0xFX18', () => {
    it('sets sound timer to value in register X', () => {
      emulator.memory[0x200] = 0xFA;
      emulator.memory[0x201] = 0x18;
      emulator.registers[0xA] = 0xBB;
      emulator.runNextInstruction();
      expect(emulator.sound).to.equal(0xBB);
    });
  });

  describe('Opcode 0xFX29', () => {
    it('sets the I register to the location of the char specified in register X', () => {
      emulator.memory[0x200] = 0xF8;
      emulator.memory[0x201] = 0x29;
      emulator.registers[0x8] = 0xC;
      emulator.runNextInstruction();
      expect(emulator.memory[emulator.iRegister]).to.equal(0xF0);
      expect(emulator.memory[emulator.iRegister + 1]).to.equal(0x80);
      expect(emulator.memory[emulator.iRegister + 2]).to.equal(0x80);
      expect(emulator.memory[emulator.iRegister + 3]).to.equal(0x80);
      expect(emulator.memory[emulator.iRegister + 4]).to.equal(0xF0);
    });
  });

  describe('Opcode 0xFX33', () => {
    it('sets the I, I + 1, I + 2 memory values to the decimal reprentation of reigster X', () => {
      emulator.memory[0x200] = 0xF2;
      emulator.memory[0x201] = 0x33;
      emulator.registers[0x2] = 0xAD;
      emulator.iRegister = 0x432;
      emulator.runNextInstruction();
      expect(emulator.memory[0x432]).to.equal(0x1);
      expect(emulator.memory[0x433]).to.equal(0x7);
      expect(emulator.memory[0x434]).to.equal(0x3);
    });
  });

  describe('Opcode 0xFX55', () => {
    it('stores register 0 to X inclusive only into memory adresses I + n', () => {
      emulator.memory[0x200] = 0xF3;
      emulator.memory[0x201] = 0x55;
      emulator.registers[0x0] = 0x33;
      emulator.registers[0x1] = 0x22;
      emulator.registers[0x2] = 0x43;
      emulator.registers[0x3] = 0x12;
      emulator.registers[0x4] = 0x65;
      emulator.iRegister = 0x543;
      emulator.runNextInstruction();
      expect(emulator.memory[0x543]).to.equal(0x33);
      expect(emulator.memory[0x544]).to.equal(0x22);
      expect(emulator.memory[0x545]).to.equal(0x43);
      expect(emulator.memory[0x546]).to.equal(0x12);
      expect(emulator.memory[0x547]).to.equal(0x0);
    });

    it('changes register I to I + X + 1', () => {
      emulator.memory[0x200] = 0xF3;
      emulator.memory[0x201] = 0x55;
      emulator.registers[0x0] = 0x33;
      emulator.registers[0x1] = 0x22;
      emulator.registers[0x2] = 0x43;
      emulator.registers[0x3] = 0x12;
      emulator.registers[0x4] = 0x65;
      emulator.iRegister = 0x543;
      emulator.runNextInstruction();
      expect(emulator.iRegister).to.equal(0x547);
    });
  });

  describe('Opcode 0xFX65', () => {
    it('sets register 0 to X inclusive only to values set in memory adresses I + n', () => {
      emulator.memory[0x200] = 0xF2;
      emulator.memory[0x201] = 0x65;
      emulator.memory[0x366] = 0x16;
      emulator.memory[0x367] = 0x32;
      emulator.memory[0x368] = 0x10;
      emulator.memory[0x369] = 0xCC;
      emulator.registers[0x0] = 0x53;
      emulator.registers[0x1] = 0x88;
      emulator.registers[0x2] = 0x77;
      emulator.registers[0x3] = 0x99;
      emulator.iRegister = 0x366;
      emulator.runNextInstruction();
      expect(emulator.registers[0x0]).to.equal(0x16);
      expect(emulator.registers[0x1]).to.equal(0x32);
      expect(emulator.registers[0x2]).to.equal(0x10);
      expect(emulator.registers[0x3]).to.equal(0x99);
    });

    it('changes register I to I + X + 1', () => {
      emulator.memory[0x200] = 0xF2;
      emulator.memory[0x201] = 0x65;
      emulator.memory[0x366] = 0x16;
      emulator.memory[0x367] = 0x32;
      emulator.memory[0x368] = 0x10;
      emulator.memory[0x369] = 0xCC;
      emulator.registers[0x0] = 0x53;
      emulator.registers[0x1] = 0x88;
      emulator.registers[0x2] = 0x77;
      emulator.registers[0x3] = 0x99;
      emulator.iRegister = 0x366;
      emulator.runNextInstruction();
      expect(emulator.iRegister).to.equal(0x369);
    });
  });
});
