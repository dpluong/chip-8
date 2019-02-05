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
      expect(emulator.registers[0xC]).to.equal(0x7A);
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
});
