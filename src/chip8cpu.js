const WIDTH = 64;
const HEIGHT = 32;

class Chip8Cpu {
  /**
   * Initializes a new CHIP-8 Emulator
   * @param {Frontend} frontend The frontend class
   */
  constructor(frontend) {
    /** The frontend instance */
    this.frontend = frontend;
    /** Callback when emulator state is updated */
    this.onUpdateState = () => {};

    this.resetEmulator();
  }

  resetEmulator() {
    /** The memory of the CHIP 8 emulator. Allocated for 4K of memory */
    this.memory = new Uint8Array(4096);

    /** The stack of the CHIP 8 emulator. 12 spaces are allocated. */
    this.stack = new Uint16Array(12);

    /** The stack pointer; indicates the current position of the stack */
    this.pointer = 0;

    /** The program counter; indicates the address of the NEXT instruction to be run */
    this.programCounter = 0;

    /** The registers of the CHIP 8 emulator. 16 registers are provided (from 0 to F) */
    this.registers = new Uint8Array(16);

    /** The I register; initalizes at 0  */
    this.iRegister = 0;

    /** The memory describing the state of the screen pixels */
    this.screen = new Uint8Array(WIDTH * HEIGHT);

    /** The delay timer; initalizes at 0 */
    this.delay = 0;

    /** The sound timer; initalizes at 0 */
    this.sound = 0;

    /** If not null, indicates the register where the next key press should go into */
    this.nextKeypressRegister = null;

    const chip8FontData = [
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
      0xF0, 0x80, 0xF0, 0x80, 0x80, // F
    ];
    for (let i = 0; i < chip8FontData.length; i += 1) {
      this.memory[i] = chip8FontData[i];
    }

    /** The clock speed in instructions per second */
    this.clockSpeed = 600;
  }

  /**
   * Loads and runs a new program
   * @param {UInt8Array} program The program to run
   */
  loadProgram(program) {
    this.clockSpeed = 0;
    setTimeout(() => {
      this.resetEmulator();
      for (let i = 0; i < program.length; i += 1) {
        this.memory[0x200 + i] = program[i];
      }
      this.programCounter = 0x200;
      this.runNextInstruction(true);
    }, 250);
  }

  getSaveState() {
    return {
      memory: this.memory.slice(0),
      stack: this.stack.slice(0),
      pointer: this.pointer,
      programCounter: this.programCounter,
      registers: this.registers.slice(0),
      iRegister: this.iRegister,
      screen: this.screen.slice(0),
      delay: this.delay,
      sound: this.sound,
      nextKeypressRegister: this.nextKeypressRegister,
    };
  }

  loadSaveState(state) {
    this.memory = state.memory.slice(0);
    this.stack = state.stack.slice(0);
    this.pointer = state.pointer;
    this.programCounter = state.programCounter;
    this.registers = state.registers.slice(0);
    this.iRegister = state.iRegister;
    this.screen = state.screen.slice(0);
    this.delay = state.delay;
    this.sound = state.sound;
    this.nextKeypressRegister = state.nextKeypressRegister;
    this.frontend.renderDisplay(this.screen);
    this.onUpdateState(true);
  }

  /**
   * Draws a sprite on the screen.
   * Sets register F to if any on pixels got changed to off
   * @param {number} x The x location of the top-left of the sprite
   * @param {number} y The y location of the top-left of the sprite
   * @param {number} addressStart The beginning of the sprite data
   * @param {number} height The height of the sprite
   */
  drawSprite(x, y, addressStart, height) {
    this.registers[0xF] = 0;
    for (let spriteLine = 0; spriteLine < height; spriteLine += 1) {
      const sprite = this.memory[addressStart + spriteLine];
      for (let x2 = 0; x2 < 8; x2 += 1) {
        if ((sprite & (0x80 >> x2)) !== 0) {
          if (this.screen[x + x2 + ((y + spriteLine) * WIDTH)] === 1) {
            this.registers[0xF] = 1;
          }
          this.screen[x + x2 + ((y + spriteLine) * WIDTH)] ^= 1;
        }
      }
    }
    this.frontend.renderDisplay(this.screen);
  }

  /**
   * Clears the display
   */
  clearDisplay() {
    this.screen = new Uint8Array(WIDTH * HEIGHT);
    this.frontend.renderDisplay(this.screen);
  }

  /**
   * Returns control to the callerafter a subroutine is completed
   */
  returnFromSubroutine() {
    this.pointer -= 1;
    if (this.pointer < 0) throw new RangeError('Stack underflow');
    this.programCounter = this.stack[this.pointer];
  }

  /**
   * Jumps to a new position in memory
   * @param {number} location The memory address to jump to
   */
  unconditionalJumpTo(location) {
    this.programCounter = location;
  }

  /**
   * Executes a subroutine
   * @param {number} location The location of the subroutine
   */
  executeSubRoutine(location) {
    if (this.pointer >= this.stack.length) throw new RangeError('Stack overflow');
    this.stack[this.pointer] = this.programCounter;
    this.pointer += 1;
    this.programCounter = location;
  }

  /**
   * Skips the next instruction if the two values are equal
   * @param {number} firstValue The first value to compare
   * @param {number} secondValue The second value to compare
   */
  skipInstructionIfEqual(firstValue, secondValue) {
    if (firstValue === secondValue) {
      this.programCounter += 2;
    }
  }

  /**
   * Skips the next instruction if the two values are NOT equal
   * @param {number} firstValue The first value to compare
   * @param {number} secondValue The second value to compare
   */
  skipInstructionIfNotEqual(firstValue, secondValue) {
    if (firstValue !== secondValue) {
      this.programCounter += 2;
    }
  }

  /**
   * Sets a register to a new value
   * @param {number} registerIndex The register index to modify
   * @param {number} newValue The new value of the register
   */
  setRegisterTo(registerIndex, newValue) {
    this.registers[registerIndex] = newValue;
  }

  /**
   * Adds a value to a register
   * @param {number} registerIndex The register index to modify
   * @param {number} valueToAdd The value to add to the register
   */
  addToRegister(registerIndex, valueToAdd) {
    this.registers[registerIndex] += valueToAdd;
  }

  /**
   * Sets the I register to a new value
   * @param {number} newValue The new value to set
   */
  setIRegister(newValue) {
    this.iRegister = newValue;
  }

  /**
   * Runs the next instruction according to the program counter
   * @param {boolean} isLastInstructionOfFrame If this is the last instruction for this frame
   */
  runNextInstruction(isLastInstructionOfFrame = false) {
    try {
      if (this.nextKeypressRegister != null) {
        const currentKeyPressed = this.frontend.keyStates.findIndex(key => key !== 0);
        if (currentKeyPressed !== -1) {
          this.registers[this.nextKeypressRegister] = currentKeyPressed;
          this.frontend.keyStates[currentKeyPressed] = 0;
          this.nextKeypressRegister = null;
        }
      } else {
        const firstByte = this.memory[this.programCounter];
        const lastByte = this.memory[this.programCounter + 1];
        const opcode = (firstByte << 8) | lastByte;
        this.programCounter += 2;

        const firstNibble = (opcode & 0xF000) >> 12;
        const secondNibble = (opcode & 0x0F00) >> 8;
        const thirdNibble = (opcode & 0x00F0) >> 4;
        const lastNibble = opcode & 0x000F;
        const lastThreeNibbles = opcode & 0x0FFF;
        const lastTwoNibbles = opcode & 0x00FF;

        if (opcode === 0x00E0) {
          this.clearDisplay();
        } else if (opcode === 0x00EE) {
          this.returnFromSubroutine();
        } else if (firstNibble === 0x0) {
          // execute machine lang. subroutine at M(lastThreeNibbles)
          // throw new Error('Unimplemented opcode');
        } else if (firstNibble === 0x1) {
          this.unconditionalJumpTo(lastThreeNibbles);
        } else if (firstNibble === 0x2) {
          this.executeSubRoutine(lastThreeNibbles);
        } else if (firstNibble === 0x3) {
          this.skipInstructionIfEqual(this.registers[secondNibble], lastTwoNibbles);
        } else if (firstNibble === 0x4) {
          this.skipInstructionIfNotEqual(this.registers[secondNibble], lastTwoNibbles);
        } else if (firstNibble === 0x5 && lastNibble === 0x0) {
          this.skipInstructionIfEqual(this.registers[secondNibble], this.registers[thirdNibble]);
        } else if (firstNibble === 0x6) {
          this.setRegisterTo(secondNibble, lastTwoNibbles);
        } else if (firstNibble === 0x7) {
          this.addToRegister(secondNibble, lastTwoNibbles);
        } else if (firstNibble === 0x8 && lastNibble === 0x0) {
          this.setRegisterTo(secondNibble, this.registers[thirdNibble]);
        } else if (firstNibble === 0x8 && lastNibble === 0x1) {
          const newValue = this.registers[secondNibble] | this.registers[thirdNibble];
          this.setRegisterTo(secondNibble, newValue);
        } else if (firstNibble === 0x8 && lastNibble === 0x2) {
          const newValue = this.registers[secondNibble] & this.registers[thirdNibble];
          this.setRegisterTo(secondNibble, newValue);
        } else if (firstNibble === 0x8 && lastNibble === 0x3) {
          const newValue = this.registers[secondNibble] ^ this.registers[thirdNibble];
          this.setRegisterTo(secondNibble, newValue);
        } else if (firstNibble === 0x8 && lastNibble === 0x4) {
          const carryOccurred = (this.registers[thirdNibble] + this.registers[secondNibble]) > 0xFF;
          this.registers[0xF] = carryOccurred ? 1 : 0;
          this.registers[secondNibble] += this.registers[thirdNibble];
        } else if (firstNibble === 0x8 && lastNibble === 0x5) {
          const borrowOccurred = this.registers[thirdNibble] > this.registers[secondNibble];
          this.registers[0xF] = borrowOccurred ? 0 : 1;
          this.registers[secondNibble] -= this.registers[thirdNibble];
        } else if (firstNibble === 0x8 && lastNibble === 0x6) {
          this.registers[0xF] = this.registers[thirdNibble] & 0x1;
          this.registers[secondNibble] = this.registers[thirdNibble] >> 1;
        } else if (firstNibble === 0x8 && lastNibble === 0x7) {
          const borrowOccurred = this.registers[secondNibble] > this.registers[thirdNibble];
          this.registers[0xF] = borrowOccurred ? 1 : 0;
          this.registers[secondNibble] = this.registers[thirdNibble] - this.registers[secondNibble];
        } else if (firstNibble === 0x8 && lastNibble === 0xE) {
          this.registers[0xF] = (this.registers[thirdNibble] & 0x80) >> 7;
          this.registers[secondNibble] = this.registers[thirdNibble] << 1;
        } else if (firstNibble === 0x9) {
          this.skipInstructionIfNotEqual(this.registers[secondNibble], this.registers[thirdNibble]);
        } else if (firstNibble === 0xA) {
          this.setIRegister(lastThreeNibbles);
        } else if (firstNibble === 0xB) {
          this.unconditionalJumpTo(lastThreeNibbles + this.registers[0]);
        } else if (firstNibble === 0xC) {
          const newRandomValue = Math.floor(Math.random() * (0xFF + 0.999999)) & lastTwoNibbles;
          this.registers[secondNibble] = newRandomValue;
        } else if (firstNibble === 0xD) {
          this.drawSprite(this.registers[secondNibble], this.registers[thirdNibble], this.iRegister, lastNibble);
        } else if (firstNibble === 0xE && lastTwoNibbles === 0x9E) {
          const keyToCheck = this.registers[secondNibble];
          if (this.frontend.keyStates[keyToCheck]) {
            this.programCounter += 2;
          }
        } else if (firstNibble === 0xE && lastTwoNibbles === 0xA1) {
          const keyToCheck = this.registers[secondNibble];
          if (!this.frontend.keyStates[keyToCheck]) {
            this.programCounter += 2;
          }
        } else if (firstNibble === 0xF && lastTwoNibbles === 0x07) {
          this.registers[secondNibble] = this.delay;
        } else if (firstNibble === 0xF && lastTwoNibbles === 0x0A) {
          const currentKeyPressed = this.frontend.keyStates.findIndex(key => key !== 0);
          if (currentKeyPressed !== -1) {
            this.registers[secondNibble] = currentKeyPressed;
          } else {
            this.nextKeypressRegister = secondNibble;
          }
        } else if (firstNibble === 0xF && lastTwoNibbles === 0x15) {
          this.delay = this.registers[secondNibble];
        } else if (firstNibble === 0xF && lastTwoNibbles === 0x18) {
          this.sound = this.registers[secondNibble];
          this.frontend.emitBeep((1000 / 60) * this.sound);
        } else if (firstNibble === 0xF && lastTwoNibbles === 0x1E) {
          this.iRegister += this.registers[secondNibble];
        } else if (firstNibble === 0xF && lastTwoNibbles === 0x29) {
          // RI = M(sprite of the letter R(secondNibble))
          this.iRegister = (this.registers[secondNibble] % 0xF) * 5;
        } else if (firstNibble === 0xF && lastTwoNibbles === 0x33) {
          const decimalNumber = this.registers[secondNibble];
          this.memory[this.iRegister] = Math.floor(decimalNumber / 100);
          this.memory[this.iRegister + 1] = Math.floor((decimalNumber / 10)) % 10;
          this.memory[this.iRegister + 2] = decimalNumber % 10;
        } else if (firstNibble === 0xF && lastTwoNibbles === 0x55) {
          for (let i = 0; i <= secondNibble; i += 1) {
            this.memory[this.iRegister + i] = this.registers[i];
          }
          this.iRegister += secondNibble + 1;
        } else if (firstNibble === 0xF && lastTwoNibbles === 0x65) {
          for (let i = 0; i <= secondNibble; i += 1) {
            this.registers[i] = this.memory[this.iRegister + i];
          }
          this.iRegister += secondNibble + 1;
        } else {
          throw new ReferenceError('Unrecognized opcode');
        }
      }


      this.onUpdateState();
      if (typeof window !== 'undefined' && window.requestAnimationFrame && isLastInstructionOfFrame) {
        if (this.delay > 0) {
          this.delay -= 1;
        }
        if (this.sound > 0) {
          this.sound -= 1;
        }
        window.requestAnimationFrame(() => {
          const instructionsThisFrame = Math.floor(this.clockSpeed / 60);
          for (let i = 0; i < instructionsThisFrame; i += 1) {
            this.runNextInstruction(i === 9);
          }
        }); // requestAnimationFrame is approx 60Hz
      }
    } catch (e) {
      this.frontend.handleError(e);
      throw e;
    }
  }
}

if (typeof exports !== 'undefined') {
  module.exports = Chip8Cpu;
}
