const endpoint = "http://localhost:8080";

const createNewRoom = (payload) =>
  new Promise((resolve, reject) => {
    fetch(`${endpoint}/newRoom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => resolve(data))
      .catch(reject);
  });

export default createNewRoom;
