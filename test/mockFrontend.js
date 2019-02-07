class MockFrontend {
  constructor() {
    this.currentDisplay = new Uint8Array(0);
    this.keyStates = new Uint8Array(16);
  }

  renderDisplay(displayMemory) {
    this.currentDisplay = displayMemory;
  }

  // eslint-disable-next-line class-methods-use-this
  handleError(e) {
    throw e;
  }
}

module.exports = MockFrontend;
