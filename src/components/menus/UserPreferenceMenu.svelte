<script>
  import GearIcon from "../../assets/GearIcon.svelte";
  import { updateUserState, userState } from "../../../stores/media/userState";
  import { onDestroy } from "svelte";

  let user_state;
  let isExpanded = false;

  const unsubscribe = userState.subscribe((value) => {
    user_state = value;
  });

  onDestroy(unsubscribe);

  const handleUpdate = (e) => {
    const { id } = e.target;
    let oldPrefs = { ...user_state };
    switch (id) {
      case "selfView":
        updateUserState("hideSelf", !oldPrefs.hideSelf);
        break;
      case "debug-menu":
        updateUserState("debug", !oldPrefs.debug);
        break;
      case "viewOptions":
        updateUserState(
          "view",
          oldPrefs.view === "gallery" ? "speaker" : "gallery",
        );
        break;
      default:
        return;
    }
  };

  function toggleMenu() {
    isExpanded = !isExpanded;
  }
</script>

<nav
  class="user-prefs-container"
  class:expanded={isExpanded}
  class:collapsed={!isExpanded}
>
  <button
    id="toggle-menu"
    class="clear empty"
    class:emptyExpanded={isExpanded}
    class:emptyCollapsed={!isExpanded}
    on:click={toggleMenu}
  >
    <GearIcon />
  </button>
  <div class="nav-buttons">
    <button class="clear" id="viewOptions" on:click={handleUpdate}>
      {user_state.view === "speaker" ? "Gallery View" : "Speaker View"}
    </button>
    <button class="clear" id="selfView" on:click={handleUpdate}>
      {user_state.hideSelf ? "Show Self" : "Hide Self"}
    </button>
    <!-- <button class="clear" id="debug-menu" on:click={handleUpdate}>
      {user_state.debug ? "Hide Debugger" : "Debug"}
    </button> -->
    <!-- </div> -->
  </div>
</nav>

<style>
  #toggle-menu {
    min-width: 60px !important;
  }

  .user-prefs-container {
    display: flex;
    flex-direction: row;
    justify-content: left;
    transition: opacity 0.5s ease;
    overflow: hidden;
    position: fixed;
    top: 5px;
    right: 4px;
    z-index: 200;
  }

  .nav-buttons {
    display: flex;
  }

  .collapsed {
    width: 65px;
    /* background-color: red; */
    transition: all ease 0.5s;
  }

  .expanded {
    width: 600px;
    transition: all ease 0.5s;
    right: -240px;
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
    width: 60px !important;
  }

  .emptyCollapsed {
    margin-right: 100px;
  }

  .empty:active,
  .empty:focus {
    outline: none !important;
    border: none !important;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    box-shadow: none;
  }

  @media screen and (max-width: 600px) {
    .expanded {
      right: -249px;
    }
    .emptyCollapsed {
      margin-right: 20px;
    }
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  button:focus,
  button:active,
  button:hover {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  button:hover {
    background-color: #535bf2;
  }

  button:active {
    background-color: #4347d9;
  }
</style>
