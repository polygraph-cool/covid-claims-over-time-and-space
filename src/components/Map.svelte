<script>
  import { onMount } from "svelte";
  import { extent } from "d3-array";
  import { csv, json } from "d3-request";
  import { Delaunay } from "d3-delaunay";
  import { scaleLinear, scaleSqrt } from "d3-scale";
  import { timeFormat } from "d3-time-format";
  import { timeDay } from "d3-time";
  import { interpolateRdBu } from "d3-scale-chromatic";
  import {
    geoOrthographic,
    geoPath,
    geoGraticule10,
    geoEquirectangular
  } from "d3-geo";
  import { geoArmadillo } from "d3-geo-projection";
  import { interpolateHcl } from "d3-interpolate";
  import {
    countryShapes,
    countryCentroids,
    countryCentroidsVertical
  } from "./../data/countryData";
  // import countryShapes from "./../data/countries.json";
  import { tweened } from "./../tweened-staggered";

  import {
    debounce,
    scaleCanvas,
    move,
    moveTooltip,
    getOrdinal
  } from "./../utils.js";

  export let data = [];
  export let startDate;

  let width = 100;
  $: isVertical = width < 445;
  $: height = width * (isVertical ? 2 : 0.7);
  let canvasElement = null;
  let topLeftBubble;
  let blankMap;
  let delaunay;
  let focusedBubble;

  const formatDate = d =>
    [
      timeFormat("%-B %-d")(d),
      getOrdinal(timeFormat("%-d")(d)),
      timeFormat(", %Y")(d)
    ].join("");

  const sphere = { type: "Sphere" };
  $: projection = isVertical
    ? geoOrthographic()
        .fitSize([width, width], sphere)
        .rotate([-60, -20])
    : geoArmadillo()
        .fitSize([width, height], sphere)
        .rotate([-9, 0]);
  $: projection2 =
    isVertical &&
    geoOrthographic()
      .fitSize([width, width], sphere)
      .translate([width / 2, height * 0.7])
      .rotate([90, -20]);

  $: values = Object.values(data);
  $: maxValue = Math.max(...values.filter(Number.isFinite));
  $: colorScale = scaleLinear()
    .range(
      ["#67B244", "#f8f8f8"]
      // interpolateRdBu
    )
    .domain([0, 30])
    // .interpolate(interpolateRdBu)
    // .interpolate(interpolateHcl)
    .clamp(true);

  $: rScale = scaleSqrt()
    .domain([0, 30])
    .range([width * height * 0.0001, 0])
    .clamp(true);
  const fadeScale = scaleLinear()
    .domain([0, 30])
    .range([1, 0])
    .clamp(true);

  const intervalDuration = 300;
  $: bubbleSizes = tweened(new Array(20).fill(0).map(d => [0, 0]), {
    duration: intervalDuration
  });

  const drawCanvas = () => {
    if (!canvasElement) return;
    const ctx = canvasElement.getContext("2d");
    scaleCanvas(canvasElement, ctx, width, height);

    const drawMap = projection => {
      const path = geoPath(projection, ctx);
      const drawPath = shape => {
        ctx.beginPath();
        path(shape);
      };
      drawPath(sphere);
      if (!isVertical) ctx.clip();

      const fill = color => {
        ctx.fillStyle = color;
        ctx.fill();
      };
      const stroke = color => {
        ctx.strokeStyle = color;
        ctx.stroke();
      };
      drawPath(sphere);
      fill("#fff");
      stroke("#bbb");
      drawPath(geoGraticule10());
      stroke("#eee");

      // Object.values(countryShapes).forEach((shape) => {
      countryShapes.forEach(shape => {
        drawPath(shape);
        fill("#f8f8f8");
        stroke("#ccc");
      });
      ctx.restore(); // stop clipping

      drawPath(sphere);
      stroke("#ccc");
    };
    drawMap(projection);
    if (projection2) drawMap(projection2);

    bubbleSizes.set(new Array(20).fill(0).map(d => [0, 0]));

    blankMap = ctx.getImageData(0, 0, width * 2, height * 2);
  };

  const debouncedDrawCanvas = debounce(drawCanvas, 500);
  $: debouncedDrawCanvas();
  $: width,
    (() => {
      debouncedDrawCanvas();
    })();

  const getCentroid = country => {
    const centroid =
      (isVertical
        ? countryCentroidsVertical[country]
        : countryCentroids[country]) || [];
    return centroid.map(d => d * width);
  };

  const updateBubbleSizes = () => {
    const values = Object.values(data);
    const newBubbleSizes = new Array(20)
      .fill(0)
      .map((_, i) =>
        Number.isFinite(values[i])
          ? [rScale(values[i]), fadeScale(values[i])]
          : [0, 0]
      );
    bubbleSizes.set(newBubbleSizes);

    delaunay = Delaunay.from(
      Object.keys(data).map(d => getCentroid(d)),
      d => d[0],
      d => d[1]
    );
  };
  $: data, updateBubbleSizes();

  const drawBubbles = () => {
    if (!canvasElement) return;
    if (!blankMap) return;
    const ctx = canvasElement.getContext("2d");

    ctx.putImageData(blankMap, 0, 0);

    ctx.globalCompositeOperation = "multiply";
    Object.keys(data).forEach((country, i) => {
      if (country == "date") return;
      const centroid = getCentroid(country);
      if (!centroid) return;
      const [r, opacity] = $bubbleSizes[i] || [0, 0];
      ctx.beginPath();
      ctx.fillStyle = `rgba(103, 178, 68, ${opacity})`;
      ctx.arc(...centroid, r, 0, 2 * Math.PI);
      ctx.fill();
    });

    ctx.globalCompositeOperation = "normal";
  };

  $: $bubbleSizes, drawBubbles();

  const onMousemove = e => {
    const x = e.clientX - canvasElement.getBoundingClientRect().left;
    const y = e.clientY - canvasElement.getBoundingClientRect().top;

    const mousePosition = [x, y];
    const pointIndex = delaunay.find(...mousePosition);
    const hoveredCountry = Object.keys(data)[pointIndex];
    const daysSince = data[hoveredCountry];

    if (daysSince > 100) {
      focusedBubble = null;
      return;
    }
    focusedBubble = {
      position: getCentroid(hoveredCountry),
      country: hoveredCountry,
      daysSince,
      date: formatDate(timeDay.offset(startDate, daysSince))
    };
  };
</script>

<div class="canvas-wrapper" bind:clientWidth="{width}">
  {#if focusedBubble}
    <div class="tooltip" style="{moveTooltip(...focusedBubble['position'])}">
      {focusedBubble['country']}
      <div class="tooltip-date">
        False claim posted on {focusedBubble['date']}
      </div>
    </div>
  {/if}

  <canvas
    style="{`width: ${width}px; height: ${height}px`}"
    bind:this="{canvasElement}"
    on:mousemove="{onMousemove}"
    on:mouseleave="{() => (focusedBubble = null)}"></canvas>
</div>

<style>
  .canvas-wrapper {
    position: relative;
    width: 100%;
  }

  .tooltip {
    position: absolute;
    top: -1em;
    left: 0;
    background: white;
    border: 1px solid;
    max-width: 13em;
    padding: 0.6em 1em;
    font-size: 0.8em;
    line-height: 1.4em;
    border-radius: 4px;
    font-weight: 800;
    pointer-events: none;
  }
  .tooltip:before {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    background: white;
    width: 10px;
    height: 10px;
    border: 1px solid;
    border-top-width: 0;
    border-right-width: 0;
    transform-origin: 130% 80%;
    transform: translate(-50%, -100%) rotate(-45deg);
    transition: all 0.3s linear;
  }
  .tooltip-date {
    margin-top: 0;
    margin-bottom: 0;
    font-weight: 400;
    font-size: 0.9em;
    line-height: 1.4em;
  }
</style>
