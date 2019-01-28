class Frontend {
  constructor() {
    this.currentDisplay = [];
  }
  
  /** Gets the current buttons being pressed by the user 
   * @returns 
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
}

export default Frontend;
