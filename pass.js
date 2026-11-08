/* Hair Reviewed: carry ad click data through to pleumeparis.com.
   Takes the Meta click ID (fbclid) and any utm_ / tracking parameters the visitor
   arrived with, remembers them while they browse this site, and adds them to
   every pleumeparis.com link so Meta and Triple Whale can credit the purchase to the ad. */
(function () {
  var KEY = 'hr_click_params';
  var saved = {};
  try { saved = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch (e) {}
  var incoming = new URLSearchParams(location.search);
  var found = false;
  incoming.forEach(function (v, k) { if (v) { saved[k] = v; found = true; } });
  if (found) { try { sessionStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} }

  function rewrite(a) {
    var url;
    try { url = new URL(a.href); } catch (e) { return; }
    if (!/(^|\.)pleumeparis\.com$/.test(url.hostname)) return;
    var hasAdUtm = Object.keys(saved).some(function (k) { return k.indexOf('utm_') === 0; });
    Object.keys(saved).forEach(function (k) {
      if (k.indexOf('utm_') === 0 || !url.searchParams.has(k)) url.searchParams.set(k, saved[k]);
    });
    if (hasAdUtm) {
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
        if (!saved[k] && url.searchParams.has(k)) url.searchParams.delete(k);
      });
      url.searchParams.set('hr_page', location.pathname.replace(/^\//, '') || 'index.html');
    }
    a.href = url.toString();
  }

  function run() {
    var links = document.querySelectorAll('a[href*="pleumeparis.com"]');
    for (var i = 0; i < links.length; i++) {
      rewrite(links[i]);
      links[i].addEventListener('click', function () {
        if (window.fbq) { try { fbq('trackCustom', 'ClickToStore', { page: location.pathname }); } catch (e) {} }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
