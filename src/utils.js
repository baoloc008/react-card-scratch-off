const distanceBetween = (point1, point2) =>
  Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );

const angleBetween = (point1, point2) =>
  Math.atan2(point2.x - point1.x, point2.y - point1.y);

const isInsideRemovedArea = (point, width, height, anchorPoint) => {
  if (
    anchorPoint.x > point.x &&
    anchorPoint.x < point.x + width &&
    anchorPoint.y > point.y &&
    anchorPoint.y < point.y + height
  ) {
    return true;
  }
  return false;
};

const drawRectangle = (
  ctx,
  point,
  width,
  height,
  drawMode = 'destination-out'
) => {
  ctx.globalCompositeOperation = drawMode;
  ctx.fillRect(point.x, point.y, width, height);
};

const drawPoint = (
  ctx,
  point,
  color = 'red',
  drawMode = 'destination-over'
) => {
  ctx.beginPath();
  ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.globalCompositeOperation = drawMode;
  ctx.stroke();
};

const drawLine = (
  ctx,
  startPoint,
  endPoint,
  color = 'red',
  drawMode = 'source-over'
) => {
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.strokeStyle = color;
  ctx.globalCompositeOperation = drawMode;
  ctx.stroke();
};

export default {
  distanceBetween,
  angleBetween,
  isInsideRemovedArea,
  drawRectangle,
  drawPoint,
  drawLine
};
