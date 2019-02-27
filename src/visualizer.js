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
      } else {
        this.chip8Cpu.clockSpeed = oldClockSpeed;
        this.chip8Cpu.runNextInstruction(true);
        this.toggleEmulatorRunningDOM.textContent = 'Pause';
      }
    });
    this.nextInstructionDOM.addEventListener('click', () => {
      this.chip8Cpu.runNextInstruction(false);
    });
    this.previousInstructionDOM.addEventListener('click', () => {
      this.chip8Cpu.loadSaveState(this.saveStates.pop());
      if (this.saveStates.length === 0) {
        this.previousInstructionDOM.disabled = true;
      }
    });
  }

  enableVisualizer() {
    this.visualizerActive = true;
    this.saveStates = [];
    this.toggleVisualizerDOM.textContent = 'Disable Visualizer';
    this.visualizerContainerDOM.style.display = '';
    this.previousInstructionDOM.disabled = true;

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

    this.registerTableBodyDOM.innerHTML = '';
    this.chip8Cpu.registers.forEach((regVal, index) => {
      this.addRowToRegisterTable(index, this.chip8Cpu.iRegister);
    });
    this.addRowToRegisterTable('I', this.chip8Cpu.iRegister);
  }

  addRowToRegisterTable(index, val) {
    const row = document.createElement('tr');
    const registerCell = document.createElement('td');
    const valueCell = document.createElement('td');
    registerCell.textContent = `Register ${index}`;
    valueCell.textContent = val;
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

if (typeof exports !== 'undefined') {
  module.exports = Visualizer;
}
