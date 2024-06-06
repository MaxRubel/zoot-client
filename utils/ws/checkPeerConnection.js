export function checkPeerConnection(peersObj, senderId, myId) {
  if (peersObj[senderId]) {
    console.log("already connected to: ", senderId);
    return true;
  }
  if (peersObj[senderId] === myId) {
    console.log("this is my own request");
    return true;
  }
  return false;
}
