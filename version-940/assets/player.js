(function () {
  window.initVideoPlayer = function (stream) {
    const video = document.getElementById('videoPlayer');
    const overlay = document.getElementById('playOverlay');
    let attached = false;
    let hlsPlayer = null;

    function attachStream() {
      if (attached || !video || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({ enableWorker: true });
        hlsPlayer.loadSource(stream);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function begin() {
      attachStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (!video) {
      return;
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && !video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsPlayer) {
        hlsPlayer.destroy();
        hlsPlayer = null;
      }
    });
  };
})();
