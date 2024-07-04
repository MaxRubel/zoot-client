<script>
  import GearIcon from "../../assets/GearIcon.svelte";
  import { updateUserPreferences } from "../../../stores/media/userPreferences";

  export let userPrefs;
  export let presenter;

  let isExpanded = false;

  const handleUpdate = (e) => {
    switch (e.target.id) {
      case "selfView":
        userPrefs = { ...userPrefs, hideSelf: !userPrefs.hideSelf };
        updateUserPreferences(userPrefs);
    }
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
      {userPrefs.speakerView ? "Gallery View" : "Speaker View"}
    </button>
    <button class="clear" id="selfView" on:click={handleUpdate}>
      {userPrefs.hideSelf ? "Show Self" : "Hide Self"}
    </button>
    <button class="clear" id="presentView" on:click={handleUpdate}>
      {userPrefs.watchPresenter && presenter ? "Stop Watching" : "Watch"}
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
    width: 465px;
    transition: all ease 0.5s;
  }

  .clear {
    display: flex;
    height: 60px;
    padding: 5px 2px !important;
    font-size: 16px;
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
