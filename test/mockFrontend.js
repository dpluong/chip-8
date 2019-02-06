class MockFrontend {
  constructor() {
    this.currentDisplay = new Uint8Array(0);
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
