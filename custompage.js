// Global variables
let videoStream;
const videoElement = document.getElementById("videoElement");

console.log(faceapi.nets);

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]);

//---------------------------------------------------------------------------------------------------

// Start webcam capture
const startWebcamCapture = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("Webcam started");
    videoStream = stream;
    videoElement.srcObject = stream;
    videoElement.width = 0;
    videoElement.height = 0;
    videoElement.style.display = "none";

    startFaceDetection();

  } catch (error) {
    console.error("Error starting webcam:", error);
  }

};

// Start face detection
const startFaceDetection = () => {
  videoElement.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(videoElement);
    document.body.append(canvas);

    const displaySize = { width: videoElement.width, height: videoElement.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detections.length) {
        console.log("No face detected : Logging Out and Face Tracker is Stopped... !!");
        chrome.runtime.sendMessage({ action: "clearCookie" });
        stopWebcamCapture();
      } else console.log("face detected : ", detections);
    }, 10000);
  });
};

// Stop webcam capture
const stopWebcamCapture = () => {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    videoStream = null;
    videoElement.srcObject = null;
    videoElement.width = 0;
    videoElement.height = 0;
    console.log("Webcam stopped");
  }
};

// Toggle Picture-in-Picture mode
const togglePiPMode = async () => {
  if (!videoElement.srcObject) {
    console.warn("No video stream available.");
    return;
  }

  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await videoElement.requestPictureInPicture();
    }
  } catch (error) {
    console.error("Error toggling Picture-in-Picture mode:", error);
  }
};

// Event listeners
document
  .getElementById("toggleButton")
  .addEventListener("click", togglePiPMode);
document.getElementById("start").addEventListener("click", startWebcamCapture);
document.getElementById("stop").addEventListener("click", stopWebcamCapture);

// Initialize face detector when the script loads
// initializeFaceDetector();
