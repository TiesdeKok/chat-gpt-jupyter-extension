interface AudioRecorder {
    audioBlobs: Blob[];
    mediaRecorder: MediaRecorder | null;
    streamBeingCaptured: MediaStream | null;
    start(): Promise<void>;
    stop(): Promise<Blob>;
    cancel(): void;
    stopStream(): void;
    resetRecordingProperties(): void;
  }
  
  const audioRecorder: AudioRecorder = {
    audioBlobs: [],
    mediaRecorder: null,
    streamBeingCaptured: null,
  
    start: function () {
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        return Promise.reject(
          new Error(
            "mediaDevices API or getUserMedia method is not supported in this browser."
          )
        );
      } else {
        return navigator.mediaDevices
        .getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          })
          .then((stream: MediaStream) => {
            audioRecorder.streamBeingCaptured = stream;
            audioRecorder.mediaRecorder = new MediaRecorder(stream);
            audioRecorder.audioBlobs = [];
  
            audioRecorder.mediaRecorder.addEventListener("dataavailable", (event) => {
              audioRecorder.audioBlobs.push(event.data);
            });
  
            audioRecorder.mediaRecorder.start();
          });
      }
    },
  
    stop: function () {
      return new Promise<Blob>((resolve) => {
        if (!audioRecorder.mediaRecorder) {
          resolve(new Blob());
          return;
        }
  
        const mimeType = audioRecorder.mediaRecorder.mimeType;
  
        audioRecorder.mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioRecorder.audioBlobs, { type: "audio/wav" });
          resolve(audioBlob);
        });
  
        audioRecorder.cancel();
      });
    },
  
    cancel: function () {
      if (audioRecorder.mediaRecorder) {
        audioRecorder.mediaRecorder.stop();
      }
      audioRecorder.stopStream();
      audioRecorder.resetRecordingProperties();
    },
  
    stopStream: function () {
      if (audioRecorder.streamBeingCaptured) {
        audioRecorder.streamBeingCaptured.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    },
  
    resetRecordingProperties: function () {
      audioRecorder.mediaRecorder = null;
      audioRecorder.streamBeingCaptured = null;
    },
  };
  
  export default audioRecorder;
  