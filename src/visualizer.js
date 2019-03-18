/* eslint-disable class-methods-use-this */
/* eslint-disable no-else-return */
class Visualizer {
  /**
   * Initalizes a new Visualizer
   * @param {Chip8Cpu} chip8Cpu The CPU to visualize
   * @param {boolean} [isNonBrowser=false] If instance is not running browser (for testing)
   */
  constructor(chip8Cpu, isNonBrowser = false) {
    this.chip8Cpu = chip8Cpu;
    this.visualizerActive = false;
    if (!isNonBrowser) {
      this.toggleVisualizerDOM = document.querySelector('button#visualizerToggle');
      this.toggleEmulatorRunningDOM = document.querySelector('button#toggleEmulatorRunning');
      this.previousInstructionDOM = document.querySelector('button#goBackwards');
      this.nextInstructionDOM = document.querySelector('button#goForwards');
      this.visualizerContainerDOM = document.querySelector('div#visualizerContainer');
      this.registerTableBodyDOM = document.querySelector('tbody#visualizerRegisterTableBody');
      this.memorySelectDOM = document.querySelector('select#memorySelect');
      this.registerValuesDOM = [];
      this.saveStates = [];
      this.timerSimulationLeft = 10;
  
      this.toggleVisualizerDOM.addEventListener('click', () => {
        if (this.visualizerActive) {
          this.disableVisualizer();
        } else {
          this.enableVisualizer();
        }
      });
  
      let oldClockSpeed = this.chip8Cpu.clockSpeed;
      this.toggleEmulatorRunningDOM.addEventListener('click', () => {
        if (this.chip8Cpu.clockSpeed > 0) {
          oldClockSpeed = this.chip8Cpu.clockSpeed;
          this.chip8Cpu.clockSpeed = 0;
          this.toggleEmulatorRunningDOM.textContent = 'Play';
          this.memorySelectDOM.style.display = '';
          this.nextInstructionDOM.disabled = false;
          this.previousInstructionDOM.disabled = this.saveStates.length === 0;
          this.timerSimulationLeft = 10;
          this.updateMemoryList();
        } else {
          this.chip8Cpu.clockSpeed = oldClockSpeed;
          this.toggleEmulatorRunningDOM.textContent = 'Pause';
          this.memorySelectDOM.style.display = 'none';
          this.nextInstructionDOM.disabled = true;
          this.previousInstructionDOM.disabled = true;
          this.timerSimulationLeft = 10;
          this.chip8Cpu.runNextInstruction(true);
        }
      });
      this.nextInstructionDOM.addEventListener('click', () => {
        this.chip8Cpu.runNextInstruction(false);
        this.timerSimulationLeft -= 1;
        if (this.timerSimulationLeft === 0) {
          if (this.chip8Cpu.delay > 0) {
            this.chip8Cpu.delay -= 1;
          }
          if (this.chip8Cpu.sound > 0) {
            this.chip8Cpu.sound -= 1;
          }
          this.timerSimulationLeft = 10;
        }
        this.updateMemoryList();
      });
      this.previousInstructionDOM.addEventListener('click', () => {
        this.chip8Cpu.loadSaveState(this.saveStates.pop());
        if (this.saveStates.length === 0) {
          this.previousInstructionDOM.disabled = true;
        }
        this.timerSimulationLeft += 1;
        if (this.timerSimulationLeft > 10) {
          this.timerSimulationLeft = 10;
        }
        this.updateMemoryList();
      });
    }
  }

  numToHex(num, minLength) {
    let hex = num.toString(16).toLowerCase();
    while (hex.length < minLength) {
      hex = `0${hex}`;
    }
    return hex;
  }

  enableVisualizer() {
    this.visualizerActive = true;
    this.saveStates = [];
    this.toggleVisualizerDOM.textContent = 'Disable Visualizer';
    this.visualizerContainerDOM.style.display = '';
    this.previousInstructionDOM.disabled = true;

    this.registerTableBodyDOM.innerHTML = '';
    this.chip8Cpu.registers.forEach((regVal, index) => {
      this.addRowToRegisterTable(this.numToHex(index, 2), regVal);
    });
    this.addRowToRegisterTable('I', this.chip8Cpu.iRegister);

    this.chip8Cpu.onUpdateState = (isSaveState) => {
      this.updateVisualizerTables();
      if (!isSaveState) {
        this.saveStates.push(this.chip8Cpu.getSaveState());
        if (this.saveStates.length > 2500) {
          this.saveStates.shift();
        }
        if (this.previousInstructionDOM.disabled && this.chip8Cpu.clockSpeed === 0) {
          this.previousInstructionDOM.disabled = false;
        }
      }
    };
  }

  addRowToRegisterTable(index, val) {
    const row = document.createElement('tr');
    const registerCell = document.createElement('td');
    const valueCell = document.createElement('td');
    registerCell.textContent = `Register ${index}`;
    valueCell.textContent = this.numToHex(val, 2);
    row.appendChild(registerCell);
    row.appendChild(valueCell);
    this.registerValuesDOM.push(valueCell);
    this.registerTableBodyDOM.appendChild(row);
  }

  disableVisualizer() {
    this.visualizerActive = false;
    this.toggleVisualizerDOM.textContent = 'Enable Visualizer';
    this.visualizerContainerDOM.style.display = 'none';
    this.chip8Cpu.onUpdateState = () => {};
  }

  updateVisualizerTables() {
    this.chip8Cpu.registers.forEach((regVal, index) => {
      if (this.registerValuesDOM[index].textContent !== regVal.toString()) {
        this.registerValuesDOM[index].textContent = this.numToHex(regVal, 2);
      }
    });
    if (this.registerValuesDOM[this.registerValuesDOM.length - 1].textContent !== this.chip8Cpu.iRegister.toString()) {
      this.registerValuesDOM[this.registerValuesDOM.length - 1].textContent = this.numToHex(this.chip8Cpu.iRegister, 2);
    }
  }

  parseOpcodeIntoAssembly(firstByte, lastByte) {
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
      return `jump(${this.numToHex(lastThreeNibbles, 3)})`;
    } else if (firstNibble === 0x2) {
      return `call(${this.numToHex(lastThreeNibbles, 3)})`;
    } else if (firstNibble === 0x3) {
      return `if v${this.numToHex(secondNibble, 1)} equal ${this.numToHex(lastTwoNibbles, 2)} skip`;
    } else if (firstNibble === 0x4) {
      return `if v${this.numToHex(secondNibble, 1)} not ${this.numToHex(lastTwoNibbles, 2)} skip`;
    } else if (firstNibble === 0x5 && lastNibble === 0x0) {
      return `if v${this.numToHex(secondNibble, 1)} equal v${this.numToHex(thirdNibble, 1)} skip`;
    } else if (firstNibble === 0x6) {
      return `v${this.numToHex(secondNibble, 1)} = ${this.numToHex(lastTwoNibbles, 2)}`;
    } else if (firstNibble === 0x7) {
      return `v${this.numToHex(secondNibble, 1)} = ${this.numToHex(lastTwoNibbles, 2)} + v${this.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x0) {
      return `v${this.numToHex(secondNibble, 1)} = v${this.numToHex(thirdNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x1) {
      return `v${this.numToHex(secondNibble, 1)} = ${this.numToHex(thirdNibble, 1)} | v${this.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x2) {
      return `v${this.numToHex(secondNibble, 1)} = ${this.numToHex(thirdNibble, 1)} & v${this.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x3) {
      return `v${this.numToHex(secondNibble, 1)} = ${this.numToHex(thirdNibble, 1)} ^ v${this.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x4) {
      return `v${this.numToHex(secondNibble, 1)} = ${this.numToHex(thirdNibble, 1)} + v${this.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x5) {
      return `v${this.numToHex(secondNibble, 1)} = ${this.numToHex(secondNibble, 1)} - v${this.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x6) {
      return `v${this.numToHex(secondNibble, 1)} = shiftRight${this.numToHex(thirdNibble, 1)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0x7) {
      return `v${this.numToHex(secondNibble, 1)} = ${this.numToHex(thirdNibble, 1)} - v${this.numToHex(secondNibble, 2)}`;
    } else if (firstNibble === 0x8 && lastNibble === 0xE) {
      return `v${this.numToHex(secondNibble, 1)} = shiftLeft${this.numToHex(thirdNibble, 1)}`;
    } else if (firstNibble === 0x9) {
      return `if v${this.numToHex(secondNibble, 1)} not v${this.numToHex(thirdNibble, 1)} skip`;
    } else if (firstNibble === 0xA) {
      return `vi = ${this.numToHex(lastThreeNibbles, 3)}`;
    } else if (firstNibble === 0xB) {
      return `jump(${this.numToHex(lastThreeNibbles, 3)} + v0)`;
    } else if (firstNibble === 0xC) {
      return `v${this.numToHex(secondNibble, 1)} = rand(${this.numToHex(lastTwoNibbles, 2)})`;
    } else if (firstNibble === 0xD) {
      return `draw(v${this.numToHex(secondNibble, 1)}, v${this.numToHex(thirdNibble, 1)}, ${this.numToHex(lastNibble, 1)})`;
    } else if (firstNibble === 0xE && lastTwoNibbles === 0x9E) {
      return `if v${this.numToHex(secondNibble, 1)} equal key skip`;
    } else if (firstNibble === 0xE && lastTwoNibbles === 0xA1) {
      return `if v${this.numToHex(secondNibble, 1)} not key skip`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x07) {
      return `v${this.numToHex(secondNibble, 1)} = delay`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x0A) {
      return `v${this.numToHex(secondNibble, 1)} = key`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x15) {
      return `delay = v${this.numToHex(secondNibble, 1)}`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x18) {
      return `sound = v${this.numToHex(secondNibble, 1)}`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x1E) {
      return `vi = v${this.numToHex(secondNibble, 1)} + vi`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x29) {
      return `vi = memad(${this.numToHex(secondNibble, 1)})`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x33) {
      return `memad(vi) = v${this.numToHex(secondNibble, 1)}`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x55) {
      return `memad(vi) = v0 to v${this.numToHex(secondNibble, 1)}`;
    } else if (firstNibble === 0xF && lastTwoNibbles === 0x65) {
      return `v0 to v${this.numToHex(secondNibble, 1)} = memad(vi)`;
    } else {
      return null;
    }
  }

  updateMemoryList() {
    this.memorySelectDOM.innerHTML = '';
    this.memorySelectDOM.style.display = 'block';
    for (let i = 0; i < this.chip8Cpu.memory.length; i += 1) {
      const item = document.createElement('option');
      const parsedAssembly = this.parseOpcodeIntoAssembly(this.chip8Cpu.memory[i], this.chip8Cpu.memory[i + 1]);
      if (parsedAssembly && i % 2 === 0 && i >= 0x200) {
        item.textContent = `${this.numToHex(i, 3)}: ${parsedAssembly}`;
        if (i === this.chip8Cpu.programCounter) {
          item.selected = true;
          item.scrollIntoView();
        }
        i += 1;
      } else {
        item.textContent = `${this.numToHex(i, 3)}: ${this.numToHex(this.chip8Cpu.memory[i], 2)}`;
        if (i === this.chip8Cpu.programCounter) {
          item.selected = true;
          item.scrollIntoView();
        }
      }
      this.memorySelectDOM.appendChild(item);
    }
  }
}

if (typeof exports !== 'undefined') {
  module.exports = Visualizer;
}
