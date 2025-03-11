window.onload = function () {
  const start_btn = document.getElementById('start');
  const stop_btn = document.getElementById('stop');
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const xhr = new XMLHttpRequest();
  const pitch = { step: 0, min: 1.1, max: 2.2 };
  const pitchStep = 0.02;
  const updateInterval = 50; // ms

  let source;
  let intervalId;

  function createPitchStep(n) {
    return function (e) {
      if (e.keyCode === 38) {
        pitch.step = n;
      }
    };
  }

  function handleAudioData(audioData) {
    window.addEventListener('keydown', createPitchStep(pitchStep));
    window.addEventListener('keyup', createPitchStep(-pitchStep));

    start_btn.addEventListener('click', startEngine);
    stop_btn.addEventListener('click', stopEngine);

    function startEngine() {
      if (!source) {
        source = audioCtx.createBufferSource();
        audioCtx.decodeAudioData(audioData, function (buffer) {
          source.buffer = buffer;
          source.loop = true;
          source.connect(audioCtx.destination);
          source.start();
        });

        intervalId = setInterval(updatePitch, updateInterval);
      }
    }

    function stopEngine() {
      if (source) {
        source.stop();
        source = null;
        clearInterval(intervalId);
      }
    }

    function updatePitch() {
      const currPitch = source.playbackRate.value;
      if ((pitch.step < 0 && currPitch > pitch.min) || (pitch.step > 0 && currPitch < pitch.max)) {
        source.playbackRate.value += pitch.step;
      }
    }
  }

  xhr.open('GET', './engine.wav', true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function () {
    handleAudioData(this.response);
  };
  xhr.send();
};
