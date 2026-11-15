/* FreshSense — form submit helper shared by the home page, reserve page and partners page.
   Everything posts straight to the Google Sheet (Apps Script web app) set in waitlist-config.js. */
window.FSWaitlist = (() => {
  async function post(body) {
    const url = window.FS_WAITLIST_URL;
    if (!url) return { ok: false, error: 'failed' };
    try {
      // text/plain keeps this a "simple" request, so no CORS preflight against Apps Script
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
      const j = await res.json();
      if (j.ok) return { ok: true, duplicate: !!j.duplicate };
      return { ok: false, error: j.error || 'failed' };
    } catch (_) { return { ok: false, error: 'failed' }; }
  }
  const src = (base) => {
    let ref = '';
    try { ref = new URLSearchParams(location.search).get('ref') || sessionStorage.getItem('fs_ref') || ''; if (ref) sessionStorage.setItem('fs_ref', ref); } catch (_) {}
    return ref ? base + ':' + ref.slice(0, 20) : base;
  };
  return {
    submit: (data, source) => post({ ...data, type: 'waitlist', source: src(source) }),
    partner: (data) => post({ ...data, type: 'partner', source: src('partners') })
  };
})();
