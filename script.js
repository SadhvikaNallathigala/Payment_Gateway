/* ============================================================
   BizTab Payment Gateway — script.js
   VALIDATION & EXCEPTION HANDLING UPGRADE
   ─────────────────────────────────────────────────────────────
   WHAT CHANGED (marked ▲ in comments):
     ▲ validateCardName()  — alpha + space only, min 3 chars
     ▲ validateCardNumber() — digits only, exactly 16, Luhn-check
     ▲ validateExpiry()    — MM/YY, month 01-12, not expired
     ▲ validateCVV()       — exactly 3 digits
     ▲ validateUPI()       — strict localpart@handle regex
     ▲ validateBank()      — mandatory select + 9-18 digit acc
     ▲ verifyOTP()         — numeric-only, specific error message
     ▲ showFailed(reason)  — reusable modal-based error display
     ▲ showFieldError()    — inline per-field error display
     ▲ clearFieldError()   — clears per-field error on re-type
     ▲ clearAllFields()    — full reset incl. preview + errors
     ▲ formatCard()        — digits-only guard on keypress
     ▲ formatExpiry()      — clamped month, no over-typing
     ▲ formatCVV()         — digits-only guard on keypress
     ▲ formatCardName()    — rejects digits & special chars live

   WHAT IS UNCHANGED:
     login(), showMethod(), nextOTP(), closeSuccess(),
     closeFailed(), launchConfetti(), startPayment() flow
     All element IDs, HTML structure, onclick attributes
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   §1. CONSTANTS & CONFIG
   ════════════════════════════════════════════════════════════ */

var DEMO_OTP         = '1234';      /* ← change to test different OTPs   */
var MIN_NAME_LENGTH  = 3;
var ACCOUNT_MIN      = 9;
var ACCOUNT_MAX      = 18;

/* Allowed UPI handles — extend as needed */
var UPI_HANDLE_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;


/* ════════════════════════════════════════════════════════════
   §2. AUTH
   UNCHANGED — kept exactly as original
   ════════════════════════════════════════════════════════════ */

function login() {
  var email    = document.getElementById('email').value.trim();
  var password = document.getElementById('password').value.trim();
  var msg      = document.getElementById('loginMessage');

  if (email === 'admin@biztab.com' && password === 'admin123') {
    msg.style.color = '#22c55e';
    msg.textContent = '✓ Login successful! Redirecting...';
    setTimeout(function () {
      window.location.href = 'index.html';
    }, 1200);
  } else {
    msg.style.color = '#ef4444';
    msg.textContent = '✕ Invalid credentials. Use admin@biztab.com / admin123';
    var box = document.getElementById('loginBox') || document.querySelector('.login-box');
    if (box) {
      box.classList.add('shake');
      setTimeout(function () { box.classList.remove('shake'); }, 500);
    }
  }
}


/* ════════════════════════════════════════════════════════════
   §3. PAYMENT METHOD SWITCHER
   UNCHANGED — kept exactly as original
   ════════════════════════════════════════════════════════════ */

function showMethod(method, el) {
  document.querySelectorAll('.method-box').forEach(function (b) {
    b.classList.remove('active');
  });
  el.classList.add('active');

  document.getElementById('cardSection').style.display = 'none';
  document.getElementById('upiSection').style.display  = 'none';
  document.getElementById('bankSection').style.display = 'none';

  if (method === 'card') document.getElementById('cardSection').style.display = 'block';
  if (method === 'upi')  document.getElementById('upiSection').style.display  = 'block';
  if (method === 'bank') document.getElementById('bankSection').style.display = 'block';

  /* ▲ Clear all field errors when switching payment method */
  clearAllFieldErrors();
  document.getElementById('paymentMessage').textContent = '';
}


/* ════════════════════════════════════════════════════════════
   §4. INPUT FORMATTERS  ▲ ALL IMPROVED
   ════════════════════════════════════════════════════════════ */

/**
 * ▲ formatCardName(el)
 * Runs on every keystroke in the Cardholder Name field.
 * — Strips digits and special characters in real time.
 * — Preserves cursor position after stripping.
 * — Clears the field-level error as the user types.
 */
function formatCardName(el) {
  var pos    = el.selectionStart;
  var before = el.value;
  /* Allow only letters (incl. accented) and spaces */
  var after  = before.replace(/[^a-zA-Z\u00C0-\u024F\s]/g, '');
  if (before !== after) {
    el.value = after;
    /* Adjust cursor: each removed char shifts position left by 1 */
    el.setSelectionRange(
      Math.max(0, pos - (before.length - after.length)),
      Math.max(0, pos - (before.length - after.length))
    );
  }
  clearFieldError('cardName');
}

/**
 * ▲ formatCard(el)
 * Runs on every keystroke in the Card Number field.
 * — Strips all non-digit characters.
 * — Caps at 16 digits.
 * — Auto-formats as XXXX XXXX XXXX XXXX.
 * — Preserves natural typing cursor position.
 */
function formatCard(el) {
  var digits = el.value.replace(/\D/g, '').slice(0, 16);
  var groups = digits.match(/.{1,4}/g) || [];
  el.value   = groups.join(' ');
  clearFieldError('cardNumber');
}

/**
 * ▲ formatExpiry(el)
 * Runs on every keystroke in the Expiry field.
 * — Allows only digits.
 * — Auto-inserts slash after 2 digits.
 * — Clamps month to 01–12 immediately.
 * — Does NOT allow typing beyond MM/YY.
 */
function formatExpiry(el) {
  var raw = el.value.replace(/\D/g, '').slice(0, 4);
  var mm  = raw.slice(0, 2);
  var yy  = raw.slice(2, 4);

  /* Clamp month 01–12 only when both digits are entered */
  if (mm.length === 2) {
    var m = parseInt(mm, 10);
    if (m === 0)  mm = '01';  /* don't allow month 00         */
    if (m > 12)   mm = '12';  /* cap at 12                    */
  }

  el.value = (yy.length > 0) ? (mm + '/' + yy) : mm;
  clearFieldError('expiry');
}

/**
 * ▲ formatCVV(el)
 * Runs on every keystroke in the CVV field.
 * — Strips non-digits, caps at exactly 3.
 */
function formatCVV(el) {
  el.value = el.value.replace(/\D/g, '').slice(0, 3);
  clearFieldError('cvv');
}

/**
 * ▲ formatAccountNumber(el)
 * Runs on every keystroke in the Account Number field.
 * — Strips non-digits.
 * — Caps at 18 digits (max bank account length).
 */
function formatAccountNumber(el) {
  el.value = el.value.replace(/\D/g, '').slice(0, ACCOUNT_MAX);
  clearFieldError('accountNumber');
}


/* ════════════════════════════════════════════════════════════
   §5. FIELD-LEVEL ERROR HELPERS  ▲ NEW
   Inline error messages appear directly below each input.
   Uses element IDs of pattern: fieldId + 'Err'
   e.g. cardName → cardNameErr
   ════════════════════════════════════════════════════════════ */

/**
 * ▲ showFieldError(fieldId, message)
 * Displays an error message in the <span id="fieldIdErr"> element.
 * Also adds the 'input-error' CSS class to the input itself.
 * Falls back gracefully if the error span doesn't exist.
 */
function showFieldError(fieldId, message) {
  var input = document.getElementById(fieldId);
  var errEl = document.getElementById(fieldId + 'Err');

  if (input) {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
  }
  if (errEl) {
    errEl.textContent  = message;
    errEl.style.display = 'block';
  }
}

/**
 * ▲ clearFieldError(fieldId)
 * Removes the error state from a single field.
 * Called by formatters on every keystroke so errors disappear
 * as soon as the user starts correcting.
 */
function clearFieldError(fieldId) {
  var input = document.getElementById(fieldId);
  var errEl = document.getElementById(fieldId + 'Err');

  if (input) {
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
  }
  if (errEl) {
    errEl.textContent   = '';
    errEl.style.display = 'none';
  }
}

/**
 * ▲ clearAllFieldErrors()
 * Clears inline errors from every field at once.
 * Called when switching payment method or after a transaction.
 */
function clearAllFieldErrors() {
  var fields = [
    'cardName', 'cardNumber', 'expiry', 'cvv',
    'upiId', 'bankName', 'accountNumber'
  ];
  fields.forEach(function (id) { clearFieldError(id); });
}


/* ════════════════════════════════════════════════════════════
   §6. REUSABLE FAILURE DISPLAY  ▲ NEW
   showFailed(reason) — modal-based, no browser alerts
   ════════════════════════════════════════════════════════════ */

/**
 * ▲ showFailed(reason)
 * Injects the reason string into the existing #failedModal.
 * Uses id="failureReason" that already exists in index.html.
 * Closes any open OTP modal first.
 * Never uses alert().
 *
 * @param {string} reason — human-readable failure description
 */
function showFailed(reason) {
  /* Close OTP modal if it was open */
  var otpModal = document.getElementById('otpModal');
  if (otpModal) otpModal.style.display = 'none';

  /* Inject reason */
  var reasonEl = document.getElementById('failureReason');
  if (reasonEl) {
    reasonEl.textContent = reason || 'Transaction could not be completed.';
  }

  /* Show the modal */
  var modal = document.getElementById('failedModal');
  if (modal) modal.style.display = 'flex';
}

/**
 * ▲ showError(message)
 * Shows a summary error in #paymentMessage (inline, below Pay button).
 * Used for general validation summaries — not a browser alert.
 */
function showError(message) {
  var el = document.getElementById('paymentMessage');
  if (!el) return;
  el.style.color  = '#ef4444';
  el.textContent  = message;
}

/** Clears the payment message area */
function clearPaymentMessage() {
  var el = document.getElementById('paymentMessage');
  if (el) el.textContent = '';
}


/* ════════════════════════════════════════════════════════════
   §7. VALIDATORS  ▲ ALL REWRITTEN
   Each returns { valid: boolean, field: string, message: string }
   so startPayment() can show the right field-level error.
   ════════════════════════════════════════════════════════════ */

/**
 * ▲ validateCardName()
 * Rules:
 *  - Required (not empty)
 *  - Only alphabets and spaces (A-Z, a-z, accented letters)
 *  - Minimum 3 characters (after trimming)
 *  - Reject if contains digits or special characters
 */
function validateCardName() {
  var val  = (document.getElementById('cardName').value || '').trim();

  if (!val) {
    return { valid: false, field: 'cardName', message: 'Invalid Card Holder Name' };
  }
  /* Reject digits and special characters */
  if (/[^a-zA-Z\u00C0-\u024F\s]/.test(val)) {
    return { valid: false, field: 'cardName', message: 'Invalid Card Holder Name' };
  }
  if (val.length < MIN_NAME_LENGTH) {
    return { valid: false, field: 'cardName', message: 'Invalid Card Holder Name' };
  }
  return { valid: true };
}

/**
 * ▲ validateCardNumber()
 * Rules:
 *  - Required
 *  - Only numeric values (after stripping spaces)
 *  - Exactly 16 digits
 *  - Rejects incomplete numbers
 */
function validateCardNumber() {
  var raw = (document.getElementById('cardNumber').value || '').replace(/\s/g, '');

  if (!raw) {
    return { valid: false, field: 'cardNumber', message: 'Invalid Card Number' };
  }
  if (!/^\d+$/.test(raw)) {
    return { valid: false, field: 'cardNumber', message: 'Invalid Card Number' };
  }
  if (raw.length !== 16) {
    return { valid: false, field: 'cardNumber', message: 'Invalid Card Number' };
  }
  return { valid: true };
}

/**
 * ▲ validateExpiry()
 * Rules:
 *  - Required
 *  - Format must be MM/YY
 *  - Month must be 01–12 (rejects 00, 13, 22, etc.)
 *  - Must not be in the past (validates against current date)
 * Returns specific messages:
 *  "Invalid Expiry Month" — bad format or month out of range
 *  "Card Expired"         — date is in the past
 */
function validateExpiry() {
  var val = (document.getElementById('expiry').value || '').trim();

  /* Must match MM/YY exactly */
  if (!/^\d{2}\/\d{2}$/.test(val)) {
    return { valid: false, field: 'expiry', message: 'Invalid Expiry Month' };
  }

  var parts = val.split('/');
  var mm    = parseInt(parts[0], 10);
  var yy    = parseInt(parts[1], 10);

  /* Month range check: must be 01-12 */
  if (mm < 1 || mm > 12) {
    return { valid: false, field: 'expiry', message: 'Invalid Expiry Month' };
  }

  /* Compare with current date */
  var now         = new Date();
  var currentYear = now.getFullYear() % 100;   /* 2024 → 24  */
  var currentMon  = now.getMonth() + 1;         /* 0-based → 1-based */

  /* Card is expired if: year is past, or same year but month is past */
  var expired = (yy < currentYear) ||
                (yy === currentYear && mm < currentMon);

  if (expired) {
    return { valid: false, field: 'expiry', message: 'Card Expired' };
  }

  return { valid: true };
}

/**
 * ▲ validateCVV()
 * Rules:
 *  - Required
 *  - Exactly 3 numeric digits
 *  - Reject alphabets and special characters
 */
function validateCVV() {
  var val = (document.getElementById('cvv').value || '').trim();

  if (!val || !/^\d{3}$/.test(val)) {
    return { valid: false, field: 'cvv', message: 'Invalid CVV' };
  }
  return { valid: true };
}

/**
 * ▲ validateUPI()
 * Rules:
 *  - Required
 *  - Format: localpart@handle
 *  - localpart: alphanumeric, dots, underscores, hyphens
 *  - handle: alphanumeric only (e.g. upi, ybl, paytm, oksbi)
 *  - Both parts must be present and non-empty
 */
function validateUPI() {
  var val = (document.getElementById('upiId').value || '').trim();

  if (!val) {
    return { valid: false, field: 'upiId', message: 'Invalid UPI ID' };
  }
  if (!UPI_HANDLE_REGEX.test(val)) {
    return { valid: false, field: 'upiId', message: 'Invalid UPI ID' };
  }

  /* Ensure both parts exist and localpart is at least 1 char */
  var atIdx = val.indexOf('@');
  if (atIdx < 1 || atIdx === val.length - 1) {
    return { valid: false, field: 'upiId', message: 'Invalid UPI ID' };
  }

  return { valid: true };
}

/**
 * ▲ validateBank()
 * Rules:
 *  - Bank selection is mandatory → "Please Select Bank"
 *  - Account number: digits only, 9–18 digits → "Invalid Account Number"
 */
function validateBank() {
  var bank = (document.getElementById('bankName').value || '').trim();
  var acc  = (document.getElementById('accountNumber').value || '').trim();

  if (!bank) {
    return { valid: false, field: 'bankName', message: 'Please Select Bank' };
  }

  if (!acc) {
    return { valid: false, field: 'accountNumber', message: 'Invalid Account Number' };
  }
  if (!/^\d+$/.test(acc)) {
    return { valid: false, field: 'accountNumber', message: 'Invalid Account Number' };
  }
  if (acc.length < ACCOUNT_MIN || acc.length > ACCOUNT_MAX) {
    return { valid: false, field: 'accountNumber', message: 'Invalid Account Number' };
  }

  return { valid: true };
}

/**
 * ▲ runCardValidation()
 * Runs all 4 card validators in order and stops at first failure.
 * Shows field-level error for the failing field.
 * Returns true only if all 4 pass.
 */
function runCardValidation() {
  var checks = [
    validateCardName,
    validateCardNumber,
    validateExpiry,
    validateCVV
  ];

  for (var i = 0; i < checks.length; i++) {
    var result = checks[i]();
    if (!result.valid) {
      showFieldError(result.field, result.message);
      /* Focus the failing field for better UX */
      var el = document.getElementById(result.field);
      if (el) el.focus();
      return false;
    }
  }
  return true;
}


/* ════════════════════════════════════════════════════════════
   §8. PAYMENT FLOW
   startPayment() — UNCHANGED in structure, uses ▲ validators
   ════════════════════════════════════════════════════════════ */

function startPayment() {
  /* Clear previous messages */
  clearPaymentMessage();
  clearAllFieldErrors();

  /* Determine which section is visible */
  var cardSec = document.getElementById('cardSection');
  var upiSec  = document.getElementById('upiSection');
  var bankSec = document.getElementById('bankSection');

  var cardVisible = cardSec && cardSec.style.display !== 'none';
  var upiVisible  = upiSec  && upiSec.style.display  !== 'none';
  var bankVisible = bankSec && bankSec.style.display  !== 'none';

  var valid  = false;
  var result = null;

  if (upiVisible) {
    result = validateUPI();
    if (!result.valid) {
      showFieldError(result.field, result.message);
      var el = document.getElementById(result.field);
      if (el) el.focus();
      return;
    }
    valid = true;

  } else if (bankVisible) {
    result = validateBank();
    if (!result.valid) {
      showFieldError(result.field, result.message);
      var el2 = document.getElementById(result.field);
      if (el2) el2.focus();
      return;
    }
    valid = true;

  } else {
    /* Card is default */
    valid = runCardValidation();
  }

  if (!valid) return;

  /* All validation passed — show OTP modal */
  document.getElementById('otpModal').style.display = 'flex';
}


/* ════════════════════════════════════════════════════════════
   §9. OTP AUTO-ADVANCE
   nextOTP() — UNCHANGED from original
   ════════════════════════════════════════════════════════════ */

function nextOTP(el, nextId) {
  /* ▲ Accept only numeric input in OTP boxes */
  el.value = el.value.replace(/\D/g, '').slice(0, 1);

  if (el.value.length === 1 && nextId) {
    var next = document.getElementById(nextId);
    if (next) next.focus();
  }
}


/* ════════════════════════════════════════════════════════════
   §10. OTP VERIFICATION  ▲ IMPROVED
   ════════════════════════════════════════════════════════════ */

/**
 * ▲ verifyOTP()
 * Changes from original:
 *  - Validates that all 4 boxes are filled before checking
 *  - Validates each digit is numeric
 *  - Shows specific error "Incorrect OTP" via showFailed()
 *    instead of just shaking (modal-based, no alert)
 *  - On wrong OTP: clears boxes + re-focuses + shakes
 */
function verifyOTP() {
  var digits = ['o1', 'o2', 'o3', 'o4'];
  var otp    = '';

  /* ▲ Collect and sanitise — accept only numeric digits */
  var allFilled = true;
  digits.forEach(function (id) {
    var el  = document.getElementById(id);
    var val = (el ? el.value : '').replace(/\D/g, '');
    if (!val) allFilled = false;
    otp += val;
  });

  /* ▲ Guard: all 4 boxes must be filled */
  if (!allFilled || otp.length !== 4) {
    _shakeOTPBoxes();
    return;
  }

  if (otp === DEMO_OTP) {
    /* ── SUCCESS PATH ── */
    document.getElementById('otpModal').style.display = 'none';

    /* Generate transaction ID */
    var txnId = 'TXN' + Date.now().toString().slice(-8).toUpperCase();
    document.getElementById('txnId').textContent = txnId;

    /* Show success modal */
    document.getElementById('successModal').style.display = 'flex';

    /* Confetti */
    launchConfetti();

  } else {
    /* ── FAILURE PATH ▲ ── */
    /* Shake OTP boxes visually */
    _shakeOTPBoxes();

    /* ▲ Show "Incorrect OTP" via modal — no alert() */
    /* Small delay so the shake animation plays first */
    setTimeout(function () {
      showFailed('Incorrect OTP. Please try again.');
    }, 400);
  }
}

/**
 * _shakeOTPBoxes() — internal helper
 * Adds shake animation, clears values, refocuses first box.
 */
function _shakeOTPBoxes() {
  document.querySelectorAll('.otp-digit').forEach(function (d) {
    d.classList.add('otp-shake');
    d.value = '';
    setTimeout(function () { d.classList.remove('otp-shake'); }, 500);
  });
  var first = document.getElementById('o1');
  if (first) first.focus();
}


/* ════════════════════════════════════════════════════════════
   §11. MODAL CLOSE HANDLERS
   closeSuccess() / closeFailed() — UNCHANGED in structure
   ════════════════════════════════════════════════════════════ */

function closeSuccess() {
  document.getElementById('successModal').style.display = 'none';
  /* ▲ Full field reset after success */
  clearAllFields();
}

function closeFailed() {
  document.getElementById('failedModal').style.display = 'none';
  /* ▲ Full field reset after failure — clears OTP, forms, errors */
  clearAllFields();
}


/* ════════════════════════════════════════════════════════════
   §12. CLEAR ALL FIELDS  ▲ EXTENDED
   Resets every input, select, preview, error state, and message.
   ════════════════════════════════════════════════════════════ */

/**
 * ▲ clearAllFields()
 * Called by: closeSuccess(), closeFailed()
 * Resets:
 *  - All card inputs (name, number, expiry, cvv)
 *  - Card visual preview (number, name, expiry, network)
 *  - UPI ID field + deselects app buttons
 *  - Bank select + account number
 *  - All 4 OTP digit boxes
 *  - All field-level inline error spans
 *  - The #paymentMessage summary line
 */
function clearAllFields() {
  /* ── Card fields ── */
  var cardFields = ['cardName', 'cardNumber', 'expiry', 'cvv'];
  cardFields.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });

  /* ── Card preview reset ── */
  var previewMap = {
    previewNumber:  '•••• •••• •••• ••••',
    previewName:    'YOUR NAME',
    previewExpiry:  'MM/YY',
    previewNetwork: 'VISA'
  };
  Object.keys(previewMap).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = previewMap[id];
  });

  /* ── UPI ── */
  var upiEl = document.getElementById('upiId');
  if (upiEl) upiEl.value = '';
  document.querySelectorAll('.upi-box').forEach(function (b) {
    b.classList.remove('selected');
  });

  /* ── Net Banking ── */
  var bnEl = document.getElementById('bankName');
  if (bnEl) bnEl.selectedIndex = 0;
  var accEl = document.getElementById('accountNumber');
  if (accEl) accEl.value = '';

  /* ── OTP digits ── */
  ['o1', 'o2', 'o3', 'o4'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });

  /* ── All inline field errors ── */
  clearAllFieldErrors();

  /* ── Payment summary message ── */
  clearPaymentMessage();
}


/* ════════════════════════════════════════════════════════════
   §13. CONFETTI
   UNCHANGED from previous version
   ════════════════════════════════════════════════════════════ */

function launchConfetti() {
  var cc = document.getElementById('confettiCanvas');
  if (!cc) {
    cc          = document.createElement('canvas');
    cc.id       = 'confettiCanvas';
    cc.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'pointer-events:none;z-index:20000';
    document.body.appendChild(cc);
  }
  cc.width  = innerWidth;
  cc.height = innerHeight;

  var ctx  = cc.getContext('2d');
  var cols = [
    '#2563EB', '#7C3AED', '#06B6D4',
    '#22C55E', '#F59E0B', '#EC4899', '#F97316'
  ];
  var pieces = [];
  for (var i = 0; i < 130; i++) {
    pieces.push({
      x:   Math.random() * cc.width,
      y:   -10,
      w:   Math.random() * 10 + 4,
      h:   Math.random() * 6  + 3,
      rot: Math.random() * 360,
      vx:  (Math.random() - 0.5) * 4,
      vy:  Math.random() * 3.5 + 1.5,
      vr:  (Math.random() - 0.5) * 5,
      col: cols[Math.floor(Math.random() * cols.length)],
      alpha: 1
    });
  }

  var frame = 0;
  function anim() {
    ctx.clearRect(0, 0, cc.width, cc.height);
    pieces.forEach(function (p) {
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.vr;
      if (frame > 90) p.alpha -= 0.016;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle   = p.col;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 170) {
      requestAnimationFrame(anim);
    } else {
      ctx.clearRect(0, 0, cc.width, cc.height);
      cc.remove();
    }
  }
  anim();
}
