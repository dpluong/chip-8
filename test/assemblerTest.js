const { expect } = require('chai');
const Assembler = require('../src/asm');

describe('Assembler', () => {
  describe('Assembly to Opcodes', () => {
    it('translates clear() to 0x00E0', () => {
      const assembler = new Assembler('clear()');
      const result = assembler.translate();
      expect(result).be.equal('00e0');
    });

    it('translates return() to 0x00EE', () => {
      const assembler = new Assembler('return()');
      const result = assembler.translate();
      expect(result).be.equal('00ee');
    });

    it('translates jump(nnn) to 0x1NNN', () => {
      const assembler = new Assembler('jump(0fd)');
      const result = assembler.translate();
      expect(result).be.equal('10fd');
    });

    it('translates call(nnn) to 0x2NNN', () => {
      const assembler = new Assembler('call(68c)');
      const result = assembler.translate();
      expect(result).be.equal('268c');
    });

    it('translates "if vx equal nn skip" to 0x3XNN', () => {
      const assembler = new Assembler('if v8 equal 25 skip');
      const result = assembler.translate();
      expect(result).be.equal('3825');
    });

    it('translates "if vx not nn skip" to 0x4XNN', () => {
      const assembler = new Assembler('if vb not cc skip');
      const result = assembler.translate();
      expect(result).be.equal('4bcc');
    });

    it('translates "if vx equal vy skip" to 0x5XY0', () => {
      const assembler = new Assembler('if vb not 30 skip');
      const result = assembler.translate();
      expect(result).be.equal('5b30');
    });

    it('translates "vx = nn" to 0x6XNN', () => {
      const assembler = new Assembler('v0 = a3');
      const result = assembler.translate();
      expect(result).be.equal('60a3');
    });

    it('translates "vx = nn + vx" to 0x7XNN', () => {
      const assembler = new Assembler('v4 = 66 + vx');
      const result = assembler.translate();
      expect(result).be.equal('7466');
    });

    it('Opcode 0x8XY0', () => {
    });

    it('Opcode 0x8XY1', () => {
    });

    it('Opcode 0x8XY2', () => {
    });
    
    it('Opcode 0x8XY3', () => {
    });

    it('Opcode 0x8XY4', () => {
    });

    it('translates "vx = vy ^ vx" to 0x8XY3', () => {
      const assembler = new Assembler('vf = vc ^ vf');
      const result = assembler.translate();
      expect(result).be.equal('8fc3');
    });

    it('translates "vx = vy + vx" to 0x8XY4', () => {
      const assembler = new Assembler('v3 = v8 + v3');
      const result = assembler.translate();
      expect(result).be.equal('8384');
    });

    it('translates "vx = vx - vy" to 0x8XY5', () => {
      const assembler = new Assembler('v7 = v7 - vf');
      const result = assembler.translate();
      expect(result).be.equal('87f5');
    });

    it('Opcode 0x8XY6', () => {
    });

    it('Opcode 0x8XY7', () => {
    });

    it('Opcode 0x8XYE', () => {
    });

    it('Opcode 0xANNN', () => {
    });

    it('Opcode 0xBNNN', () => {
    });

    it('Opcode 0xCXNN', () => {
    });

    it('Opcode 0xDXYN', () => {
    });

    it('Opcode 0xEX9E', () => {
    });

    it('Opcode 0xEXA1', () => {
    });

    it('Opcode 0xFX07', () => {
    });

    it('Opcode 0xFX0A', () => {
    });

    it('Opcode 0xFX15', () => {
    });

    it('Opcode 0xFX18', () => {
    });

    it('Opcode 0xFX1E', () => {
    });

    it('Opcode 0xFX29', () => {
    });

    it('Opcode 0xFX33', () => {
    });

    it('Opcode 0xFX55', () => {
    });

    it('Opcode 0xFX65', () => {
    });
  });

  it('can parse multiple lines', () => {
    const assembler = new Assembler('clear()\nreturn()');
    const result = assembler.translate();
    expect(result).to.equal('00e0\n00ee');
  });
});
