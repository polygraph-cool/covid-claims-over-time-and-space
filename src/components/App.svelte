<script>
  import { onMount } from "svelte";
  import { json } from "d3-fetch";

  import claimTitles from "./../data/claim-titles.json";
  import claim1 from "./../data/IFCN_Polygraph CLAIMS OVER TIME SPREADSHEET - CLAIM 1.csv";
  import claim2 from "./../data/IFCN_Polygraph CLAIMS OVER TIME SPREADSHEET - CLAIM 2.csv";
  import claim3 from "./../data/IFCN_Polygraph CLAIMS OVER TIME SPREADSHEET - CLAIM 3.csv";
  import claim4 from "./../data/IFCN_Polygraph CLAIMS OVER TIME SPREADSHEET - CLAIM 4.csv";
  import claim5 from "./../data/IFCN_Polygraph CLAIMS OVER TIME SPREADSHEET - CLAIM 5.csv";

  import "./../css/app.css";
  // import {} from "./../stores";

  const claims = [claim1, claim2, claim3, claim4, claim5];
  let currentClaimIndex = 0;

  import ClaimTimeline from "./ClaimTimeline.svelte";

  onMount(() => {
    const hash = window.location.hash.slice(1);
    currentClaimIndex = hash ? +hash : 0;
  });
</script>

<div class="c">

  <select bind:value="{currentClaimIndex}">
    {#each claimTitles as option, i}
      <option value="{i}">{option}</option>
    {/each}
  </select>
  <br />
  <br />
  <ClaimTimeline
    data="{claims[currentClaimIndex]}"
    title="{claimTitles[currentClaimIndex]}" />

</div>

<style>
  .c {
    text-align: center;

    padding: 3em 2em;
  }

  select {
    max-width: 100%;
  }
</style>
