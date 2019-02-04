class Frontend {
  constructor() {
    this.currentDisplay = [];
    this.codeInputDOM = document.querySelector('input#codeInput');
    this.displayDOM = document.querySelector('canvas#display');
    this.displayPixelState = new Array(32).fill(new Array(64).fill(false));

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

  /** Gets the current buttons being pressed by the user
   * @returns an object showing which buttons are being pressed
   */
  getCurrentInputs() {
    return this.keyStates;
  }

  /**
   * Changes the pixel states for a row
   * @param {number} rowIndex The index of the row to edit
   * @param {boolean[]} pixelStates An array of booleans showing
   */
  editDisplayRow(rowIndex, pixelStates) {
    // guard against bad input
    if (pixelStates.length !== 64 || pixelStates.some(ele => typeof ele !== 'boolean')) throw new Error('Bad row data');
    if (rowIndex < 0 || rowIndex > 31) throw new Error('Bad row index');

    this.displayPixelState[rowIndex] = pixelStates;
    this.renderDisplay();
  }

  /**
   * Renders the display using the data stored in this.displayPixelState
   */
  renderDisplay() {
    const context = this.displayDOM.getContext('2d');
    context.clearRect(0, 0, this.displayDOM.width, this.displayDOM.height);
    for (let y = 0; y < this.displayPixelState.length; y += 1) {
      for (let x = 0; x < this.displayPixelState[y].length; x += 1) {
        if (!this.displayPixelState[y][x]) {
          context.fillRect(x * 8, y * 8, 8, 8);
        }
      }
    }
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
        callback(new Int8Array(fileReader.result)); // send in Int8Array as CHIP-8 is 8-bit program
      };
      fileReader.readAsArrayBuffer(this.codeInputDOM.files[0]);
    });
  }
}


const frontend = new Frontend();
frontend.renderDisplay();
