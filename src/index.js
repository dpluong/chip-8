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

    Object.keys(this.keyStates).forEach((key) => {
      const keyButton = document.querySelector(`button#key-${key}`);
      keyButton.addEventListener('mousedown', () => {
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

// Chip 8 emulator


// Chip 8 cpu

class Chip8Cpu {
  constructor() {
    // Allocate memory
    this.memory = new Uint8Array(4096);
    // Allocate stack
    this.stack = new Uint8Array(16);
    // Set pointer to 0
    this.pointer = 0;
    // Set program counter to 0
    this.programCounter = 0;
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
    this.register[16] = 0;

    if (x > this.width) {
      x -= this.width;
    } else if (x < 0) {
      x += this.width;
    }

    if (y > this.height) {
      y -= this.height;
    } else if (y < 0) {
      x += this.height;
    }

    const index = x + y * this.width;

    for (let y2 = 0; y2 < this.height; y2 += 1) {
      sprite = this.memory[i + y2];
      for (let x2 = 0; x2 < 8; x2 += 1) {
        if ((sprite & (0x80 >> x2)) !== 0) {
          this.screen[index] ^= 1;
          if (this.screen[index] === 0);
          this.register[16] = 1;
          this.screen[index] ^= 1;
        }
      }
    }
    frontend.renderDisplay(this.screen);
  }

  runNextInstruction() {
    const opcode = this.memory[this.programCounter] << 8 | this.memory[this.programCounter + 1];
    this.programCounter = this.programCounter + 2;

    const x = opcode & 0x0F00 >> 8;
    const y = opcode & 0x00F0 >> 4;
    const nnn = opcode & 0x0FFF;
    const nn = opcode & 0x00FF;
    const n = opcode & 0x000F;

    switch (opcode & 0xF000) {
      case 0x00E0:
      {
        for (let i = 0; i < this.screen.length; i += 1) {
          this.screen = 0;
        }
        break;
      }

      case 0x00EE:
      {
        this.pointer -= 1;
        this.programCounter = this.stack[this.pointer];
        break;
      }

      case 0x1000:
      {
        this.programCounter = nnn;
        break;
      }

      case 0x2000:
      {
        this.pointer += 1;
        this.stack.push(this.programCounter);
        this.programCounter = nnn;

        break;
      }

      case 0x3000:
      {
        if (this.register[x] === nn) {
          this.programCounter += 2;
        }
        break;
      }

      case 0x4000:
      {
        if (this.register[x] !== nn) {
          this.programCounter += 2;
        }
        break;
      }

      case 0x5000:
      {
        if (this.register[x] === this.register[y]) {
          this.programCounter += 2;
        }
        break;
      }

      case 0x6000:
      {
        this.register[x] = nn;
        break;
      }

      case 0x7000:
      {
        this.register[x] += nn;
        break;
      }

      case 0x8000:
      {
        break;
      }

      case 0x9000:
      {
        if (this.register[x] !== this.register[y]) {
          this.programCounter += 2;
        }
        break;
      }

      case 0xA000:
      {
        this.I = nnn;
        break;
      }

      case 0xB000:
      {
        this.programCounter = nnn + this.register[0];
        break;
      }

      default:
      {
        break;
      }
    }
  }
}

const backend = new Chip8Cpu();
frontend.statwaitForCodeInput(code => backend.loadProgram(code));
