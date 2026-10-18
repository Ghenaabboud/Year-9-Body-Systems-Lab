/**
 * Body Systems Lab — results collector
 * Paste this into a Google Sheet: Extensions → Apps Script.
 * Then Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).
 *
 * Change the passcode below before deploying. Teachers type it to open the teacher panel.
 */
const TEACHER_PASSCODE = 'EISM-science';

const SHEET_NAME = 'Results';
const CLASSES = ['9A', '9B', '9C', '9D', '9E'];
const SYSTEMS = [
  ['circulatory', 'Circulatory'], ['muscular', 'Muscular'], ['digestive', 'Digestive'],
  ['skeletal', 'Skeletal'], ['nervous', 'Nervous'], ['excretory', 'Excretory'], ['respiratory', 'Respiratory']
];
const HEADERS = ['Student ID', 'Name', 'Class', 'Last active', 'Systems done', 'Systems explored',
  'Quiz best', 'Quiz last', 'Quiz attempts', 'Mistakes']
  .concat(SYSTEMS.map(s => s[1])).concat(['Data (do not edit)']);

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.hideColumns(1);
    sh.hideColumns(HEADERS.length);
  }
  return sh;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Stop spreadsheet formulas being injected through a typed name.
function safeText_(v) {
  const s = String(v == null ? '' : v).slice(0, 60);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function num_(v) { const n = Number(v); return isFinite(n) ? n : ''; }

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'Bad data' }); }
  if (!/^s[a-z0-9]{6,24}$/.test(String(d.id || '')) || CLASSES.indexOf(d.cls) < 0 || !String(d.name || '').trim()) {
    return out_({ ok: false, error: 'Missing name or class' });
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getSheet_();
    const last = sh.getLastRow();
    const ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(r => r[0]) : [];
    const idx = ids.indexOf(d.id);
    const row = idx < 0 ? last + 1 : idx + 2;
    const sys = d.systems || {};
    const cells = SYSTEMS.map(([k]) => {
      const s = sys[k];
      if (!s || !s.started) return '';
      if (s.done) return 'Done';
      return [s.named ? 'name ✓' : 'name ✗', 'organs ' + num_(s.found) + '/' + num_(s.need), s.fn ? 'function ✓' : 'function ✗'].join(', ');
    });
    const q = d.quiz || {};
    const values = [d.id, safeText_(d.name), d.cls, new Date(), num_(d.done), num_(d.viewed),
      q.best == null ? '' : num_(q.best), q.last == null ? '' : num_(q.last), num_(q.attempts), num_(d.mistakes)]
      .concat(cells).concat([JSON.stringify(d).slice(0, 45000)]);
    sh.getRange(row, 1, 1, values.length).setValues([values]);
  } finally {
    lock.releaseLock();
  }
  return out_({ ok: true });
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.ping) return out_({ ok: true, ping: true });
  if (String(p.key || '') !== TEACHER_PASSCODE) return out_({ ok: false, error: 'Wrong passcode' });
  const sh = getSheet_();
  const n = sh.getLastRow() - 1;
  if (n < 1) return out_({ ok: true, rows: [] });
  const data = sh.getRange(2, 1, n, HEADERS.length).getValues();
  const rows = data.map(r => {
    let d = {};
    try { d = JSON.parse(r[HEADERS.length - 1]); } catch (err) {}
    d.id = r[0];
    d.name = String(r[1]).replace(/^'/, '');
    d.cls = r[2];
    d.updated = r[3] instanceof Date ? r[3].toISOString() : '';
    return d;
  });
  return out_({ ok: true, rows: rows });
}
