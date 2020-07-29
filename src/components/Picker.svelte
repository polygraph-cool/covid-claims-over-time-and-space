<script>
  export let value;
  export let options = [];
</script>

<div class="c">
  {#each options as { id, label }, i}
    <button class:active="{value == id}" on:click="{() => (value = id)}">
      {i + 1}
    </button>
  {/each}
</div>

<style>
  .c {
    display: flex;
    text-align: center;
    justify-content: center;
    margin: 1em 0 1em;
  }
  button {
    appearance: none;
    background: white;
    height: 2.6em;
    width: 2.6em;
    margin: 0 0.2em;
    display: flex;
    /* font-weight: 600; */
    align-items: center;
    justify-content: center;
    outline: none;
    border: none;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    border-radius: 100%;
    border: 1px solid transparent;
  }
  button:focus {
    border-color: #000;
  }
  .active {
    background: #63aa41;
    color: white;
  }
</style>
