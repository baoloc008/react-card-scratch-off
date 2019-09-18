import React, { Component } from 'react';
import { render } from 'react-dom';
import './styles.css';
import ReactCardScratchOff from '../../src';

class Demo extends Component {
  render() {
    return (
      <div>
        <h1>react-card-scratch-off Demo</h1>
        <ReactCardScratchOff
          allowClickToScratch={true}
          containerStyleClassname="scratch-off-container"
          canvasStyleClassName="scratch-off-canvas"
        >
          <div className="secret-content">SECRET CODE: 123456</div>
        </ReactCardScratchOff>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
