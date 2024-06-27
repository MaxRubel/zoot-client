// @ts-nocheck
export const addPeersToLocal = (peers, myId, arr) => {
  // console.log("checking array of clients: ", arr)
  const returnArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (peers.some((item) => item === arr[i])) {
      continue;
    }
    if (arr[i] === myId) {
      continue;
    }
    if (arr[i].length === 1) {
      continue;
    }
    returnArr.push(arr[i]);
  }
  return returnArr;
};
