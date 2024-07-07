<script>
  import { onDestroy } from "svelte";

  const message = "You are presenting...";
  let text = "";
  let index = 0;

  let interval = setInterval(() => {
    if (index === 0) {
      text = "Y";
      index++;
    } else {
      text = message.slice(0, index + 1);
      index++;
      if (index === message.length) {
        index = 0;
      }
    }
  }, 400);

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="gif">
  <div class="text">{text}</div>
  <img src="/relaxing10.webp" alt="" />
</div>
