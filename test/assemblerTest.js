var { expect } = require('chai');
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

    it('translates "vx = vy" to 0x8XY0', () => {
      const assembler = new Assembler('vc = va');
      const result = assembler.translate();
      expect(result).be.equal('8ca0');
    });

    it('translates "vx = vy | vx" to 0x8XY1', () => {
      const assembler = new Assembler('v3 = v4 | v3');
      const result = assembler.translate();
      expect(result).be.equal('8341');
    });

    it('translates "vx = vy & vx" to 0x8XY2', () => {
      const assembler = new Assembler('vb = v7 & vb');
      const result = assembler.translate();
      expect(result).be.equal('8b72');
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

    it('translates "vx = shiftRight(vy)" to 0x8XY6', () => {
      const assembler = new Assembler('v9 = shiftRight(vd)');
      const result = assembler.translate();
      expect(result).be.equal('89d6');
    });

    it('translates "vx = vy - vx" to 0x8XY7', () => {
      const assembler = new Assembler('v7 = v1 - v7');
      const result = assembler.translate();
      expect(result).be.equal('8717');
    });

    it('translates "vx = shiftLeft(vy)" to 0x8XYE', () => {
      const assembler = new Assembler('vc = shiftLeft(v5)');
      const result = assembler.translate();
      expect(result).be.equal('8c5e');
    });

    it('translates "if vx not vy skip" to 0x9XY0', () => {
    const assembler = new Assembler('if v2 not ve skip');
    const result = assembler.translate();
    expect(result).be.equal('92e0');
    });
    
    it('translates "vi = nnn" to 0xANNN', () => {
      const assembler = new Assembler('vi = 2ec');
      const result = assembler.translate();
      expect(result).be.equal('A2ec');
    });

    it('translates "jump(nnn + v0)" to 0xBNNN', () => {
      const assembler = new Assembler('jump(1f5 + v0)');
      const result = assembler.translate();
      expect(result).be.equal('b1f5');
    });

    it('translates "vx = rand(nn)" to 0xCXNN', () => {
      const assembler = new Assembler('vb = rand(23)');
      const result = assembler.translate();
      expect(result).be.equal('cb23');
    });

    it('translates "draw(vx, vy, n)" to 0xDXYN', () => {
      const assembler = new Assembler('draw(v0, v8, 2)');
      const result = assembler.translate();
      expect(result).be.equal('d082');
    });

    it('translates "if vx equal key skip" to 0xEX9E', () => {
      const assembler = new Assembler('if va equal key skip');
      const result = assembler.translate();
      expect(result).be.equal('ea9e');
    });

    it('translates "if vx not key skip" to 0xEXA1', () => {
      const assembler = new Assembler('if v3 not key skip');
      const result = assembler.translate();
      expect(result).be.equal('e3a1');
    });

    it('translates "vx = delay" to 0xFX07', () => {
      const assembler = new Assembler('v9 = delay');
      const result = assembler.translate();
      expect(result).be.equal('f907');
    });

    it('translates "vx = key" to 0xFX0A', () => {
      const assembler = new Assembler('ve = key');
      const result = assembler.translate();
      expect(result).be.equal('fe0a');
    });

    it('translates "delay = vx" to 0xFX15', () => {
      const assembler = new Assembler('delay = v1');
      const result = assembler.translate();
      expect(result).be.equal('f115');
    });

    it('translates "sound = vx" to 0xFX18', () => {
      const assembler = new Assembler('sound = v2');
      const result = assembler.translate();
      expect(result).be.equal('f218');
    });

    it('translates "vi = vx + vi" to 0xFX1E', () => {
      const assembler = new Assembler('vi = v3 + vi');
      const result = assembler.translate();
      expect(result).be.equal('f31e');
    });

    it('translates "vi = memad(va)" to 0xFX29', () => {
      const assembler = new Assembler('vi = memad(v2)');
      const result = assembler.translate();
      expect(result).be.equal('f229');
    });

    it('translates "memad(vi) = vx" to 0xFX33', () => {
      const assembler = new Assembler('memad(vi) = v4');
      const result = assembler.translate();
      expect(result).be.equal('f433');
    });

    it('translates "memad(vi) = v0 to vx" to 0xFX55', () => {
      const assembler = new Assembler('memad(vi) = v0 to v5');
      const result = assembler.translate();
      expect(result).be.equal('f555');
    });
    
    it('translates "v0 to vx = memad(vi)" to 0xFX65', () => {
      const assembler = new Assembler('v0 to ve = memad(vi)');
      const result = assembler.translate();
      expect(result).be.equal('fe65');
    });
  });

  it('can parse multiple lines', () => {
    const assembler = new Assembler('clear()\nreturn()');
    const result = assembler.translate();
    expect(result).to.equal('00e0\n00ee');
  });
});
