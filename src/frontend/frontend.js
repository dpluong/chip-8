class Frontend {
  constructor() {
    this.currentDisplay = [];
    this.codeInputCallback = () => {};
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
  waitForCodeInput(callback) {
    this.codeInputCallback = callback;
  }
}

export default Frontend;
