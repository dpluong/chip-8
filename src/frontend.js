class Frontend {
  constructor() {
    this.currentDisplay = [];
    this.codeInputDOM = document.querySelector('input#codeInput');
    this.codeInputButtonDOM = document.querySelector('button#codeInputButton');
    this.keyMapButtonDOM = document.querySelector('button#keyoardMappings');
    this.displayDOM = document.querySelector('canvas#display');
    this.audio = new Audio('beep-02.wav');

    this.keyStates = new Uint8Array(16);

    this.keyCodes = new Uint8Array([88, 49, 50, 51, 81, 87, 69, 65, 83, 68, 90, 67, 52, 82, 70, 86]); // inserting that keyCodearray into this array


    document.addEventListener('keydown', (event) => {
      this.keyCodes.forEach((keycode, i) => {
        if (event.keyCode === keycode) {
          this.keyStates[i] = 0x1;
        }
      });
    });

    document.addEventListener('keyup', (event) => {
      this.keyCodes.forEach((keycode, i) => {
        if (event.keyCode === keycode) {
          this.keyStates[i] = 0x0;
        }
      });
    });


    Object.keys(this.keyStates).forEach((_key, i) => {
      const keyButton = document.querySelector(`button#key-${i.toString(16)}`);
      keyButton.addEventListener('mousedown', () => {
        this.keyStates[i] = 0x1;
      });
      keyButton.addEventListener('mouseup', () => {
        this.keyStates[i] = 0x0;
      });
    });

    this.codeInputButtonDOM.addEventListener('click', () => this.codeInputDOM.click());

    this.keyMapButtonDOM.addEventListener('click', () => {
      const keyboardHints = [...document.querySelectorAll('span.keyboardHint')];
      this.keyMapButtonDOM.textContent = this.keyMapButtonDOM.textContent.includes('Show') ? 'Hide Keyboard Mappings' : 'Show Keyboard Mappings';
      keyboardHints.forEach((span) => {
        if (span.style.display === 'block') {
          span.style.display = 'none';
        } else {
          span.style.display = 'block';
        }
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
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        callback(new Uint8Array(fileReader.result)); // send in Int8Array as CHIP-8 is 8-bit program
      };
      fileReader.readAsArrayBuffer(this.codeInputDOM.files[0]);
    });
  }

  /**
   * Emits a beep for a specified number of milliseconds
   * If the beep is currently being played it will restart with the new timer
   * @param {number} length The length to play the tone in milliseconds
   */
  emitBeep(length) {
    this.audio.currentTime = 0;
    this.audio.play();
    setTimeout(() => {
      this.audio.pause();
    }, length);
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
if (typeof exports !== 'undefined') {
  module.exports = Frontend;
}
