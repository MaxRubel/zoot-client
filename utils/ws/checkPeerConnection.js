export function checkPeerConnection(peersObj, senderId, myId) {
  if (peersObj[senderId]) {
    return true;
  }
  if (peersObj[senderId] === myId) {
    return true;
  }
  return false;
}
