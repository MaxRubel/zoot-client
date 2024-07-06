<script>
  import GearIcon from "../../assets/GearIcon.svelte";
  import { updateUserPreferences } from "../../../stores/media/userPreferences";

  export let userPrefs;
  export let presenter;

  let isExpanded = false;

  const handleUpdate = (e) => {
    const { id } = e.target;
    let newPrefs = { ...userPrefs };

    switch (id) {
      case "selfView":
        newPrefs.hideSelf = !newPrefs.hideSelf;
        break;
      case "debug-menu":
        newPrefs.debug = !newPrefs.debug;
        break;
      case "viewOptions":
        newPrefs.view = newPrefs.view === "gallery" ? "speaker" : "gallery";
        break;
      default:
        return;
    }

    updateUserPreferences(newPrefs);
  };

  function toggleMenu() {
    isExpanded = !isExpanded;
  }
</script>

<nav
  class="user-prefs"
  class:expanded={isExpanded}
  class:collapsed={!isExpanded}
>
  <button id="toggle-menu" class="clear empty" on:click={toggleMenu}>
    <GearIcon />
  </button>
  <div class="nav-buttons">
    <button class="clear" id="viewOptions" on:click={handleUpdate}>
      {userPrefs.view === "speaker" ? "Gallery View" : "Speaker View"}
    </button>
    <button class="clear" id="selfView" on:click={handleUpdate}>
      {userPrefs.hideSelf ? "Show Self" : "Hide Self"}
    </button>
    <button class="clear" id="presentView" on:click={handleUpdate}>
      {userPrefs.watchPresenter && presenter ? "Stop Watching" : "Watch"}
    </button>
    <button class="clear" id="debug-menu" on:click={handleUpdate}>
      {userPrefs.debug ? "Hide Debugger" : "Debug"}
    </button>
  </div>
</nav>

<style>
  .user-prefs {
    display: flex;
    flex-direction: row;
    justify-content: left;
    transition: opacity 0.5s ease;
    overflow: hidden;
  }

  .nav-buttons {
    display: flex;
  }

  .collapsed {
    width: 40px;
    transition: all ease 0.5s;
  }

  .expanded {
    width: 600px;
    transition: all ease 0.5s;
  }

  .clear {
    display: flex;
    height: 40px;
    padding: 5px 2px !important;
    background-color: rgba(24, 59, 90, 0.328);
    font-size: 14px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0px 4px;
    width: 130px;
  }

  .empty {
    background-color: transparent;
    color: white;
    border: none;
    width: 60px;
    padding: 20px;
    margin-right: 20px;
  }
  .empty:active,
  .empty:focus {
    outline: none !important;
    border: none !important;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    box-shadow: none;
  }
</style>
