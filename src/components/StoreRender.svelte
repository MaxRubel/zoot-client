<script>
  import { peerStates } from "../../stores/media/peerStates";

  $: storeContent = JSON.stringify($peerStates, null, 2);
</script>

<div class="store-content centered">{storeContent}</div>

<style>
  .store-content {
    width: 100%;
    min-height: 40px;
    position: fixed;
    bottom: 80px;
    background-color: white;
    color: black;
  }
</style>
