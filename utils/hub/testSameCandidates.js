export function testSameCandidates(pc) {
  pc.getStats().then((stats) => {
    stats.forEach((report) => {
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        const localCandidateId = report.localCandidateId;
        const remoteCandidateId = report.remoteCandidateId;

        const localCandidate = stats.get(localCandidateId);
        const remoteCandidate = stats.get(remoteCandidateId);

        if (localCandidate && remoteCandidate) {
          console.log('Local candidate:', localCandidate);
          console.log('Remote candidate:', remoteCandidate);

          // Check if local and remote candidates have the same properties
          if (localCandidate.foundation === remoteCandidate.foundation &&
            localCandidate.ip === remoteCandidate.ip &&
            localCandidate.port === remoteCandidate.port &&
            localCandidate.protocol === remoteCandidate.protocol) {
            console.log('Offerer and answerer are using the same ICE candidate');
          }
        }
      }
    });
  })
}