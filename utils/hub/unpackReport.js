export const unpackReport = (data) => {
  const [_, report] = data.split("-");
  const parsedObject = JSON.parse(report);

  if (parsedObject.sharing_screen) {

  }

  updatePeerState(peerId, (currentState) => ({
    ...currentState,
    ...parsedObject,
    initialized: true,
  }));
};