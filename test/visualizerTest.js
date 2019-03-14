const {
  expect
} = require('chai');
const MockFrontend = require('./mockFrontend');
const Chip8Cpu = require('../src/chip8cpu');
const Visualizer = require('../src/visualizer');

describe('Visualizer', () => {
  let mockFrontend = new MockFrontend();
  let emulator = new Chip8Cpu(mockFrontend);
  let visualizer = new Visualizer(emulator, true);
  beforeEach(() => {
    mockFrontend = new MockFrontend();
    emulator = new Chip8Cpu(mockFrontend);
    visualizer = new Visualizer(emulator, true);
  });

  describe('Disassembler', () => {
    describe('Opcode 0x0NNN', () => {
      it('disassembles as null', async () => {
        const result = visualizer.parseOpcodeIntoAssembly(0x00, 0x12);
        expect(result).to.to.equal(null);
      });
    });

    describe('Opcode 0x00E0', () => {
      it('disassembles as clear()', async () => {
        const result = visualizer.parseOpcodeIntoAssembly(0x00, 0xE0);
        expect(result).to.to.equal('clear()');
      });
    });

    describe('Opcode 0x00EE', () => {
      it('disassembles as return()', async () => {
        const result = visualizer.parseOpcodeIntoAssembly(0x00, 0xEE);
        expect(result).to.to.equal('return()');
      });
    });

    describe('Opcode 0x1NNN', () => {
      it('disassembles as jump(nnn)', async () => {
        const result = visualizer.parseOpcodeIntoAssembly(0x10, 0x65);
        expect(result).to.to.equal('jump(065)');
      });
    });

    describe('Opcode 0x2NNN', () => {
      it('disassembles as call(nnn)', async () => {
        const result = visualizer.parseOpcodeIntoAssembly(0x20, 0x8A);
        expect(result).to.to.equal('call(08a)');
      });
    });



    describe('Opcode 0x3XNN', () => {
      it('disassembles as "if vx equal nn skip"', async () => {
        const result = visualizer.parseOpcodeIntoAssembly(0x3B, 0x64);
        expect(result).to.to.equal('if vb equal 64 skip');
      });
    });

    describe('Opcode 0x4XNN', () => {
      it('disassembles as "if vx not nn skip"', async () => {
        const result = visualizer.parseOpcodeIntoAssembly(0x43, 0x16);
        expect(result).to.to.equal('if v3 not 16 skip');
      });
    });

    describe('Opcode 0x5XY0', () => {
    });


    describe('Opcode 0x6XNN', () => {

    });

    describe('Opcode 0x7XNN', () => {

    });

    describe('Opcode 0x8XY0', () => {
    });

    describe('Opcode 0x8XY1', () => {
    });

    describe('Opcode 0x8XY2', () => {
    });

    describe('Opcode 0x8XY3', () => {
    });

    describe('Opcode 0x8XY4', () => {
    });

    describe('Opcode 0x8XY5', () => {
    });

    describe('Opcode 0x8XY6', () => {
    });

    describe('Opcode 0x8XY7', () => {
    });

    describe('Opcode 0x8XYE', () => {
    });

    describe('Opcode 0xANNN', () => {
    });

    describe('Opcode 0xBNNN', () => {
    });

    describe('Opcode 0xCXNN', () => {
    });

    describe('Opcode 0xDXYN', () => {
    });

    describe('Opcode 0xEX9E', () => {
    });

    describe('Opcode 0xEXA1', () => {
    });

    describe('Opcode 0xFX07', () => {
    });

    describe('Opcode 0xFX0A', () => {
    });

    describe('Opcode 0xFX15', () => {
    });

    describe('Opcode 0xFX18', () => {
    });

    describe('Opcode 0xFX1E', () => {
    });

    describe('Opcode 0xFX29', () => {
    });

    describe('Opcode 0xFX33', () => {
    });

    describe('Opcode 0xFX55', () => {
    });

    describe('Opcode 0xFX65', () => {
    });
  });
});
