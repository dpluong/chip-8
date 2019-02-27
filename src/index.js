const WIDTH = 64;
const HEIGHT = 32;

class Frontend {
  constructor() {
    this.currentDisplay = [];
    this.codeInputDOM = document.querySelector('input#codeInput');
    this.displayDOM = document.querySelector('canvas#display');

    this.keyStates = new Uint8Array(16);

    Object.keys(this.keyStates).forEach((_key, i) => {
      const keyButton = document.querySelector(`button#key-${i.toString(16)}`);
      keyButton.addEventListener('mousedown', () => {
        this.keyStates[i] = 0x1;
      });
      keyButton.addEventListener('mouseup', () => {
        this.keyStates[i] = 0x0;
      });
    });
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
      this.codeInputDOM.disabled = true;
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        callback(new Uint8Array(fileReader.result)); // send in Int8Array as CHIP-8 is 8-bit program
      };
      fileReader.readAsArrayBuffer(this.codeInputDOM.files[0]);
    });
  }

  /**
   * Handles an error emitted by the Chip 8 engine
   * @param {Error} e The error that occurred
   */
  // eslint-disable-next-line class-methods-use-this
  handleError(e) {
    document.body.textContent = `An error occurred trying to run the program! ${e.message}`;
  }
}

class Visualizer {
  /**
   * Initalizes a new Visualizer
   * @param {Chip8Cpu} chip8Cpu The CPU to visualize
   */
  constructor(chip8Cpu) {
    this.chip8Cpu = chip8Cpu;
    this.visualizerActive = false;
    this.toggleVisualizerDOM = document.querySelector('button#visualizerToggle');
    this.visualizerContainerDOM = document.querySelector('div#visualizerContainer');
    this.registerTableBodyDOM = document.querySelector('tbody#visualizerRegisterTableBody');
    this.registerValuesDOM = [];

    this.toggleVisualizerDOM.addEventListener('click', () => {
      if (this.visualizerActive) {
        this.disableVisualizer();
      } else {
        this.enableVisualizer();
      }
    });
  }

  enableVisualizer() {
    this.visualizerActive = true;
    this.toggleVisualizerDOM.textContent = 'Disable Visualizer';
    this.visualizerContainerDOM.style.display = '';

    this.chip8Cpu.onUpdateState = () => this.updateVisualizerTables();

    this.registerTableBodyDOM.innerHTML = '';
    this.chip8Cpu.registers.forEach((regVal, index) => {
      const row = document.createElement('tr');
      const registerCell = document.createElement('td');
      const valueCell = document.createElement('td');
      registerCell.textContent = `Register ${index}`;
      valueCell.textContent = regVal;
      row.appendChild(registerCell);
      row.appendChild(valueCell);
      this.registerValuesDOM.push(valueCell);
      this.registerTableBodyDOM.appendChild(row);
    });
    const row = document.createElement('tr');
    const registerCell = document.createElement('td');
    const valueCell = document.createElement('td');
    registerCell.textContent = 'Register I';
    valueCell.textContent = this.chip8Cpu.iRegister;
    row.appendChild(registerCell);
    row.appendChild(valueCell);
    this.registerValuesDOM.push(valueCell);
    this.registerTableBodyDOM.appendChild(row);
  }

  disableVisualizer() {
    this.visualizerActive = false;
    this.toggleVisualizerDOM.textContent = 'Enable Visualizer';
    this.visualizerContainerDOM.style.display = 'none';
  }

  updateVisualizerTables() {
    this.chip8Cpu.registers.forEach((regVal, index) => {
      if (this.registerValuesDOM[index].textContent !== regVal.toString()) {
        this.registerValuesDOM[index].textContent = regVal;
      }
    });
    if (this.registerValuesDOM[this.registerValuesDOM.length - 1].textContent !== this.chip8Cpu.iRegister.toString()) {
      this.registerValuesDOM[this.registerValuesDOM.length - 1].textContent = this.chip8Cpu.iRegister;
    }
  }
}

class Chip8Cpu {
  /**
   * Initializes a new CHIP-8 Emulator
   * @param {Frontend} frontend The frontend class
   */
  constructor(frontend) {
    /** The frontend instance */
    this.frontend = frontend;

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

    /** Callback when emulator state is updated */
    this.onUpdateState = () => {};

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
    this.runNextInstruction(true);
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
          for (let i = 0; i < 10; i += 1) { // 60Hz * 10 = 600Hz
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
// If we are running in node (testing) then expose the classes
if (typeof exports !== 'undefined') {
  exports.frontend = Frontend;
  exports.backend = Chip8Cpu;
  exports.visualizer = Visualizer;
} else { // otherwise start up the emulator/frontend
  const frontend = new Frontend();
  frontend.renderDisplay(new Uint8Array(64 * 32));
  const backend = new Chip8Cpu(frontend);
  const visualizer = new Visualizer(backend);
  frontend.statwaitForCodeInput(code => backend.loadProgram(code));
}

// Assembler 

// An array contain a list of tokens
var tokenList = [];

// Check if a token is a keyword or not
function isKeyWord(current, splitString) {
    var keyWord = splitString[current];
    if (keyWord === 'skip' || keyWord === 'to' ||
    	keyWord === 'call' || keyWord === 'jump' ||
    	keyWord === 'shiftRight' || keyWord === 'shiftLeft' ||
    	keyWord === 'memad' || keyWord === 'key' ||
    	keyWord === 'delay' || keyWord === 'sound' ||
    	keyWord === 'draw' || keyWord === 'rand' ||
    	keyWord === 'clear' || keyWord === 'return')
    	return true;
    else
        return false;
}

// Check if a token is a register or not 
function isRegister(current, splitString) {
    var register = splitString[current];
    var re1 = /[0-9]/;
    var re2 = /[a-f]/;
    var char = register.charAt(register.length - 1);
    if ((re1.test(char) === true || re2.test(char) === true || char === 'i')
        && register.length === 2 && register.charAt(0) === 'v')
        return true;
    else
        return false;
}

// A function that receive a string of assembly language and split it 
// into small meaningful chunks (tokens)
function tokenize (code) {
	var splitString = code
	.replace(/[\n\r]/g, ' newLine ')
    .replace(/\(/g, ' openBracket ')
    .replace(/\)/g, ' closeBracket ')
    .replace(/\+/g, ' add ')
    .replace(/\-/g, ' subtract ')
    .replace(/\^/g, ' xor ')
    .replace(/\|/g, ' or ')
    .replace(/\&/g, ' and ')
    .replace(/\=/g, ' assign ')
    .replace(/\,/g, ' comma ')
    .split(/[\t\f\v ]+/);
    
    // Clean spaces 
    for (var i = splitString.length - 1; i >= 0; i--) {
    	if (splitString[i] === '')
    		splitString.splice(i, 1);
    }
    
    // Tokenize 
	for (var i = 0; i < splitString.length; i++) {
    	var token = splitString[i];
        if (token.length <= 0) {
        	continue;
        }
        if (token === 'newLine')
        	tokenList.push({type: 'newLine'});
        else if (token === 'openBracket') {
        	tokenList.push({type: 'punctuation', value: '('});
        }
        else if (token === 'closeBracket') {
        	tokenList.push({type: 'punctuation', value: ')'});
        }
        else if (token === 'comma') {
        	tokenList.push({type: 'punctuation', value: ','});
        }
        else if (token === 'add') {
        	tokenList.push({type: 'operation', value: '+'});
        }
        else if (token === 'subtract') {
        	tokenList.push({type: 'operation', value: '-'});
        }
        else if (token === 'xor') {
        	tokenList.push({type: 'operation', value: '^'});
        }
        else if (token === 'or') {
        	tokenList.push({type: 'operation', value: '|'});
        }
        else if (token === 'and') {
        	tokenList.push({type: 'operation', value: '&'});
        }
        else if (token === 'assign') {
        	tokenList.push({type: 'assign', value: '='});
        }
        else if (isNaN(token) === false) {
            tokenList.push({type: 'number', value: token});
        }
        else if (token === 'if') {
        	tokenList.push({type: 'if'})       
        }
        else if (isKeyWord(i, splitString)) {
        	tokenList.push({type: 'keyword', value: token});
        }
        else if (isRegister(i, splitString)) {
        	tokenList.push({type: 'register', value: token.charAt(token.length - 1)});
        }
        else if (token === 'equal' || token === 'not') {
        	tokenList.push({type: 'condition', value: token});
        }
        else {
        	console.log("token not found");
        	break;
        }
    }
    return tokenList;
}

// Keep track of index of tokens
var checkCurrent = 0;
function passCurrent(current) {
	checkCurrent = current;
}

// Check what the next token is
function expectToken(current) {
	var nextToken = tokenList[current+1];
	if ((nextToken.type) === 'newLine') {
		return nextToken.type;
}
	else if (nextToken.type === 'punctuation' && nextToken.value === '(')
		return nextToken.value;
	else if (nextToken.type === 'operation')
		return nextToken.type;
	else if (nextToken.type === 'assign')
		return nextToken.type;
	else if (nextToken.value === 'to')
		return nextToken.value;
}

// Parse the operations like "+, -, ^, &, |"
function parseOperation(current) {
	var tok = tokenList[++current];
	var tokLeft = tokenList[current-1];
    var tokRight = tokenList[current+1];
    var node = {
    	type: 'Calculation',
    	name: tok.value,
    	left: tokLeft,
    	right: tokRight,
    }
    passCurrent(current+1);
    return node;
    
}

// Parse the key words
function parseKeyWord(current) {
	var node = {
    	type: 'Loop',
    	name: tok.value,
    	from: tokenList[current-1],
    	to: tokenList[current+1],
    	}
    passCurrent(current+1);
    return node;
}

// Parse function 
function parseExpression(current) {
    var tok = tokenList[++current];
    var node = {
		type: 'CallExpression',
		name: tokenList[current-1].value,
		parameters: [],
	}
	tok = tokenList[++current];
    if (tok.value !== ')') {
		while (!(tok.value === ')')) {
		if (tok.value === ',') {
			
			tok = tokenList[++current];
		}
	    node.parameters.push(tokenList[current]);
		tok = tokenList[++current];
	}
	}
	passCurrent(current);
    return node;
}

// Parse If
function parseIf(current) {
	var node;
	while (tokenList[current].value !== 'skip') {
		if (tokenList[current].type !== 'condition')
			current += 1;
		else {
			node = {
				type: 'If',
				condition: tokenList[current].value,
				left: tokenList[current-1],
				right: tokenList[current+1],
			}
			current += 1;
        }
	}
	passCurrent(current);
	return node;
}
	
// Parse every token in token list
function parseToken(current) {
	var tok = tokenList[current];
	var nextTok = expectToken(current);
	if (tok.type === 'keyword') {
		if (nextTok === '(')
			return parseExpression(current);
		else {
			passCurrent(current);
			return tok;
		}
	}
	else if (tok.type === 'number') {
		passCurrent(current);
		return tok;
	}
	else if (tok.type === 'register') {
		if (nextTok === '(')
			return parseExpression(current)
		else if (nextTok === 'assign') {
			passCurrent(current);
			return tok;
		}
		else if (nextTok === 'operation') {
			return parseOperation(current);
		}
		else if (nextTok === 'newLine') {
			passCurrent(current);
			return tok;
		}
		else if (nextTok === 'to') {
			return parseKeyWord(current);
		}
	}
	else if (tok.type === 'if') {
		return parseIf(current);
	}
}

// Create an AST tree 
var ast = {
		type: 'program',
		body: [],
	};

// Parse the whole program 
function parseProgram(tokenList) {
	var current = 0;
	var node = null;
	var leftNode;
    while (current < tokenList.length) {
    	if (tokenList[current].type === 'newLine')
    		ast.body.push(tokenList[current]);
    	else if (tokenList[current].type !== 'assign') {
    		node = parseToken(current);
    		current = checkCurrent;
    		if (tokenList[current+1] !== undefined) {
    		if (tokenList[current+1].type !== 'assign' ) {
    			ast.body.push(node);
    		}
    		else
    			leftNode = node;
    	}
    	else
    		ast.body.push(node);
    	}
    	else {
    		var rightNode = parseToken(current+1);
    		current = checkCurrent;
    		var nodeAssign = { type : 'assign',
    		left : leftNode,
    		right : rightNode,
    		};
    
    		ast.body.push(nodeAssign);

    	}
    	++current;
    }
    return ast;
}

// Create a string of opcodes
var codeString = "";

// Create an array of opcodes
var codeBinary = [];

// A function that goes to each node of AST tree and translate that node to an opcode
function generate (ast) {
	for (var i = 0; i < ast.body.length; i++) {
		var node = ast.body[i];
		if (node.type === 'newLine')
			codeString += "\n";
		if (node.name === 'clear') {
			codeString += "00E0";
			codeBinary.push(0x00E0);
		}
		else if (node.name === 'return') {
			codeString += "00EE";
			codeBinary.push(0x00EE);
		}
		else if (node.name === 'jump') {
			if (node.parameters[0].type === 'number' && node.parameters[0].value.length === 3
				&& node.parameters[1] === undefined)
				codeString += "1" + node.parameters[0].value;
			else if ((node.parameters[0].type === 'number' || node.parameters[2].type === 'number') 
				&& (node.parameters[0].value.length === 3 || node.parameters[2].value.length === 3)
				&& node.parameters[1].type === 'operation') {
				codeString += "B" + node.parameters[0].value;
			}
			else 
				codeString += "Bad opcode";
		}
		else if (node.name === 'call') {
			if (node.parameters[0].type === 'number' && node.parameters[0].value.length === 3)
				codeString += "2" + node.parameters[0].value;
			else
				codeString += "Bad opcode";
		}
		else if (node.type === 'If') {
			if (node.condition === 'equal' ) {
				if (node.right.type === 'number' && node.right.value.length === 2)
					codeString += "3" + node.left.value + node.right.value;
				else if (node.right.type === 'register')
					codeString += "5" + node.left.value + node.right.value + "0";
				else if (node.right.type === 'keyword')
					codeString += "E" + node.left.value + "9E";
				else
					codeString += "Bad opcode";
			}
			else if (node.condition === 'not') {
				if (node.right.type === 'number' && node.right.value.length === 2)
					codeString += "4" + node.left.value + node.right.value;
				else if (node.right.type === 'keyword') 
					codeString += "E" + node.left.value + "A1";
				else
					codeString += "Bad opcode";
			}
		}
		// Unimplemented opcodes translation 
	}
	return codeString;
}
