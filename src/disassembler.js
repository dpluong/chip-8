/* eslint-disable no-else-return */
class Disassembler {
  static numToHex(num, minLength) {
    let hex = num.toString(16).toLowerCase();
    while (hex.length < minLength) {
      hex = `0${hex}`;
    }
    return hex;
  }

  static parseOpcodeIntoAssembly(firstByte, lastByte) {
    const opcode = (firstByte << 8) | lastByte;

    const firstNibble = (opcode & 0xF000) >> 12;
    const secondNibble = (opcode & 0x0F00) >> 8;
    const thirdNibble = (opcode & 0x00F0) >> 4;
    const lastNibble = opcode & 0x000F;
    const lastThreeNibbles = opcode & 0x0FFF;
    const lastTwoNibbles = opcode & 0x00FF;
    if (opcode === 0x00E0) {
      return 'clear()';
    } else if (opcode === 0x00EE) {
      return 'return()';
    } else if (firstNibble === 0x0) {
      return null;
    } else if (firstNibble === 0x1) {
      return `jump(${Disassembler.numToHex(lastThreeNibbles, 3)})`;
    } else if (firstNibble === 0x2) {
      return `call(${Disassembler.numToHex(lastThreeNibbles, 3)})`;
    } else if (firstNibble === 0x3) {
      return `if v${Disassembler.numToHex(secondNibble, 1)} equal ${Disassembler.numToHex(lastTwoNibbles, 2)} skip`;
    } else if (firstNibble === 0x4) {
      return `if v${Disassembler.numToHex(secondNibble, 1)} not ${Disassembler.numToHex(lastTwoNibbles, 2)} skip`;
    } else if (firstNibble === 0x5 && lastNibble === 0x0) {
      return `if v${Disassembler.numToHex(secondNibble, 1)} equal v${Disassembler.numToHex(thirdNibble, 1)} skip`;
    } else if (firstNibble === 0x6) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = ${Disassembler.numToHex(lastTwoNibbles, 2)}`;
    } else if (firstNibble === 0x7) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = ${Disassembler.numToHex(lastTwoNibbles, 2)} + v${Disassembler.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x0) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = v${Disassembler.numToHex(thirdNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x1) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = ${Disassembler.numToHex(thirdNibble, 1)} | v${Disassembler.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x2) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = ${Disassembler.numToHex(thirdNibble, 1)} & v${Disassembler.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x3) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = ${Disassembler.numToHex(thirdNibble, 1)} ^ v${Disassembler.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x4) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = ${Disassembler.numToHex(thirdNibble, 1)} + v${Disassembler.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x5) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = ${Disassembler.numToHex(secondNibble, 1)} - v${Disassembler.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x6) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = shiftRight${Disassembler.numToHex(thirdNibble, 1)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x7) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = ${Disassembler.numToHex(thirdNibble, 1)} - v${Disassembler.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0xE) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = shiftLeft${Disassembler.numToHex(thirdNibble, 1)}`;
    } else if (firstNibble === 0x9) {
      return `if v${Disassembler.numToHex(secondNibble, 1)} not v${Disassembler.numToHex(thirdNibble, 1)} skip`;
    } else if (firstNibble === 0xA) {
      return `vi = ${Disassembler.numToHex(lastThreeNibbles, 3)}`;
    } else if (firstNibble === 0xB) {
      return `jump(${Disassembler.numToHex(lastThreeNibbles, 3)} + v0)`;
    } else if (firstNibble === 0xC) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = rand(${Disassembler.numToHex(lastTwoNibbles, 2)})`;
    } else if (firstNibble === 0xD) {
      return `draw(v${Disassembler.numToHex(secondNibble, 1)}, v${Disassembler.numToHex(thirdNibble, 1)}, ${Disassembler.numToHex(lastNibble, 1)})`;
    } else if (firstNibble === 0xE && lastTwoNibbles === 0x9E) {
      return `if v${Disassembler.numToHex(secondNibble, 1)} equal key skip`;
    } else if (firstNibble === 0xE && lastTwoNibbles === 0xA1) {
      return `if v${Disassembler.numToHex(secondNibble, 1)} not key skip`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x07) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = delay`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x0A) {
      return `v${Disassembler.numToHex(secondNibble, 1)} = key`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x15) {
      return `delay = v${Disassembler.numToHex(secondNibble, 1)}`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x18) {
      return `sound = v${Disassembler.numToHex(secondNibble, 1)}`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x1E) {
      return `vi = v${Disassembler.numToHex(secondNibble, 1)} + vi`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x29) {
      return `vi = memad(${Disassembler.numToHex(secondNibble, 1)})`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x33) {
      return `memad(vi) = v${Disassembler.numToHex(secondNibble, 1)}`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x55) {
      return `memad(vi) = v0 to v${Disassembler.numToHex(secondNibble, 1)}`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x65) {
      return `v0 to v${Disassembler.numToHex(secondNibble, 1)} = memad(vi)`;
    } else {
      return null;
    }
  }
}

if (typeof exports !== 'undefined') {
  module.exports = Disassembler;
}
