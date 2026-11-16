/* FreshSense — menu toggle + form submission (posts to the Google Sheet via waitlist.js) */
(function () {
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
  }

  var hdr=document.querySelector('.hdr');
  if(hdr){var onS=function(){hdr.classList.toggle('is-scrolled',window.scrollY>40);};onS();window.addEventListener('scroll',onS,{passive:true});}

  document.querySelectorAll('form[data-fs]').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_gotcha"]') && form.querySelector('[name="_gotcha"]').value) return;
      var btn = form.querySelector('button[type="submit"]');
      var msg = form.querySelector('.msg');
      var kind = form.getAttribute('data-fs');
      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== '_gotcha') data[k] = String(v).trim(); });
      btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending…';
      msg.className = 'msg';
      var res = (window.FSWaitlist && kind === 'partner') ? await window.FSWaitlist.partner(data)
              : (window.FSWaitlist ? await window.FSWaitlist.submit(data, form.getAttribute('data-source') || 'site') : { ok: false });
      btn.disabled = false; btn.textContent = label;
      if (res && res.ok) {
        form.reset();
        msg.textContent = kind === 'partner' ? 'Request received. We will reply with the roadmap and pilot data.'
          : (res.duplicate ? 'You are already on the list. We will be in touch.' : 'You are on the list. We will email you as soon as FreshSense is ready.');
        msg.className = 'msg ok';
      } else {
        msg.textContent = 'Something went wrong. Please check your details and try again, or email freshsenseai.home@gmail.com.';
        msg.className = 'msg err';
      }
    });
  });
})();
