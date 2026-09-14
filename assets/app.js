/* Pasticceria Marpigi — logica minima della pagina.
   Le offerte vivono in data/offerte.json: per cambiarle non si tocca l'HTML. */

(function () {
  'use strict';

  var lista = document.getElementById('lista-offerte');

  function disegnaOfferte(offerte) {
    if (!lista) return;
    if (!Array.isArray(offerte) || offerte.length === 0) {
      lista.innerHTML = '<li><p class="testo" style="grid-column:1/-1">Nessuna offerta attiva in questo momento. Passa a trovarci.</p></li>';
      return;
    }
    lista.innerHTML = offerte.map(function (o) {
      return '<li>' +
        '<span class="quando">' + esc(o.quando) + '</span>' +
        '<div class="testo">' +
          '<h3>' + esc(o.titolo) + '</h3>' +
          (o.testo ? '<p>' + esc(o.testo) + '</p>' : '') +
        '</div>' +
      '</li>';
    }).join('');
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  // In produzione legge il JSON. Nella versione a file singolo il JSON è
  // incorporato in uno <script type="application/json" id="offerte-inline">.
  var inline = document.getElementById('offerte-inline');
  if (inline) {
    try { disegnaOfferte(JSON.parse(inline.textContent)); }
    catch (e) { disegnaOfferte([]); }
  } else {
    fetch('data/offerte.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(disegnaOfferte)
      .catch(function () { disegnaOfferte([]); });
  }

  // --- Modulo "avvisami" -------------------------------------------------
  var form = document.getElementById('form-avviso');
  var esito = document.getElementById('esito-avviso');

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = form.querySelector('#email');
      if (!email.value || !email.checkValidity()) {
        esito.textContent = 'Controlla l\u2019indirizzo email.';
        email.focus();
        return;
      }
      esito.textContent = 'Invio in corso\u2026';

      fetch('/api/avviso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value })
      })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r); })
        .then(function () {
          form.hidden = true;
          esito.textContent = 'Fatto. Ti scriviamo quando lo shop apre.';
        })
        .catch(function () {
          esito.innerHTML = 'Non riusciamo a registrare la mail. Scrivici su ' +
            '<a href="https://wa.me/390000000000" target="_blank" rel="noopener">WhatsApp</a>.';
        });
    });
  }
})();
