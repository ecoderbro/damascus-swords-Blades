/* FLOW CREATIVE — checkout page. Needs products.js + shop.js. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var FC = window.FC;
  if (!FC) return;

  document.querySelector('.menu') && document.querySelector('.menu').addEventListener('click', function () {
    document.querySelector('.nav-links').classList.toggle('open');
  });

  var buyMode = /(^|[?&])buy=1(&|$)/.test(location.search);
  var root = document.getElementById('checkoutRoot');
  var done = false; // order confirmation showing

  function lines() {
    return (buyMode ? FC.buyNow.get() : FC.cart.items()).map(function (l) {
      return { p: FC.byId(l.id), qty: l.qty };
    });
  }
  function totalOf(ls) { return ls.reduce(function (n, l) { return n + l.p.price * l.qty; }, 0); }

  function summaryHTML(ls) {
    return '<aside class="co-summary"><h2>Order summary</h2>' +
      ls.map(function (l) {
        return '<div class="co-line"><img src="' + FC.esc(l.p.image) + '" alt="">' +
          '<div><strong>' + FC.esc(l.p.name) + '</strong><span>' + FC.esc(l.p.type) + ' &times; ' + l.qty + '</span></div>' +
          '<b>' + FC.money(l.p.price * l.qty) + '</b></div>';
      }).join('') +
      '<div class="co-total"><span>Subtotal</span><strong>' + FC.money(totalOf(ls)) + '</strong></div>' +
      '<p class="co-note">Delivery charges are confirmed with you before dispatch.</p>' +
      (buyMode && FC.cart.count() ? '<a class="link" href="checkout.html">Checkout with my full cart instead</a>' : '') +
      '</aside>';
  }

  function emptyHTML() {
    return '<div class="co-empty"><h2>Nothing to check out yet</h2>' +
      '<p>Add a piece to your cart and it will show up here.</p>' +
      '<div class="actions"><a class="btn primary" href="knives.html">Browse kitchen knives</a>' +
      '<a class="btn" href="swords.html">Browse swords</a></div></div>';
  }

  function formHTML() {
    return '<form class="form co-form" id="orderForm" novalidate>' +
      '<h2>Delivery details</h2>' +
      '<div class="form-row">' +
      field('name', 'Full name', 'text', 'name', 'name') +
      field('phone', 'Phone (WhatsApp)', 'tel', 'tel', 'tel') +
      '</div>' +
      field('email', 'Email (optional)', 'email', 'email', 'email', true) +
      field('address', 'Street address', 'text', 'street-address', 'text') +
      '<div class="form-row">' +
      field('city', 'City', 'text', 'address-level2', 'text') +
      field('postal', 'Postal code (optional)', 'text', 'postal-code', 'numeric', true) +
      '</div>' +
      '<fieldset class="pay"><legend>Payment</legend>' +
      '<label class="pay-opt"><input type="radio" name="pay" value="Cash on delivery" checked><span><b>Cash on delivery</b>Pay when your order arrives.</span></label>' +
      '<label class="pay-opt"><input type="radio" name="pay" value="Bank transfer / JazzCash / Easypaisa"><span><b>Bank transfer / JazzCash / Easypaisa</b>We will send the account details on WhatsApp.</span></label>' +
      '</fieldset>' +
      '<div class="field"><label for="notes">Notes (optional)</label><textarea id="notes" name="notes" rows="3" style="min-height:90px"></textarea></div>' +
      '<label class="check"><input type="checkbox" id="adult" required> I am 18 or older.</label>' +
      '<div class="co-error" id="coError" role="alert" hidden></div>' +
      '<button class="btn primary block" type="submit">Place order</button>' +
      '<p class="co-note">Your order is sent to us by WhatsApp or email in the next step. It is not placed until you send it.</p>' +
      '</form>';
  }
  function field(id, label, type, ac, mode, optional) {
    return '<div class="field"><label for="' + id + '">' + label + '</label>' +
      '<input id="' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + ac + '" inputmode="' + mode + '"' +
      (optional ? '' : ' required') + '></div>';
  }

  function render() {
    var ls = lines();
    if (!ls.length) { root.innerHTML = emptyHTML(); return; }
    root.innerHTML = '<div class="co-grid">' + summaryHTML(ls) + '<div>' + formHTML() + '</div></div>';
    document.getElementById('orderForm').addEventListener('submit', onSubmit);
  }

  function showError(msg, el) {
    var box = document.getElementById('coError');
    box.textContent = msg; box.hidden = false;
    if (el) el.focus();
  }

  function onSubmit(e) {
    e.preventDefault();
    var f = e.target;
    var v = function (n) { return (f.elements[n].value || '').trim(); };
    document.getElementById('coError').hidden = true;

    if (v('name').length < 2) return showError('Enter your full name.', f.elements.name);
    if (v('phone').replace(/\D/g, '').length < 10) return showError('Enter a phone number with at least 10 digits.', f.elements.phone);
    if (v('email') && !/^\S+@\S+\.\S+$/.test(v('email'))) return showError('That email address does not look right.', f.elements.email);
    if (v('address').length < 6) return showError('Enter your full street address.', f.elements.address);
    if (v('city').length < 2) return showError('Enter your city.', f.elements.city);
    if (!document.getElementById('adult').checked) return showError('Please confirm you are 18 or older.', document.getElementById('adult'));

    var ls = lines();
    if (!ls.length) return render();

    var ref = 'FC-' + Date.now().toString(36).toUpperCase().slice(-6);
    var pay = f.elements.pay.value;
    var text = [
      'New order - ' + FC.settings.storeName,
      'Ref: ' + ref,
      '',
      'Items:'
    ].concat(ls.map(function (l, i) {
      return (i + 1) + '. ' + l.p.name + ' x ' + l.qty + ' - ' + FC.money(l.p.price * l.qty);
    })).concat([
      'Subtotal: ' + FC.money(totalOf(ls)),
      '',
      'Name: ' + v('name'),
      'Phone: ' + v('phone'),
      v('email') ? 'Email: ' + v('email') : null,
      'Address: ' + v('address') + ', ' + v('city') + (v('postal') ? ' ' + v('postal') : ''),
      'Payment: ' + pay,
      v('notes') ? 'Notes: ' + v('notes') : null
    ]).filter(function (x) { return x !== null; }).join('\n');

    showConfirmation(ref, ls, text);
  }

  function showConfirmation(ref, ls, text) {
    done = true;
    var wa = 'https://wa.me/' + FC.settings.whatsapp + '?text=' + encodeURIComponent(text);
    var mail = 'mailto:' + FC.settings.email + '?subject=' + encodeURIComponent('Order ' + ref) +
      '&body=' + encodeURIComponent(text);
    root.innerHTML =
      '<div class="co-done">' +
      '<div class="eyebrow">Order ' + FC.esc(ref) + '</div>' +
      '<h2>One more step: send your order</h2>' +
      '<p>Your order is ready. Send it to us and we will confirm the price, delivery and payment with you. It is not placed until we receive it.</p>' +
      '<div class="actions">' +
      '<a class="btn primary" id="sendWa" href="' + FC.esc(wa) + '" target="_blank" rel="noopener">Send order on WhatsApp</a>' +
      '<a class="btn" id="sendMail" href="' + FC.esc(mail) + '">Send by email</a></div>' +
      '<div class="rule"></div>' +
      ls.map(function (l) {
        return '<p class="co-doneline"><span>' + FC.esc(l.p.name) + ' &times; ' + l.qty + '</span><b>' + FC.money(l.p.price * l.qty) + '</b></p>';
      }).join('') +
      '<p class="co-doneline total"><span>Subtotal</span><b>' + FC.money(totalOf(ls)) + '</b></p>' +
      '<a class="link" href="index.html">Back to the home page</a></div>';
    window.scrollTo(0, 0);
    var clearOnce = function () { buyMode ? FC.buyNow.clear() : FC.cart.clear(); };
    document.getElementById('sendWa').addEventListener('click', clearOnce);
    document.getElementById('sendMail').addEventListener('click', clearOnce);
  }

  // If the cart changes in another tab while we are still on the form
  // (only the summary is refreshed so typed form details are never lost)
  document.addEventListener('fc:cart', function () {
    if (done || buyMode) return;
    var ls = lines();
    var box = document.querySelector('.co-summary');
    if (!ls.length || !box) { render(); return; }
    box.outerHTML = summaryHTML(ls);
  });

  render();
});
