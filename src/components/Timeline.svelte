<script>
  import { scaleLinear } from "d3-scale";
  import countryAbbreviations from "./../data/countryAbbreviations";

  import { timeFormat } from "d3-time-format";
  import flags from "./flags/all.js";
  import { throttle, move, moveCentered, getOrdinal } from "../utils";
  import { timeDay } from "d3-time";

  export let progress = 0;
  export let currentDate;
  export let currentDateString;
  export let dateRange = [];
  export let data = {};
  export let onSetDateIndex;

  let timelineElement;
  let isDragging = false;
  let width = 100;

  const getDateString = timeFormat("%-m/%-d/%Y");
  const formatDate = (d) =>
    [
      timeFormat("%-B %-d")(d),
      getOrdinal(timeFormat("%-d")(d)),
      timeFormat(", %Y")(d),
    ].join("");

  $: dateStrings = timeDay
    .every(1)
    .range(...dateRange)
    .map(getDateString);
  $: currentDateString = getDateString(currentDate);

  $: xScale = scaleLinear()
    .domain([dateRange[0], dateRange[1]])
    .range([0, width]);

  const onClickDate = (date) => {
    const dateIndex = Math.min(
      dateStrings.length,
      timeDay.every(1).range(dateRange[0], date).length
    );

    onSetDateIndex(dateIndex);
  };

  const onClick = (e) => {
    const bounds = timelineElement.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const date = timeDay.round(new Date(xScale.invert(x)));
    onClickDate(date);
  };
  const debouncedOnClick = throttle(onClick, 50);

  const onMousedown = (e) => {
    isDragging = true;
    debouncedOnClick(e);

    addEventListener("mouseup", () => {
      isDragging = false;
    });
  };
  const onMousemove = (e) => {
    if (!isDragging) return;
    debouncedOnClick(e);
  };
</script>

<div class="c" bind:clientWidth="{width}" class:c--is-dragging="{isDragging}">
  {#each data as [country, date, dateString, i]}
    <div
      class="flag"
      class:flag--active="{currentDateString == dateString}"
      on:click="{() => onClickDate(date)}"
      style="{moveCentered(xScale(date), i * 15)}"
      class:no-flag="{!flags[countryAbbreviations[country]]}">
      <div class="flag-circle">
        {#if flags[countryAbbreviations[country]]}
          {@html flags[countryAbbreviations[country]]}
        {/if}
      </div>
      <div
        class="flag-tooltip"
        class:flag-tooltip--left="{xScale(date) > width * 0.7}">
        {country}
        <div class="flag-tooltip-date">
          False claim posted on {formatDate(date)}
        </div>
      </div>
    </div>
  {/each}
  <div
    class="cursor"
    class:cursor--is-dragging="{isDragging}"
    style="{move(xScale(currentDate))}">
    <div
      class="date"
      class:date--left="{progress < 30}"
      class:date--right="{progress > 70}">
      {formatDate(currentDate)}
    </div>
  </div>
  <div
    class="listener"
    on:mousedown="{onMousedown}"
    on:mousemove="{onMousemove}"
    bind:this="{timelineElement}"></div>
</div>

<style>
  .c {
    position: relative;
    height: 2em;
    width: 100%;
  }
  .c:before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    border-top: 4px solid var(--gray-light);
    border-radius: 3px;
    transform: translate(0, -50%);
  }
  .c--is-dragging .listener {
    z-index: 100;
  }
  .cursor {
    position: absolute;
    top: -0.2em;
    height: 1.3em;
    width: 1px;
    background: var(--gray-dark);
    transform: translate(-50%, -50%);
    border-radius: 2px;
    transition: transform 0.3s linear;
    pointer-events: none;
  }
  .cursor--is-dragging {
    transition: transform 0.1s linear;
  }
  .date {
    position: absolute;
    /* top: 0.5em; */
    top: 0;
    left: 50%;
    width: 12em;
    text-align: center;
    font-size: 0.9em;
    white-space: nowrap;
    font-size: 0.8em;
    transform: translate(-50%, -100%);
    /* transition: transform 0.3s linear; */
    user-select: none;
    background: var(--gray-dark);
    color: white;
    padding: 0.35em 1em;
  }
  .date:before {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    background: var(--gray-dark);
    width: 10px;
    height: 10px;
    transform-origin: 130% 80%;
    transform: translate(-50%, -100%) rotate(-45deg);
    /* transition: all 0.3s linear; */
  }
  .date--left {
    transform: translate(-9px, -100%);
  }
  .date--left:before {
    left: 0;
    transform: translate(30%, -100%) rotate(-45deg);
  }
  .date--right {
    transform: translate(calc(-100% + 9px), -100%);
  }
  .date--right:before {
    left: 100%;
    transform: translate(-140%, -100%) rotate(-45deg);
  }

  .flag {
    position: absolute;
    height: 0;
    width: 0;
    top: 50%;
    z-index: 15;
    cursor: pointer;
  }
  .flag-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.6em;
    height: 1.6em;
    border: 3px solid var(--gray-light);
    border-radius: 100%;
    transform: translate(-50%, -50%);
    transition: border 0.2s linear;
    overflow: hidden;
  }
  .flag-tooltip {
    /* background: var(--gray-dark);
    color: white; */
    background: white;
    border: 1px solid;
    color: var(--gray-dark);
    box-shadow: 0px 8px 10px -8px rgba(52, 73, 94, 0.4),
      0 1px 1px rgba(52, 73, 94, 0.2);
    position: absolute;
    top: 50%;
    right: -1.3em;
    width: 13em;
    padding: 0.6em 1em;
    font-size: 0.8em;
    text-align: left;
    font-weight: 800;
    line-height: 1.4em;
    transform: translate(100%, -50%);
    font-size: 0.8em;
    border-radius: 4px;
    /* white-space: nowrap; */
    opacity: 0;
    pointer-events: none;
  }
  .flag:hover {
    z-index: 20;
  }
  .flag:hover .flag-tooltip {
    opacity: 1;
  }
  .flag-tooltip:before {
    content: "";
    position: absolute;
    top: 50%;
    left: -6.5px;
    background: white;
    width: 10px;
    height: 10px;
    border: 1px solid;
    border-right-width: 0;
    border-bottom-width: 0;
    transform-origin: 130% 80%;
    transform: translate(0%, -100%) rotate(-45deg);
    transition: border 0.2s linear;
  }
  .flag-tooltip--left {
    right: auto;
    left: -1.3em;
    transform: translate(-100%, -50%);
  }
  .flag-tooltip--left:before {
    left: auto;
    right: -6px;
    border-right-width: 1px;
    border-bottom-width: 1px;
    border-left-width: 0;
    border-top-width: 0;
  }
  .flag-tooltip-date {
    margin-top: 0;
    margin-bottom: 0;
    font-weight: 400;
    font-size: 0.9em;
    line-height: 1.4em;
  }
  .flag :global(svg) {
    flex: 0 0 188%;
    width: 188%;
    /* height: 200%; */
  }
  .flag--active .flag-circle {
    position: absolute;
    transform: translate(-50%, -50%);
    border-color: var(--gray-dark);
  }
  .no-flag .flag-circle {
    background: white;
  }

  .listener {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    cursor: pointer;
  }
</style>
