import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Utils from './utils';
import ImageData from './images';

class CardScratchOff extends PureComponent {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      // use to show secret content
      isLoadedCover: false
    };
    this.clickToScratchCount = 0;
  }

  componentDidMount() {
    this.setupCanvas();
    this.setupCover();
    this.setupBrush();
    this.setupGestureEvent();
  }

  componentWillUnmount() {
    this.unregisterGestureEvent();
  }

  setupCanvas() {
    // get canvas ref
    const { current } = this.canvasRef;

    // save canvas ref to use later
    this.canvas = current;

    /**
     * get parent's size to set width and height for canvas (full parent)
     * default width/height: 300/150
     */
    const { parentNode } = this.canvas;
    const parentSize =
      parentNode.getBoundingClientRect && parentNode.getBoundingClientRect();
    const { width = 0, height = 0 } = parentSize || {};
    this.canvas.width = width;
    this.canvas.height = height;

    // save canvas width and height to use later
    this.canvasWidth = width;
    this.canvasHeight = height;

    // save context to control canvas
    this.ctx = this.canvas.getContext('2d');

    // setup anchor point
    this.setupAnchorPoint(width, height);
  }

  setupAnchorPoint(canvasWidth, canvasHeight) {
    const {
      numberOfAnchorPointsPerRow,
      numberOfAnchorPointsPerColumn
    } = this.props;

    this.anchorPointList = [];

    for (let row = 1; row <= numberOfAnchorPointsPerRow; row++) {
      for (let col = 1; col <= numberOfAnchorPointsPerColumn; col++) {
        this.anchorPointList.push({
          x:
            (((col - 1) * 2 + 1) * canvasWidth) /
            (numberOfAnchorPointsPerColumn * 2),
          y:
            (((row - 1) * 2 + 1) * canvasHeight) /
            (numberOfAnchorPointsPerRow * 2)
        });
      }
    }

    // uncomment this to see anchor point
    // this.anchorPointList.forEach((point) =>
    //   Utils.drawPoint(this.ctx, point)
    // );
  }

  setupCover() {
    const { coverSrc } = this.props;
    const { ctx, canvasWidth, canvasHeight } = this;
    const cover = new Image();
    cover.src = coverSrc;
    cover.onload = () => {
      ctx.drawImage(cover, 0, 0, canvasWidth, canvasHeight);
      this.setState({ isLoadedCover: true });
    };
  }

  setupBrush() {
    const { brushesSrc } = this.props;
    const brushes = new Image();
    brushes.src = brushesSrc;
    this.brushes = brushes;
  }

  setupGestureEvent() {
    this.isDrawing = false;
    this.gesturePosition = { x: 0, y: 0 };
    this.lastPosition = this.gesturePosition;
    this.registerGestureEvent();
  }

  registerGestureEvent() {
    const { isMobileDevice } = this.props;
    const canvas = this.canvas;
    const gestureStartEvent = isMobileDevice ? 'touchstart' : 'mousedown';
    const gestureEndEvent = isMobileDevice ? 'touchend' : 'mouseup';
    const gestureMoveEvent = isMobileDevice ? 'touchmove' : 'mousemove';
    canvas.addEventListener(gestureStartEvent, this.handleGestureStart);
    canvas.addEventListener(gestureEndEvent, this.handleGestureEnd);
    canvas.addEventListener(gestureMoveEvent, this.handleGestureMove);
  }

  unregisterGestureEvent() {
    const { isMobileDevice } = this.props;
    const canvas = this.canvas;
    const gestureStartEvent = isMobileDevice ? 'touchstart' : 'mousedown';
    const gestureEndEvent = isMobileDevice ? 'touchend' : 'mouseup';
    const gestureMoveEvent = isMobileDevice ? 'touchmove' : 'mousemove';
    canvas.removeEventListener(gestureStartEvent, this.handleGestureStart);
    canvas.removeEventListener(gestureEndEvent, this.handleGestureEnd);
    canvas.removeEventListener(gestureMoveEvent, this.handleGestureMove);
  }

  handleGestureStart = (event) => {
    if (event.target === this.canvas) {
      event.preventDefault();
    }
    this.isDrawing = true;
    this.lastPosition = this.getGesturePosition(this.canvas, event);
    this.gestureStartPosition = this.lastPosition;
  };

  handleGestureEnd = (event) => {
    if (
      !this.gestureMoving ||
      (this.gesturePosition.x === this.gestureStartPosition.x &&
        this.gesturePosition.y === this.gestureStartPosition.y)
    ) {
      this.handleClickToScratch();
    }
    this.gestureMoving = false;
    if (event.target === this.canvas) {
      event.preventDefault();
    }
    this.isDrawing = false;
  };

  handleGestureMove = (event) => {
    this.gestureMoving = true;
    if (event.target === this.canvas) {
      event.preventDefault();
    }
    this.gesturePosition = this.getGesturePosition(this.canvas, event);
    this.draw();
    this.lastPosition = this.gesturePosition;
  };

  getGesturePosition(canvasDom, gestureEvent) {
    const { isMobileDevice } = this.props;
    const rect = canvasDom.getBoundingClientRect();
    return {
      x:
        (isMobileDevice
          ? gestureEvent.touches[0].clientX
          : gestureEvent.clientX) - rect.left,
      y:
        (isMobileDevice
          ? gestureEvent.touches[0].clientY
          : gestureEvent.clientY) - rect.top
    };
  }

  handleRemoveCanvas(canvasDom) {
    const { onScratchFinish } = this.props;
    if (canvasDom.parentNode) {
      canvasDom.parentNode.removeChild(canvasDom);
      onScratchFinish && onScratchFinish();
    }
  }

  handlePercentage(currentPoint, width, height) {
    const { anchorPointList } = this;
    const {
      numberOfAnchorPointsPerRow,
      numberOfAnchorPointsPerColumn,
      finishPercent
    } = this.props;
    this.handleRemoveAnchorPoint(currentPoint, width, height);
    const anchorPointListLength = anchorPointList.length;
    const percentage =
      100 -
      (anchorPointListLength /
        (numberOfAnchorPointsPerRow * numberOfAnchorPointsPerColumn)) *
        100;
    if (percentage > finishPercent) {
      this.handleRemoveCanvas(this.canvas);
    }
  }

  handleRemoveAnchorPoint(point, width, height) {
    const { anchorPointList } = this;
    const remainPointList = anchorPointList.filter(
      (anchorPoint) =>
        !Utils.isInsideRemovedArea(point, width, height, anchorPoint)
    );
    this.anchorPointList = remainPointList;
  }

  handleClickToScratch() {
    const {
      allowClickToScratch,
      maxTimesClickToScratch,
      enableScratch
    } = this.props;
    if (!allowClickToScratch || !enableScratch) {
      return;
    }
    this.clickToScratchCount = this.clickToScratchCount + 1;
    if (this.clickToScratchCount === maxTimesClickToScratch) {
      this.handleRemoveCanvas(this.canvas);
    } else {
      this.drawWithBrushes(
        this.ctx,
        {
          x:
            ((this.clickToScratchCount - 1) * this.canvasWidth) /
            maxTimesClickToScratch,
          y: 0
        },
        {
          x:
            (this.clickToScratchCount * this.canvasWidth) /
            maxTimesClickToScratch,
          y: (this.canvasHeight * 5) / 7
        },
        this.brushes,
        'destination-out',
        this.canvasWidth / maxTimesClickToScratch,
        (this.canvasHeight * 5) / 7
      );
    }
  }

  draw() {
    const { enableScratch } = this.props;
    if (!enableScratch) {
      return;
    }
    /**
     * if is "scratching" then "draw"
     * if not "scratching" then do nothing
     */
    if (this.isDrawing) {
      const { lastPosition, gesturePosition } = this;
      this.drawWithBrushes(
        this.ctx,
        lastPosition,
        gesturePosition,
        this.brushes
      );
      // this like MS Paint ^^
      // Utils.drawLine(this.ctx, lastPosition, gesturePosition);
    }
  }

  drawWithBrushes(
    ctx,
    startPoint,
    endPoint,
    brushes,
    drawMode = 'destination-out',
    ...drawImageArgs
  ) {
    const dist = Utils.distanceBetween(startPoint, endPoint);
    const angle = Utils.angleBetween(startPoint, endPoint);
    const offsetX = brushes.width / 2;
    const offsetY = brushes.height / 2;
    for (let x, y, i = 0; i < dist; i++) {
      x = startPoint.x + Math.sin(angle) * i - offsetX;
      y = startPoint.y + Math.cos(angle) * i - offsetY;
      ctx.globalCompositeOperation = drawMode;
      ctx.drawImage(brushes, x, y, ...drawImageArgs);
      this.handlePercentage({ x, y }, brushes.width, brushes.height);
    }
  }

  render() {
    const {
      children,
      containerStyleClassname,
      canvasStyleClassName
    } = this.props;
    const { isLoadedCover } = this.state;
    return (
      <div className={containerStyleClassname}>
        <canvas className={canvasStyleClassName} ref={this.canvasRef} />
        {!!isLoadedCover && children}
      </div>
    );
  }
}

CardScratchOff.defaultProps = {
  enableScratch: true,
  allowClickToScratch: false,
  numberOfAnchorPointsPerRow: 3,
  numberOfAnchorPointsPerColumn: 5,
  finishPercent: 70,
  maxTimesClickToScratch: 3,
  onScratchFinish: () => console.log('scratch finished!!!!!!'),
  coverSrc: ImageData.scratchCover,
  brushesSrc: ImageData.scratchBrushes,
  isMobileDevice: 'ontouchstart' in window
};

CardScratchOff.propTypes = {
  enableScratch: PropTypes.bool,
  allowClickToScratch: PropTypes.bool,
  numberOfAnchorPointsPerRow: PropTypes.number,
  numberOfAnchorPointsPerColumn: PropTypes.number,
  finishPercent: PropTypes.number,
  maxTimesClickToScratch: PropTypes.number,
  onScratchFinish: PropTypes.func,
  coverSrc: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  brushesSrc: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isMobileDevice: PropTypes.bool.isRequired,
  containerStyleClassname: PropTypes.string,
  canvasStyleClassName: PropTypes.string
};

export default CardScratchOff;
