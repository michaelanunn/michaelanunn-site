(function(){
  var AUDIO_SRC = '/media/audio2.mp3';
  var STORAGE_PLAY = 'siteAudioPlaying';
  var STORAGE_TIME = 'siteAudioTime';

  var audio = document.createElement('audio');
  audio.id = 'site-audio';
  audio.src = AUDIO_SRC;
  audio.loop = true;
  audio.preload = 'auto';
  audio.style.display = 'none';
  document.documentElement.appendChild(audio);

  // inject minimal CSS to ensure button is dark/minimal and not overridden
  var css = '\n#site-audio-btn{position:fixed;right:18px;bottom:18px;width:44px;height:44px;border-radius:50%;border:none;background:rgba(0,0,0,0.48);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;cursor:pointer;z-index:9999;padding:0;}\n#site-audio-btn svg{display:block;}\n#site-audio-btn:focus{outline:2px solid rgba(150,200,255,0.12);}\n';
  var s = document.createElement('style'); s.appendChild(document.createTextNode(css)); document.head.appendChild(s);

  // create minimal floating control
  var btn = document.createElement('button');
  btn.id = 'site-audio-btn';
  btn.setAttribute('aria-pressed','false');
  btn.title = 'Play background audio';

  var svgPlay = '<svg viewBox="0 0 24 24" width="18" height="18" fill="#cfeeff"><path d="M8 5v14l11-7z"/></svg>';
  var svgPause = '<svg viewBox="0 0 24 24" width="18" height="18" fill="#cfeeff"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
  btn.innerHTML = svgPlay;
  document.body.appendChild(btn);

  function setPlayingUI(isPlaying){
    btn.innerHTML = isPlaying? svgPause: svgPlay;
    btn.setAttribute('aria-pressed', String(isPlaying));
    btn.title = isPlaying? 'Pause background audio' : 'Play background audio';
  }

  // try to restore time
  var savedTime = parseFloat(localStorage.getItem(STORAGE_TIME) || '0');
  if(!isNaN(savedTime) && savedTime>0) {
    audio.currentTime = savedTime;
  }

  function saveTime(){
    try{ localStorage.setItem(STORAGE_TIME, String(audio.currentTime || 0)); }catch(e){}
  }

  // attempt to autoplay if user previously allowed
  var wantPlay = localStorage.getItem(STORAGE_PLAY) === 'true';

  function tryPlayOnLoad(){
    if(!wantPlay) return showButton();
    var p = audio.play();
    if(p !== undefined){
      p.then(function(){
        setPlayingUI(true);
        btn.style.display = '';
      }).catch(function(err){
        // autoplay blocked
        console.warn('Autoplay blocked', err);
        showButton();
      });
    } else {
      // older browsers
      showButton();
    }
  }

  function showButton(){
    btn.style.display = '';
    setPlayingUI(!audio.paused && !audio.ended);
  }

  btn.addEventListener('click', function(){
    if(audio.paused){
      audio.play().then(function(){
        localStorage.setItem(STORAGE_PLAY,'true');
        setPlayingUI(true);
      }).catch(function(err){
        console.error('Play failed', err);
        // leave button visible
      });
    } else {
      audio.pause();
      localStorage.setItem(STORAGE_PLAY,'false');
      setPlayingUI(false);
    }
  });

  // save time periodically
  var saver = setInterval(saveTime, 1000);
  window.addEventListener('beforeunload', saveTime);
  document.addEventListener('visibilitychange', function(){ if(document.hidden) saveTime(); });

  audio.addEventListener('play', function(){ setPlayingUI(true); btn.style.display = ''; });
  audio.addEventListener('pause', function(){ setPlayingUI(false); });
  audio.addEventListener('error', function(e){ console.error('Site audio error', e); showButton(); });

  // run
  tryPlayOnLoad();
})();
