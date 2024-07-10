<nav class="nav-container">
  <logo class="logo">
    <a href="/">
      <img class="ducky" src="/invertedDucky.png" alt="duckyyyyy" />ZOOT</a
    >
  </logo>
  <div class="links"></div>
</nav>

<style>
  .ducky {
    width: 48px;
    margin-right: 10px;
    filter: brightness(1.3);
    padding-bottom: 5px;
  }
  .nav-container {
    display: grid;
    grid-template-columns: 200px 2fr 1fr;
  }
  .logo {
    font-size: 18pt;
    display: flex;
    justify-content: left;
  }
  .links {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  a {
    color: whitesmoke;
  }
</style>
