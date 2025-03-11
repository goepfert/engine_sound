window.onload = function () {
  const start = document.getElementById('start');
  const stop = document.getElementById('stop');
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const xhr = new XMLHttpRequest();
  const pitch = { step: 0, min: 1.1, max: 2.2 };
  const pitchStep = 0.02;

  let source;
  let intervalId;

  function createPitchStep(n) {
    return function (e) {
      if (e.keyCode == 38) {
        pitch.step = n;
      }
    };
  }

  xhr.open('GET', './engine.wav', true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function (e) {
    let audioData = this.response;

    window.addEventListener('keydown', createPitchStep(pitchStep));
    window.addEventListener('keyup', createPitchStep(-1 * pitchStep));

    start.addEventListener('click', function (e) {
      if (!source) {
        source = audioCtx.createBufferSource();

        audioCtx.decodeAudioData(audioData, function (buffer) {
          source.buffer = buffer;
          source.loop = true;
          source.connect(audioCtx.destination);
          source.start();
        });

        intervalId = setInterval(function () {
          let currPitch = source.playbackRate.value;

          if ((pitch.step < 0 && currPitch > pitch.min) || (pitch.step > 0 && currPitch < pitch.max)) {
            source.playbackRate.value += pitch.step;
          }
        }, 50);
      }
    });

    stop.addEventListener('click', function (e) {
      if (source) {
        source.stop();
        source = null;
        clearInterval(intervalId);
      }
    });
  };

  xhr.send();
};
