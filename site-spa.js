(function(){
  // Minimal SPA navigation: fetch page, extract .page, replace content, execute scripts.
  if(!('fetch' in window)) return;

  function isInternalLink(a){
    if(!a || a.target || a.hasAttribute('download')) return false;
    var href = a.getAttribute('href');
    if(!href) return false;
    if(href.indexOf('mailto:')===0 || href.indexOf('http')===0 && new URL(href,location.href).origin!==location.origin) return false;
    // allow same-origin
    return true;
  }

  async function fetchAndReplace(url, addToHistory){
    try{
      var res = await fetch(url, {credentials:'same-origin'});
      if(!res.ok) { location.href = url; return; }
      var text = await res.text();
      var parser = new DOMParser();
      var doc = parser.parseFromString(text, 'text/html');
      var newPage = doc.querySelector('.page');
      if(!newPage){ location.href = url; return; }
      // replace content
      var cur = document.querySelector('.page');
      if(!cur){ location.href = url; return; }
      cur.innerHTML = newPage.innerHTML;
      // update title
      if(doc.title) document.title = doc.title;
      // run scripts from parsed doc
      var scripts = Array.from(doc.scripts || []);
      scripts.forEach(function(s){
        if(s.src){
          var existing = document.querySelector('script[src="'+s.src+'"]');
          if(!existing){
            var n = document.createElement('script'); n.src = s.src; n.defer = true; document.body.appendChild(n);
          }
        } else {
          try{ new Function(s.textContent)(); }catch(e){ console.warn('spa inline script error', e); }
        }
      });
      if(addToHistory) history.pushState({url:url}, '', url);
      window.scrollTo(0,0);
      document.dispatchEvent(new CustomEvent('spa:navigated', { detail: { url: url } }));
    }catch(err){ console.error('SPA fetch failed', err); location.href = url; }
  }

  document.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if(!a) return;
    if(!isInternalLink(a)) return;
    var href = a.getAttribute('href');
    if(!href) return;
    // make absolute
    var url = new URL(href, location.href).href;
    // same page anchor -> let browser handle
    if(url.split('#')[0] === location.href.split('#')[0]) return;
    e.preventDefault();
    fetchAndReplace(url, true);
  });

  window.addEventListener('popstate', function(e){
    var url = (e.state && e.state.url) || location.href;
    fetchAndReplace(url, false);
  });

})();
