class Frontend {
  constructor() {
    this.currentDisplay = [];
    this.codeInputDOM = document.querySelector('input#codeInput');
  }
  
  /** Gets the current buttons being pressed by the user
   * @returns an object showing which buttons are being pressed
  */
  getCurrentInputs() {
    return {
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
    }
  }

  /**
   * Changes the pixel states for a row
   * @param {number} rowIndex The index of the row to edit
   * @param {boolean[]} pixelStates An array of booleans showing
  */
  editDisplayRow(rowIndex, pixelStates) {
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

export default Frontend;
