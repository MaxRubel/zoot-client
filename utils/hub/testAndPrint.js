import { testSameCandidates } from "./testSameCandidates";

export const testAndPrint = (peerConnections) => {
  const connections = Object.values(peerConnections);

  console.log("number of connections: ", connections.length);
  connections.forEach((conn, index) => {
    testSameCandidates(conn)
    const connObj = {
      connection: index + 1,
      localDescription: conn.localDescription,
      remoteDescription: conn.remoteDescription,
    };
    console.log("ice candidate status: ", conn.iceConnectionState);
    console.log(connObj);
    conn
      .getStats(null)
      .then((stats) => {
        stats.forEach((report) => {
          if (report.kind === "video") {
            console.log("video connection: ", index + 1, report);
            if (report.type === "outbound-rtp") {
              console.log("Sending video:", report.bytesSent);
            } else if (report.type === "inbound-rtp") {
              console.log("Receiving video:", report.bytesReceived);
            }
          }
        });
      })
      .catch((error) => {
        console.error("Error getting stats:", error);
      });
  });
};
