class MockFrontend {
  constructor() {
    this.currentDisplay = new Uint8Array(0);
  }

  renderDisplay(displayMemory) {
    this.currentDisplay = displayMemory;
  }
}

module.exports = MockFrontend;
