<!-- OpenNewWindow.svelte -->
<!-- OpenNewWindow.svelte -->
<script>
  let newWindow = null;
  let windowWidth = 800;
  let windowHeight = 600;

  function openNewWindow() {
    // Open a new window with specified dimensions
    newWindow = window.open(
      "",
      "_blank",
      `width=${windowWidth},height=${windowHeight}`,
    );
    // Resize the new window initially
    if (newWindow) {
      newWindow.resizeTo(windowWidth, windowHeight);

      // Add event listener to the new window
      newWindow.addEventListener("resize", () => {
        handleWindowResize(newWindow);
      });
    }
  }
  let oldWidth = 800;
  let oldHeight = 600;

  function handleWindowResize(newWindow) {
    const aspectRatio = 4 / 3; // Desired aspect ratio
    const newWidth = newWindow.outerWidth;
    const newHeight = newWindow.outerHeight;

    let fixedWidth;
    let fixedHeight;
    // const newHeight = Math.round(newWidth / aspectRatio); // Calculate height based on aspect ratio
    if (newHeight != oldHeight) {
      fixedHeight = newHeight;
      fixedWidth = newHeight * aspectRatio;
    }
    if (newWidth != oldWidth) {
      fixedWidth = newWidth;
      fixedHeight = newWidth / aspectRatio;
    }

    oldWidth = newWidth;
    oldHeight = newHeight;

    // Resize the window
    newWindow.resizeTo(fixedWidth, fixedHeight);
  }

  function closeWindow() {
    if (newWindow) {
      newWindow.close();
      newWindow = null;
    }
  }
</script>

<button on:click={openNewWindow}>Open New Window</button>
<button on:click={closeWindow}>Close Window</button>

<p>Window Width: {windowWidth}px</p>
<p>Window Height: {windowHeight}px</p>
