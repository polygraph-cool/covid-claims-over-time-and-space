import { onDestroy } from "svelte";
import { format } from "d3-format";

export const move = (x, y = 0, isAttr = false) =>
  `transform: translate(${x}${isAttr ? "" : "px"}, ${y}${isAttr ? "" : "px"})`;

export const moveCentered = (x, y = 0) =>
  `transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

export const moveTooltip = (x, y = 0) =>
  `transform: translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`;

export const getSpiralPositions = (
  n = 100,
  pointRadius = 5,
  angleDiff = 2,
  distance = 1.5
) => {
  let angle = 0;
  return new Array(n).fill(0).map((_, i) => {
    const radius = Math.sqrt(i + 0.3) * pointRadius * distance;
    angle += Math.asin(1 / radius) * pointRadius * angleDiff;
    angle = angle % (Math.PI * 2);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      angle,
    };
  });
};

let runningId = 0;
export const getUniqueId = () => {
  runningId++;
  return runningId;
};

export const flatten = (arr) => arr.reduce((a, b) => [...a, ...b]);

export const getPointFromAngleAndDistance = (angle, distance) => ({
  x: Math.cos((angle * Math.PI) / 180) * distance,
  y: Math.sin((angle * Math.PI) / 180) * distance,
});

export const sum = (arr) => arr.reduce((a, b) => a + b, 0);

export const getDistanceFromXY = ([x, y]) =>
  Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

export const getNumberWithUnits = (d, numDecimals = 1) => {
  const siUnits = Math.floor((d / 10).toFixed(0).toString().length);
  return siUnits >= 15
    ? format(`.${numDecimals}f`)(d / 1000000000000000) + " quadrillion"
    : siUnits >= 12
    ? format(`.${numDecimals}f`)(d / 1000000000000) + " trillion"
    : siUnits >= 9
    ? format(`.${numDecimals}f`)(d / 1000000000) + " billion"
    : siUnits >= 6
    ? format(`.${numDecimals}f`)(d / 1000000) + " million"
    : siUnits >= 3
    ? format(`.${numDecimals}f`)(d / 1000) + " thousand"
    : d < 0.001
    ? 0
    : d < 0.1
    ? format(`,.2f`)(d)
    : format(`,.02f`)(d);
};

// grabbed from https://gist.github.com/callumlocke/cc258a193839691f60dd
export const scaleCanvas = (canvas, context, width, height) => {
  // assume the device pixel ratio is 1 if the browser doesn't specify it
  const devicePixelRatio = window.devicePixelRatio || 1;

  // determine the 'backing store ratio' of the canvas context
  const backingStoreRatio =
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;

  // determine the actual ratio we want to draw at
  const ratio = devicePixelRatio / backingStoreRatio;

  if (devicePixelRatio !== backingStoreRatio) {
    // set the 'real' canvas size to the higher width/height
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    // ...then scale it back down with CSS
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  } else {
    // this is a normal 1:1 device; just scale it simply
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "";
    canvas.style.height = "";
  }

  // scale the drawing context so everything will work at the higher ratio
  context.scale(ratio, ratio);
};

// from https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export const debounce = (func, wait, immediate) => {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

export const getDomainNameFromUrl = (url) => {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }

  //find & remove port number
  hostname = hostname.split(":")[0];
  hostname = hostname.replace("www.", "");
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
};

export function onInterval(callback, milliseconds) {
  const interval = setInterval(callback, milliseconds);

  onDestroy(() => {
    clearInterval(interval);
  });
}

export const getOrdinal = (d) => {
  const t = d % 10;
  return Math.floor((d % 100) / 10) === 1
    ? "th"
    : t === 1
    ? "st"
    : t === 2
    ? "nd"
    : t === 3
    ? "rd"
    : "th";
};

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
// from: https://stackoverflow.com/questions/27078285/simple-throttle-in-js
export function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function () {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function () {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}
