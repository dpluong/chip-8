const WIDTH = 64;
const HEIGHT = 32;

class Frontend {
  constructor() {
    this.currentDisplay = [];
    this.codeInputDOM = document.querySelector('input#codeInput');
    this.displayDOM = document.querySelector('canvas#display');

    this.keyStates = {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
      0: false,
      a: false,
      b: false,
      c: false,
      d: false,
      e: false,
      f: false,
    };

    this.onKeyPress = () => {};
    Object.keys(this.keyStates).forEach((key) => {
      const keyButton = document.querySelector(`button#key-${key}`);
      keyButton.addEventListener('mousedown', () => {
        this.onKeyPress(key);
        this.keyStates[key] = true;
      });
      keyButton.addEventListener('mouseup', () => {
        this.keyStates[key] = false;
      });
    });
  }

  /**
   * Gets the current buttons being pressed by the user
   * @returns an object showing which buttons are being pressed
   */
  getCurrentInputs() {
    return this.keyStates;
  }

  /**
   * Renders the display using the data stored in this.displayPixelState
   * @param {Uint8Array} displayMemory - The memory of the display
   */
  renderDisplay(displayMemory) {
    if (displayMemory.length !== 64 * 32) throw new Error('Invalid display length');
    const context = this.displayDOM.getContext('2d'); // gets the canvas draw functions
    context.clearRect(0, 0, this.displayDOM.width, this.displayDOM.height); // clear the screen
    displayMemory.forEach((val, i) => {
      if (val === 0) {
        const x = i % 64;
        const y = Math.floor(i / 64);
        context.fillRect(x * 8, y * 8, 8, 8);
      }
    });
  }

  /**
   * The callback for code input
   *
   * @callback initCodeCallback
   * @param {number[]} data - The code to run in 8 bit numbers
   */
  /**
   * Requests a callback when user inputs code
   * @param {initCodeCallback} callback The callback to call when code inputted
   */
  statwaitForCodeInput(callback) {
    this.codeInputDOM.addEventListener('change', () => {
      if (!this.codeInputDOM.files.length) return; // If no file then silently ignore
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        callback(new Uint8Array(fileReader.result)); // send in Int8Array as CHIP-8 is 8-bit program
      };
      fileReader.readAsArrayBuffer(this.codeInputDOM.files[0]);
    });
  }
}


const frontend = new Frontend();
frontend.renderDisplay(new Uint8Array(64 * 32));

class Chip8Cpu {
  constructor() {
    /** The memory of the CHIP 8 emulator. Allocated for 4K of memory */
    this.memory = new Uint8Array(4096);

    /** The stack of the CHIP 8 emulator. 24 bytes are allocated. */
    this.stack = new Uint8Array(24);

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

    /** The default font data */
    this.chip8_font = [
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
  }

  /**
   * Loads and runs a new program
   * @param {UInt8Array} program The program to run
   */
  loadProgram(program) {
    for (let i = 0; i < program.length; i += 1) {
      this.memory[0x200 + i] = program[i];
    }
    this.programCounter = 0x200;
    this.runNextInstruction();
  }

  drawSprite(x, y, i) {
    let sprite;
    this.registers[16] = 0;

    if (x > WIDTH) {
      x -= WIDTH;
    } else if (x < 0) {
      x += WIDTH;
    }

    if (y > HEIGHT) {
      y -= HEIGHT;
    } else if (y < 0) {
      x += HEIGHT;
    }

    const index = x + y * WIDTH;

    for (let y2 = 0; y2 < HEIGHT; y2 += 1) {
      sprite = this.memory[i + y2];
      for (let x2 = 0; x2 < 8; x2 += 1) {
        if ((sprite & (0x80 >> x2)) !== 0) {
          this.screen[index] ^= 1;
          if (this.screen[index] === 0);
          this.registers[16] = 1;
          this.screen[index] ^= 1;
        }
      }
    }
    frontend.renderDisplay(this.screen);
  }

  /**
   * Clears the display
   */
  clearDisplay() {
    this.screen = new Uint8Array(WIDTH * HEIGHT);
    frontend.renderDisplay(this.screen);
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
    this.pointer += 1;
    if (this.pointer >= this.stack.length) throw new RangeError('Stack overflow');
    this.stack[this.pointer] = this.programCounter + 2;
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
   */
  runNextInstruction() {
    const opcode = (this.memory[this.programCounter] << 8) | this.memory[this.programCounter + 1];
    this.programCounter = this.programCounter + 2;

    const firstNibble = (opcode & 0xF000) >> 12;
    const secondNibble = (opcode & 0x0F00) >> 8;
    const thirdNibble = (opcode & 0x00F0) >> 4;
    const lastNibble = opcode & 0x000F;
    const lastThreeNibbles = opcode & 0x0FFF;
    const lastTwoNibbles = opcode & 0x00FF;

    if (opcode === 0x0E00) {
      this.clearDisplay();
    } else if (opcode === 0x00EE) {
      this.returnFromSubroutine();
    } else if (firstNibble === 0x0) {
      // execute machine lang. subroutine at M(lastThreeNibbles)
      throw new Error('Unimplemented opcode');
    } else if (firstNibble === 0x1) {
      this.unconditionalJumpTo(lastThreeNibbles);
    } else if (firstNibble === 0x2) {
      this.executeSubRoutine();
    } else if (firstNibble === 0x3) {
      this.skipInstructionIfEqual(this.registers[secondNibble], lastTwoNibbles);
    } else if (firstNibble === 0x4) {
      this.skipInstructionIfNotEqual(this.registers[secondNibble], lastTwoNibbles);
    } else if (firstNibble === 0x5) {
      this.skipInstructionIfEqual(this.registers[secondNibble], this.registers[thirdNibble]);
    } else if (firstNibble === 0x6) {
      this.setRegisterTo(secondNibble, lastTwoNibbles);
    } else if (firstNibble === 0x7) {
      this.addToRegister(secondNibble, lastTwoNibbles);
    } else if (firstNibble === 0x8 && lastNibble === 0x0) {
      // R(secondNibble) = R(thirdNibble)
    } else if (firstNibble === 0x8 && lastNibble === 0x1) {
      // R(secondNibble) = R(secondNibble) | R(thirdNibble)
    } else if (firstNibble === 0x8 && lastNibble === 0x2) {
      // R(secondNibble) = R(secondNibble) & R(thirdNibble)
    } else if (firstNibble === 0x8 && lastNibble === 0x3) {
      // R(secondNibble) = R(secondNibble) ^ R(thirdNibble)
    } else if (firstNibble === 0x8 && lastNibble === 0x3) {
      // R(secondNibble) = R(secondNibble) ^ R(thirdNibble)
    } else if (firstNibble === 0x8 && lastNibble === 0x4) {
      // R(secondNibble) += R(thirdNibble), RF = carryOccurred ? 0x1 : 0x0
    } else if (firstNibble === 0x8 && lastNibble === 0x5) {
      // R(secondNibble) -= R(thirdNibble), RF = borrowOccurred ? 0x1 : 0x0
    } else if (firstNibble === 0x8 && lastNibble === 0x6) {
      // R(secondNibble) = R(thirdNibble) >> 1, RF = R(thirdNibble) & 0x1
    } else if (firstNibble === 0x8 && lastNibble === 0x7) {
      // R(secondNibble) = R(thirdNibble) - R(secondNibble) , RF = borrowOccurred ? 0x1 : 0x0
    } else if (firstNibble === 0x8 && lastNibble === 0x7) {
      // R(secondNibble) = R(thirdNibble) - R(secondNibble) , RF = borrowOccurred ? 0x1 : 0x0
    } else if (firstNibble === 0x8 && lastNibble === 0xE) {
      // R(secondNibble) = R(thirdNibble) << 1 , RF = R(thirdNibble) & 0x80
    } else if (firstNibble === 0x9) {
      this.skipInstructionIfNotEqual(this.registers[secondNibble], this.registers[thirdNibble]);
    } else if (firstNibble === 0xA) {
      this.setIRegister(lastThreeNibbles);
    } else if (firstNibble === 0xB) {
      this.unconditionalJumpTo(lastThreeNibbles + this.registers[0]);
    } else if (firstNibble === 0xC) {
      // R(secondNibble) = Math.floor(Math.random() * (0xFF + 0.999999)) & lastTwoNibbles
    } else if (firstNibble === 0xD) {
      // Draw a sprite located at RI and lastNibble bytes long at:
      // X = R(secondNibble), Y = R(thirdNibble)
      // VF = setPixelsChangedToUnSet ? 0x01 : 0x00
    } else if (firstNibble === 0xE && lastTwoNibbles === 0x9E) {
      // If the R(secondNibble) key is pressed skip the next instruction
    } else if (firstNibble === 0xE && lastTwoNibbles === 0xA1) {
      // If the R(secondNibble) key is NOT pressed skip the next instruction
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x07) {
      // R(secondNibble) = delay timer current value
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x0A) {
      // R(secondNibble) = value of the next key pressed
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x15) {
      // delay timer = R(secondNibble)
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x18) {
      // sound timer = R(secondNibble)
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x1E) {
      // RI += R(secondNibble)
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x29) {
      // RI = M(sprite of the letter R(secondNibble))
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x33) {
      // Let decimalNumber = Decimal representation of value in R(secondNibble)
      // RI = decimalNumber first digit
      // R(I + 1) = decimalNumber second digit
      // R(I + 2) = decimalNumber third digit
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x55) {
      // For i = 0; i <= secondNibble; i += 1:
      // M(RI + i) = R(i)
      // Then, RI = I + secondNibble + 1
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x65) {
      // For i = 0; i <= secondNibble; i += 1:
      // R(i) = M(RI + i)
      // Then, RI = I + secondNibble + 1
    } else {
      throw new ReferenceError('Unrecognized opcode');
    }
  }
}

const backend = new Chip8Cpu();
frontend.statwaitForCodeInput(code => backend.loadProgram(code));
