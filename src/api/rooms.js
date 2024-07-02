const endpoint = import.meta.env.VITE_LOCAL_SERVER
// const endpoint = import.meta.env.VITE_PUBLIC_SERVER

const createNewRoom = (payload) =>
  new Promise((resolve, reject) => {
    fetch(`${endpoint}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.text())
      .then((body) => resolve(body))
      .catch(reject);
  });

const getAllRooms = () =>
  new Promise((resolve, reject) => {
    fetch(`${endpoint}/rooms`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          resolve(Object.values(data));
        } else {
          resolve([]);
        }
      })
      .catch(reject);
  });

const joinARoom = (payload) =>
  new Promise((resolve, reject) => {
    fetch(`${endpoint}/joinRoom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(resolve)
      .catch(reject);
  });

const joinAWs = (payload) =>
  new Promise((resolve, reject) => {
    fetch(`${endpoint}/ws`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(resolve)
      .catch(reject);
  });

export { createNewRoom, getAllRooms, joinARoom, joinAWs };
