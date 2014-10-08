var AnimatedGif = require('Animated_GIF/src/Animated_GIF.js');

module.exports = function (videoElem, numFrames, workerPath, cb) {
  var frameDuration = videoElem.duration / numFrames;
  var recordingElem = document.createElement('video');

  var gifCreator = new AnimatedGif({ workerPath: workerPath });
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  gifCreator.setSize(videoElem.videoWidth, videoElem.videoHeight);
  gifCreator.setDelay(frameDuration * 1000);
  canvas.width = videoElem.videoWidth;
  canvas.height = videoElem.videoHeight;
  var frame = 0;

  recordingElem.addEventListener('error', function(err) {
    gifCreator.destroy();
    cb(err);
  });

  recordingElem.addEventListener('loadeddata', function() {
    // seek to the first frame (triggering the seeked callback below)
    recordingElem.currentTime = frame * frameDuration;
  });

  recordingElem.addEventListener('seeked', function() {
    context.drawImage(recordingElem, 0, 0);
    gifCreator.addFrameImageData(context.getImageData(0, 0, canvas.width, canvas.height));
    frame++;

    if (frame < numFrames) {
      recordingElem.currentTime = frame * frameDuration;
    } else {
      gifCreator.getBlobGIF(function(image) {
        gifCreator.destroy();
        cb(null, image);
      });
    }
  });

  recordingElem.src = videoElem.src;
  recordingElem.load();
};
