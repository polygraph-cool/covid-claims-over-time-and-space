<script>
  import { onMount } from "svelte";
  import { json } from "d3-fetch";

  import claimTitles from "./../data/claim-titles.json";
  import claim1 from "./../data/IFCN_Polygraph CLAIMS OVER TIME SPREADSHEET - CLAIM 1.csv";
  import claim2 from "./../data/IFCN_Polygraph CLAIMS OVER TIME SPREADSHEET - CLAIM 2.csv";
  import claim3 from "./../data/IFCN_Polygraph CLAIMS OVER TIME SPREADSHEET - CLAIM 3.csv";
  import claim4 from "./../data/IFCN_Polygraph CLAIMS OVER TIME SPREADSHEET - CLAIM 4.csv";
  import claim5 from "./../data/IFCN_Polygraph CLAIMS OVER TIME SPREADSHEET - CLAIM 5.csv";

  import ClaimTimeline from "./ClaimTimeline.svelte";
  import Picker from "./Picker.svelte";

  import "./../css/app.css";
  // import {} from "./../stores";

  const claims = [claim1, claim2, claim3, claim4, claim5];
  let currentClaimIndex = 0;

  onMount(() => {
    const hash = window.location.hash.slice(1);
    currentClaimIndex = hash ? +hash : 0;
  });

  const pickerOptions = claimTitles.map(([long, short], i) => ({
    id: i,
    label: short
  }));
</script>

<div class="c">

  <div class="title">
    <Picker bind:value="{currentClaimIndex}" options="{pickerOptions}" />
    <h6>False claim</h6>
    <h3>{claimTitles[currentClaimIndex][0]}</h3>
  </div>
  <ClaimTimeline data="{claims[currentClaimIndex]}" />
  <div class="source-wrapper">
    <div class="source">
      This visualization was inspired by CovidInfodemicEurope, a project
      developed by Correctiv, AFP, Pagella Politica/Facta, Full Fact and
      Maldita.es
    </div>
  </div>
</div>

<style>
  .c {
    padding: 3em 2em;
    text-align: center;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  h3 {
    position: relative;
    font-weight: 800;
    max-width: 30em;
    margin: 0 auto -3em;
    line-height: 1.3em;
    height: 2em;
    font-size: 1.6em;
    z-index: 100;
  }
  h6 {
    margin-bottom: 0.5em;
  }
  .source-wrapper {
    max-width: 50em;
    margin: auto;
  }
  .source {
    opacity: 0.5;
    margin: 2em 0 0;
    margin-left: auto;
    font-size: 0.8em;
    line-height: 1.46em;
    text-align: right;
    max-width: 30em;
  }

  @media (max-width: 750px) {
    .c {
      padding-top: 1em;
    }
    h3 {
      margin-bottom: -1em;
    }
  }
  @media (max-width: 514px) {
    h3 {
      height: auto;
      margin: 0 auto 1em;
      font-size: 1.3em;
      line-height: 1.33em;
    }
    .source-wrapper {
      margin-top: 5em;
    }
  }
</style>
