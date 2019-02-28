class Visualizer {
  /**
   * Initalizes a new Visualizer
   * @param {Chip8Cpu} chip8Cpu The CPU to visualize
   */
  constructor(chip8Cpu) {
    this.chip8Cpu = chip8Cpu;
    this.visualizerActive = false;
    this.toggleVisualizerDOM = document.querySelector('button#visualizerToggle');
    this.toggleEmulatorRunningDOM = document.querySelector('button#toggleEmulatorRunning');
    this.previousInstructionDOM = document.querySelector('button#goBackwards');
    this.nextInstructionDOM = document.querySelector('button#goForwards');
    this.visualizerContainerDOM = document.querySelector('div#visualizerContainer');
    this.registerTableBodyDOM = document.querySelector('tbody#visualizerRegisterTableBody');
    this.memorySelectDOM = document.querySelector('select#memorySelect');
    this.registerValuesDOM = [];
    this.saveStates = [];

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
        this.updateMemoryList();
      } else {
        this.chip8Cpu.clockSpeed = oldClockSpeed;
        this.toggleEmulatorRunningDOM.textContent = 'Pause';
        this.memorySelectDOM.style.display = 'none';
        this.chip8Cpu.runNextInstruction(true);
      }
    });
    this.nextInstructionDOM.addEventListener('click', () => {
      this.chip8Cpu.runNextInstruction(false);
      this.updateMemoryList();
    });
    this.previousInstructionDOM.addEventListener('click', () => {
      this.chip8Cpu.loadSaveState(this.saveStates.pop());
      if (this.saveStates.length === 0) {
        this.previousInstructionDOM.disabled = true;
      }
      this.updateMemoryList();
    });
  }

  static numToHex(num, minLength) {
    let hex = num.toString(16).toUpperCase();
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
      this.addRowToRegisterTable(Visualizer.numToHex(index, 2), regVal);
    });
    this.addRowToRegisterTable('I', this.chip8Cpu.iRegister);

    this.chip8Cpu.onUpdateState = (isSaveState) => {
      this.updateVisualizerTables();
      if (!isSaveState) {
        this.saveStates.push(this.chip8Cpu.getSaveState());
        if (this.saveStates.length > 2500) {
          this.saveStates.shift();
        }
        if (this.previousInstructionDOM.disabled) {
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
    valueCell.textContent = Visualizer.numToHex(val, 2);
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
        this.registerValuesDOM[index].textContent = Visualizer.numToHex(regVal, 2);
      }
    });
    if (this.registerValuesDOM[this.registerValuesDOM.length - 1].textContent !== this.chip8Cpu.iRegister.toString()) {
      this.registerValuesDOM[this.registerValuesDOM.length - 1].textContent = Visualizer.numToHex(this.chip8Cpu.iRegister, 2);
    }
  }

  updateMemoryList() {
    this.memorySelectDOM.innerHTML = '';
    this.memorySelectDOM.style.display = 'block';
    this.chip8Cpu.memory.forEach((memVal, index) => {
      const item = document.createElement('option');
      item.textContent = `${Visualizer.numToHex(index, 3)}: ${Visualizer.numToHex(memVal, 2)}`;
      this.memorySelectDOM.appendChild(item);
      if (index === this.chip8Cpu.programCounter) {
        item.selected = true;
        item.scrollIntoView();
      }
    });
  }
}

if (typeof exports !== 'undefined') {
  module.exports = Visualizer;
}
