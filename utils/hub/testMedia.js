export const testIncomingMedia = (peerConnections) => {
  const connections = Object.values(peerConnections);
  console.log("number of connections: ", connections.length);

  let i = 1

  connections.forEach((conn, index) => {
    console.log(`connection ${i}: ${conn.connectionState}`)
    i++
    console.log("ice candidate status: ", conn.iceConnectionState);
    conn
      .getStats(null)
      .then((stats) => {
        stats.forEach((report) => {
          if (report.kind === "video") {
            console.log("video connection: ", index + 1, report);
            if (report.type === "inbound-rtp") {
              console.log("Receiving video:", report.bytesReceived);
            }
          }
          if (report.kind === "audio") {
            console.log("audio connection: ", index + 1, report);
                if (report.type === "inbound-rtp") {
                console.log("Receiving audio:", report.bytesReceived);
            }
          }
        });
      })
  });
};