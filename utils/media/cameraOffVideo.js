export const cameraOff = async (peerConnections) => {
    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.getTracks().forEach((t) => (t.enabled = false));
    const connections = Object.values(peerConnections);
    
    connections.forEach((conn) => {
        const videoSender = conn.getSenders().find(function (s) {
          return s.track?.kind === "video";
        });
        if (videoSender) {
          videoSender.track.enabled = false;
        }
      });

 // Create a new video element
 const video = document.createElement('video');
 video.src = '../../public/relax2.mp4';
 video.loop = true;
 video.muted = true;

 const createFallbackStream = () => {
   const canvas = document.createElement('canvas');
   canvas.width = 640;
   canvas.height = 480;
   const ctx = canvas.getContext('2d');
   ctx.fillStyle = 'black';
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   return canvas.captureStream(30);
 };

 let stream;

 try {
   await new Promise((resolve, reject) => {
     video.oncanplay = () => {
       video.play().then(resolve).catch(reject);
     };
     video.load();
   });
   // Capture the stream from the video
   // @ts-ignore
   stream = video.captureStream();
 } catch (error) {
   console.error('Error loading or playing video:', error.name, error.message);
   stream = createFallbackStream();
 }

 const [videoTrack] = stream.getVideoTracks();

 for (const connection of Object.values(peerConnections)){
   const videoSender = connection.getSenders().find((s) => s.track?.kind === "video");
   if (videoSender) {
     await videoSender.replaceTrack(videoTrack)
   }
 }

 return stream;

};