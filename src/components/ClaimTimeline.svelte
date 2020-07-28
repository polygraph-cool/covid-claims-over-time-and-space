<script>
  import { onDestroy } from "svelte";
  import { range, sum, extent } from "d3-array";
  import { scaleLinear, scaleTime } from "d3-scale";
  import { format } from "d3-format";
  import { timeFormat, timeParse } from "d3-time-format";
  import { timeDay } from "d3-time";
  import { area, curveMonotoneX } from "d3-shape";

  import Icon from "./Icon.svelte";
  import Map from "./Map.svelte";
  import Timeline from "./Timeline.svelte";
  import { getOrdinal } from "./../utils";

  export let data = [];
  export let title = "";

  const parseDate = timeParse("%-m/%-d/%Y");
  const formatDate = d =>
    [
      timeFormat("%-B %-d")(d),
      getOrdinal(timeFormat("%-d")(d)),
      timeFormat(", %Y")(d)
    ].join("");
  const getDateString = timeFormat("%-m/%-d/%Y");

  let dailyData = [];
  let numberOfDays;
  let xScale;
  let currentDateIndex = 0;
  let timelineData = [];
  let dateRange = [];
  let isPlaying = true;
  let interval;

  const tickDuration = 300;

  const onReset = () => {
    currentDateIndex = 0;
  };
  $: data, onReset();

  const onChangeDateIndex = (diff = 1) => {
    if (!numberOfDays) return;
    currentDateIndex = (currentDateIndex + diff + numberOfDays) % numberOfDays;
  };
  const onSetDateIndex = newIndex => {
    currentDateIndex = newIndex;
    isPlaying = false;
  };

  const onTick = () => {
    if (!isPlaying) return;
    onChangeDateIndex(1);
    if (currentDateIndex == numberOfDays - 1) isPlaying = false;
  };

  $: timelineProgress = currentDateIndex / numberOfDays;

  const xAccessor = d => parseDate(d["When did you see the claim?"]);

  const updateData = () => {
    if (!data || !data.length) return;

    let countriesByDay = {};
    let allCountries = new Set();
    data.forEach(d => {
      const countries = d["Countries"].split(",").map(d => d.trim());
      allCountries.add(...countries);

      countriesByDay[d["When did you see the claim?"]] = [
        ...(countriesByDay[d["When did you see the claim?"]] || []),
        ...countries
      ];
    });
    allCountries = [...allCountries];

    const justTheHitsDateRange = extent(data, xAccessor);
    const days = timeDay
      .every(1)
      .range(
        justTheHitsDateRange[0],
        timeDay.offset(justTheHitsDateRange[1], 5)
      );
    numberOfDays = days.length;
    dateRange = [days[0], days.slice(-1)[0]];

    let runningCountries = {};
    allCountries.forEach(country => {
      runningCountries[country] = 100;
    });

    timelineData = [];
    dailyData = days.map(day => {
      runningCountries["date"] = formatDate(day);

      Object.keys(runningCountries).forEach(country => {
        if (country == "date") return;
        runningCountries[country] += 1;
      });

      const dateString = getDateString(day);
      const newCountries = countriesByDay[dateString] || [];
      let runningI = 0;
      newCountries.forEach(country => {
        runningCountries[country] = 0;
        if (!timelineData.filter(d => d[0] == country).length) {
          timelineData.push([country, day, dateString, runningI]);
          runningI++;
        }
      });
      return { ...runningCountries };
    });

    if (interval) {
      clearInterval(interval);
    }
    interval = setInterval(onTick, tickDuration);
  };
  onDestroy(() => {
    if (interval) {
      clearInterval(interval);
    }
  });
  $: data, updateData();
</script>

<div class="c">
  <div class="title">
    <h6>False claim:</h6>
    <h3>{title}</h3>
  </div>
  <Map data="{dailyData[currentDateIndex]}" startDate="{dateRange[0]}" />
  <div class="controls">
    <button on:click="{() => (isPlaying = !isPlaying)}">
      <div class="play-icon">
        <Icon name="{isPlaying ? 'pause' : 'play'}" direction="e" />
      </div>
    </button>
    <Timeline
      progress="{timelineProgress * 100}"
      currentDate="{timeDay.offset(dateRange[0], currentDateIndex)}"
      {dateRange}
      data="{timelineData}"
      {onSetDateIndex} />
  </div>
</div>

<style>
  .c {
    width: 100%;
    max-width: 50em;
    margin: 0 auto;
  }

  .title {
    position: relative;
    z-index: 20;
  }

  h3 {
    font-weight: 800;
    max-width: 30em;
    margin: 0 auto -3em;
    line-height: 1.3em;
    height: 2em;
    font-size: 1.6em;
  }

  h6 {
    margin-bottom: 0;
  }

  .controls {
    position: relative;
    display: flex;
    align-items: center;
    margin-top: -2em;
    z-index: 10;
  }
  button {
    appearance: none;
    background: var(--gray-dark);
    border-radius: 100%;
    height: 3em;
    width: 3em;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    outline: none;
    color: white;
    flex: none;
    margin-right: 2em;
    font-size: 0.7em;
    cursor: pointer;
  }
  .play-icon {
    height: 1.1em;
  }
</style>
