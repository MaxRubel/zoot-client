<script>
  import LocalVideo from "../media/LocalVideo.svelte";
  import LocalVideoGallery from "../media/LocalVideoGallery.svelte";
  import PeerMedia from "../media/PeerMedia.svelte";

  export let peerConnections;
  export let audioOn;
  export let videoOn;
  export let pauseImage;
  export let myId;
  export let updatePeerStates;
  export let peerStates;
  export let videoStream;

  let presenter;
  let presenterId = null;

  const iAmSpeaking = (id) => {
    presenterId = id;
  };
</script>

<div class="top">
  <div id="video-container" class="top">
    <LocalVideoGallery
      {iAmSpeaking}
      {audioOn}
      {videoOn}
      {pauseImage}
      {videoStream}
    />

    {#each Object.entries(peerConnections) as [peerId, connection] (peerId)}
      <PeerMedia
        gallery={true}
        {connection}
        {peerId}
        small={false}
        {iAmSpeaking}
        {updatePeerStates}
        {peerStates}
      />
    {/each}
  </div>
</div>

<style>
  .top {
    margin-top: 10px;
  }

  #video-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 5px;
    padding: 0px 3px;
    margin-bottom: 80px;
  }

  @media screen and (max-width: 600px) {
    #video-container {
      grid-template-columns: 1fr;
    }
  }

  @media screen and (min-width: 601px) {
    #video-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
