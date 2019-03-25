class Frontend {
  constructor() {
    this.currentDisplay = [];
    this.codeInputDOM = document.querySelector('input#codeInput');
    this.displayDOM = document.querySelector('canvas#display');
    this.audio = new Audio('beep-02.wav');

    this.keyStates = new Uint8Array(16);

    this.keyCodes = new Uint8Array([88, 49, 50, 51, 81, 87, 69, 65, 83, 68, 90, 67, 52, 82, 70, 86]); //inserting that keyCodearray into this array


    document.addEventListener('keydown', (event) => {

        if (event.keyCode == 88) {

        this.keyStates[0] = 0x1;
        }

        else if (event.keyCode == 49) {

            this.keyStates[1] = 0x1;
        }

        else if (event.keyCode == 50) {

            this.keyStates[2] = 0x1;
        }

        else if (event.keyCode == 51) {

            this.keyStates[3] = 0x1;
        }

        else if (event.keyCode == 81) {

            this.keyStates[4] = 0x1;
        }

        else if (event.keyCode == 87) {

            this.keyStates[5] = 0x1;
        }

        else if (event.keyCode == 69) {

            this.keyStates[6] = 0x1;
        }

        else if (event.keyCode == 65) {

            this.keyStates[7] = 0x1;
        }

        else if (event.keyCode == 83) {

            this.keyStates[8] = 0x1;
        }

        else if (event.keyCode == 68) {

            this.keyStates[9] = 0x1;
        }

        else if (event.keyCode == 90) {

            this.keyStates[10] = 0x1;
        }

        else if (event.keyCode == 67) {

            this.keyStates[11] = 0x1;
        }

        else if (event.keyCode == 52) {

            this.keyStates[12] = 0x1;
        }

        else if (event.keyCode == 82) {

            this.keyStates[13] = 0x1;
        }

        else if (event.keyCode == 70) {

            this.keyStates[14] = 0x1;
        }

        else if (event.keyCode == 86) {

            this.keyStates[15] = 0x1;
        }

    })

    document.addEventListener('keyup', (event) => {

        if (event.keyCode == 88) {

            this.keyStates[0] = 0x0;
        }

        else if (event.keyCode == 49) {

            this.keyStates[1] = 0x0;
        }

        else if (event.keyCode == 50) {

            this.keyStates[2] = 0x0;
        }

        else if (event.keyCode == 51) {

            this.keyStates[3] = 0x0;
        }

        else if (event.keyCode == 81) {

            this.keyStates[4] = 0x0;
        }

        else if (event.keyCode == 87) {

            this.keyStates[5] = 0x0;
        }

        else if (event.keyCode == 69) {

            this.keyStates[6] = 0x0;
        }

        else if (event.keyCode == 65) {

            this.keyStates[7] = 0x0;
        }

        else if (event.keyCode == 83) {

            this.keyStates[8] = 0x0;
        }

        else if (event.keyCode == 68) {

            this.keyStates[9] = 0x0;
        }

        else if (event.keyCode == 90) {

            this.keyStates[10] = 0x0;
        }

        else if (event.keyCode == 67) {

            this.keyStates[11] = 0x0;
        }

        else if (event.keyCode == 52) {

            this.keyStates[12] = 0x0;
        }

        else if (event.keyCode == 82) {

            this.keyStates[13] = 0x0;
        }

        else if (event.keyCode == 70) {

            this.keyStates[14] = 0x0;
        }

        else if (event.keyCode == 86) {

            this.keyStates[15] = 0x0;
        }


    })


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
