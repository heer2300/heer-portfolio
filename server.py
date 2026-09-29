#!/usr/bin/env python3
"""Heer Patel portfolio server. Pure Python 3.8+ standard library, no installs needed.
Run:  python server.py   (optional: python server.py 9000)"""
import json, os, sys, re, hashlib, hmac, secrets, base64, mimetypes, time, getpass, smtplib, ssl, html, zipfile, io
from email.mime.text import MIMEText
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

BASE = os.path.dirname(os.path.abspath(__file__))
# DATA_DIR lets a host (e.g. Render's persistent Disk) keep content/uploads outside the code folder.
DATA_DIR = os.environ.get('DATA_DIR', BASE)
STATIC = os.path.join(BASE, 'static')
UP = os.path.join(DATA_DIR, 'uploads')
DATA, CONF = os.path.join(DATA_DIR, 'data', 'site.json'), os.path.join(DATA_DIR, 'config.json')
SMTPCONF = os.path.join(DATA_DIR, 'data', 'smtp.json')
os.makedirs(UP, exist_ok=True)
os.makedirs(os.path.dirname(DATA), exist_ok=True)
if not os.path.exists(DATA):
    default_data = os.path.join(BASE, 'data', 'site.json')
    if os.path.exists(default_data):
        import shutil; shutil.copy(default_data, DATA)
TOKENS, FAILS, CONTACT_HITS = {}, {}, {}
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
MAXBODY = 12 * 1024 * 1024

def hash_pw(pw, salt=None):
    salt = salt or secrets.token_hex(16)
    return salt, hashlib.pbkdf2_hmac('sha256', pw.encode(), bytes.fromhex(salt), 200000).hex()

def save_pw(pw):
    s, h = hash_pw(pw)
    with open(CONF, 'w') as f: json.dump({'salt': s, 'hash': h}, f)

def check_pw(pw):
    try:
        c = json.load(open(CONF))
        return hmac.compare_digest(hash_pw(pw, c['salt'])[1], c['hash'])
    except Exception:
        return False

def first_run():
    if os.path.exists(CONF): return
    pw = os.environ.get('PORTFOLIO_PASSWORD')
    if not pw and sys.stdin.isatty():
        print('First run: choose an ADMIN PASSWORD for your portfolio (min 6 chars).')
        while True:
            a, b = getpass.getpass('Password: '), getpass.getpass('Repeat:   ')
            if len(a) >= 6 and a == b: pw = a; break
            print('Too short or not matching, try again.')
    if not pw:
        pw = secrets.token_urlsafe(9)
        print('Generated admin password (save it!):', pw)
    save_pw(pw)

def url_ok(u):
    return u if isinstance(u, str) and re.match(r'^(https?://|mailto:|tel:)', u, re.I) and len(u) < 500 else ''
def img_ok(u):
    return u if isinstance(u, str) and re.match(r'^/uploads/[a-f0-9]{16}\.(jpg|png|webp)$', u) else ''
def music_ok(u):
    return u if isinstance(u, str) and re.match(r'^/uploads/[a-f0-9]{16}\.(mp3|ogg|wav|m4a)$', u) else ''
def resume_ok(u):
    return u if isinstance(u, str) and re.match(r'^/uploads/[a-f0-9]{16}\.(pdf|docx)$', u) else ''
def resume_ext(b):
    if b[:4] == b'%PDF': return '.pdf'
    if b[:4] == b'PK\x03\x04' and b'word/' in b: return '.docx'
    return ''
def audio_ext(b):
    if b[:3] == b'ID3' or (len(b) > 1 and b[0] == 0xFF and b[1] & 0xE0 == 0xE0): return '.mp3'
    if b[:4] == b'OggS': return '.ogg'
    if b[:4] == b'RIFF' and b[8:12] == b'WAVE': return '.wav'
    if b[4:8] == b'ftyp': return '.m4a'
    return ''
AUDIO_TYPES = {'.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.m4a': 'audio/mp4'}
MAXAUDIO = 25 * 1024 * 1024
def txt(s, n): return str(s or '')[:n]

def clean(d):
    out = {'name': txt(d.get('name'), 60), 'tag': txt(d.get('tag'), 160), 'email': txt(d.get('email'), 120),
           'hero': img_ok(d.get('hero')), 'music': music_ok(d.get('music')), 'musicName': txt(d.get('musicName'), 80), 'about': txt(d.get('about'), 1500), 'h2t': txt(d.get('h2t'), 60), 'h2s': txt(d.get('h2s'), 120), 'h2i': img_ok(d.get('h2i')),
           'resume': resume_ok(d.get('resume')), 'resumeName': txt(d.get('resumeName'), 80),
           'timeline': [{'t': txt(x.get('t'), 80), 'm': txt(x.get('m'), 100)} for x in (d.get('timeline') or [])[:20]],
           'skills': [{'g': txt(x.get('g'), 50), 'items': [txt(i, 80) for i in (x.get('items') or [])[:40]]} for x in (d.get('skills') or [])[:20]],
           'certs': [{'t': txt(x.get('t'), 80), 'by': txt(x.get('by'), 60), 'y': txt(x.get('y'), 12), 'img': img_ok(x.get('img')), 'u': url_ok(x.get('u')) if x.get('u') else ''} for x in (d.get('certs') or [])[:40]],
           'socials': [], 'cats': []}
    for s in (d.get('socials') or [])[:12]:
        out['socials'].append({'l': txt(s.get('l'), 30), 'u': url_ok(s.get('u')) if s.get('u') else ''})
    for c in (d.get('cats') or [])[:20]:
        out['cats'].append({'id': re.sub(r'[^a-z0-9]', '', txt(c.get('id'), 20).lower()) or secrets.token_hex(3),
            't': txt(c.get('t'), 40), 'i': txt(c.get('i'), 4), 'cover': img_ok(c.get('cover')),
            'p': [{'t': txt(p.get('t'), 80), 'd': txt(p.get('d'), 400), 'img': img_ok(p.get('img')), 'u': url_ok(p.get('u')) if p.get('u') else ''}
                  for p in (c.get('p') or [])[:60]]})
    return out

def load_smtp():
    try: return json.load(open(SMTPCONF, encoding='utf-8'))
    except Exception: return {'email': '', 'app_password': ''}

def send_contact_mail(name, email, message):
    cfg = load_smtp()
    if not cfg.get('email') or not cfg.get('app_password'):
        return False, 'Contact form is not set up yet, sorry — please use the email link instead.'
    site = json.load(open(DATA, encoding='utf-8')) if os.path.exists(DATA) else {}
    to_addr = site.get('email') or cfg['email']
    body = f"New message from your portfolio site.\n\nName: {name}\nEmail: {email}\n\n{message}"
    msg = MIMEText(body, _charset='utf-8')
    msg['Subject'] = f"Portfolio message from {name}"[:180]
    msg['From'] = cfg['email']
    msg['To'] = to_addr
    if EMAIL_RE.match(email): msg['Reply-To'] = email
    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=ctx, timeout=15) as s:
            s.login(cfg['email'], cfg['app_password'])
            s.send_message(msg)
        return True, ''
    except Exception as e:
        return False, 'Could not send right now (' + type(e).__name__ + '). Please use the email link instead.'

def render_resume():
    try: d = json.load(open(DATA, encoding='utf-8'))
    except Exception: d = {}
    e = html.escape
    tl = ''.join(f'<div class="row"><b>{e(x.get("t",""))}</b><span>{e(x.get("m",""))}</span></div>' for x in d.get('timeline', []))
    sk = ''.join(f'<div class="grp"><h3>{e(g.get("g",""))}</h3><p>{e(", ".join(g.get("items", [])))}</p></div>' for g in d.get('skills', []))
    soc = ' \u00b7 '.join(e(s.get('l','')) + ': ' + e(s.get('u','')) for s in d.get('socials', []) if s.get('u'))
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(d.get('name','Resume'))} \u2014 Resume</title>
<style>
body{{font:16px/1.55 Georgia,'Times New Roman',serif;max-width:760px;margin:40px auto;padding:0 24px;color:#161616}}
h1{{font-size:2rem;margin:0}}.tag{{color:#555;margin:4px 0 18px}}
h2{{font-size:1.1rem;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid #161616;padding-bottom:4px;margin:28px 0 10px}}
.row{{display:flex;justify-content:space-between;gap:12px;margin-bottom:8px}}.row span{{color:#555;white-space:nowrap}}
.grp{{margin-bottom:10px}}.grp h3{{margin:0 0 2px;font-size:.95rem}}.grp p{{margin:0;color:#333}}
.meta{{color:#555;font-size:.9rem;margin-bottom:14px}}
.bar{{display:flex;gap:14px;flex-wrap:wrap;margin:14px 0}}
button{{font:14px sans-serif;padding:8px 16px;border:2px solid #161616;background:#eee;cursor:pointer}}
@media print{{.noprint{{display:none}}body{{margin:0;padding:0 8px}}}}
</style></head><body>
<div class="noprint bar"><button onclick="window.print()">Print / Save as PDF</button><a href="/">\u2190 Back to site</a></div>
<h1>{e(d.get('name',''))}</h1><p class="tag">{e(d.get('tag',''))}</p>
<p class="meta">{e(d.get('email',''))}{(' \u00b7 ' + soc) if soc else ''}</p>
<h2>About</h2><p>{e(d.get('about',''))}</p>
<h2>Experience &amp; Education</h2>{tl or '<p>\u2014</p>'}
<h2>Skills</h2>{sk or '<p>\u2014</p>'}
</body></html>"""

def write_json(path, obj):
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f: json.dump(obj, f, indent=1, ensure_ascii=False)
    os.replace(tmp, path)

class H(BaseHTTPRequestHandler):
    server_version = 'Portfolio'
    def log_message(self, *a): pass
    def send(self, code, body=b'', ctype='application/json', extra=None):
        if isinstance(body, (dict, list)): body = json.dumps(body).encode()
        self.send_response(code)
        self.send_header('Content-Type', ctype); self.send_header('Content-Length', str(len(body)))
        self.send_header('X-Content-Type-Options', 'nosniff'); self.send_header('Cache-Control', 'no-cache')
        for k, v in (extra or {}).items(): self.send_header(k, v)
        try:
            self.end_headers(); self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError): pass
    def authed(self):
        t = self.headers.get('Authorization', '')[7:]
        return TOKENS.get(t, 0) > time.time()
    def raw_upload(self, maxn, detect, msg):
        if not self.authed(): return self.send(401, {'error': 'login required'})
        n = int(self.headers.get('Content-Length') or 0)
        if n < 12 or n > maxn: return self.send(400, {'error': 'File empty or too large (max %d MB)' % (maxn >> 20)})
        raw = self.rfile.read(n); ext = detect(raw)
        if not ext: return self.send(400, {'error': msg})
        name = secrets.token_hex(8) + ext
        open(os.path.join(UP, name), 'wb').write(raw)
        return self.send(200, {'url': '/uploads/' + name})
    def body(self):
        n = int(self.headers.get('Content-Length') or 0)
        if n > MAXBODY: return None
        try: return json.loads(self.rfile.read(n) or b'{}')
        except Exception: return None
    def do_GET(self):
        p = self.path.split('?')[0]
        if p == '/resume':
            return self.send(200, render_resume().encode('utf-8'), 'text/html')
        if p == '/api/smtp':
            if not self.authed(): return self.send(401, {'error': 'login required'})
            cfg = load_smtp(); return self.send(200, {'email': cfg.get('email', ''), 'has_password': bool(cfg.get('app_password'))})
        if p == '/api/data':
            try: return self.send(200, json.load(open(DATA, encoding='utf-8')))
            except Exception: return self.send(500, {'error': 'no data'})
        root, rel = (UP, p[9:]) if p.startswith('/uploads/') else (STATIC, 'index.html' if p == '/' else p.lstrip('/'))
        f = os.path.realpath(os.path.join(root, rel))
        if not f.startswith(os.path.realpath(root) + os.sep) or not os.path.isfile(f): return self.send(404, b'Not found', 'text/plain')
        data = open(f, 'rb').read()
        ctype = AUDIO_TYPES.get(os.path.splitext(f)[1].lower()) or mimetypes.guess_type(f)[0] or 'application/octet-stream'
        size, m = len(data), re.match(r'bytes=(\d*)-(\d*)$', self.headers.get('Range') or '')
        if m and (m.group(1) or m.group(2)):
            if m.group(1): a, b = int(m.group(1)), (int(m.group(2)) if m.group(2) else size - 1)
            else: a, b = max(0, size - int(m.group(2))), size - 1
            b = min(b, size - 1)
            if a > b: return self.send(416, b'', ctype, {'Content-Range': 'bytes */%d' % size})
            return self.send(206, data[a:b + 1], ctype, {'Content-Range': 'bytes %d-%d/%d' % (a, b, size), 'Accept-Ranges': 'bytes'})
        self.send(200, data, ctype, {'Accept-Ranges': 'bytes'})
    def do_POST(self):
        p, ip = self.path, self.client_address[0]
        if p == '/api/audio': return self.raw_upload(MAXAUDIO, audio_ext, 'Unsupported audio. Use mp3, ogg, wav or m4a')
        if p == '/api/resume': return self.raw_upload(10 * 1024 * 1024, resume_ext, 'Resume must be a PDF or Word (.docx) file')
        d = self.body()
        if d is None: return self.send(400, {'error': 'bad body'})
        if p == '/api/contact':
            hits = [t for t in CONTACT_HITS.get(ip, []) if t > time.time() - 3600]
            if len(hits) >= 6: return self.send(429, {'error': 'Too many messages sent, please try later'})
            name, email, message = txt(d.get('name'), 80), txt(d.get('email'), 120), txt(d.get('message'), 4000)
            if not name.strip() or not message.strip(): return self.send(400, {'error': 'Please fill in your name and message'})
            if email and not EMAIL_RE.match(email): return self.send(400, {'error': 'That email address looks off'})
            hits.append(time.time()); CONTACT_HITS[ip] = hits
            ok, err = send_contact_mail(name, email, message)
            return self.send(200, {'ok': True}) if ok else self.send(502, {'error': err})
        if p == '/api/login':
            fl = [t for t in FAILS.get(ip, []) if t > time.time() - 60]
            if len(fl) >= 5: return self.send(429, {'error': 'Too many attempts, wait a minute'})
            if check_pw(str(d.get('password', ''))):
                t = secrets.token_hex(24); TOKENS[t] = time.time() + 8 * 3600
                return self.send(200, {'token': t})
            fl.append(time.time()); FAILS[ip] = fl; time.sleep(1)
            return self.send(401, {'error': 'Wrong password'})
        if not self.authed(): return self.send(401, {'error': 'login required'})
        if p == '/api/smtp':
            email, pw = txt(d.get('email'), 120), str(d.get('app_password', ''))
            if email and not EMAIL_RE.match(email): return self.send(400, {'error': 'Invalid email'})
            cfg = load_smtp()
            if email: cfg['email'] = email
            if pw: cfg['app_password'] = pw
            write_json(SMTPCONF, cfg)
            return self.send(200, {'ok': True})
        if p == '/api/backup':
            buf = io.BytesIO(); z = zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED)
            if os.path.exists(DATA): z.write(DATA, 'site.json')
            for f in os.listdir(UP): z.write(os.path.join(UP, f), 'uploads/' + f)
            z.close()
            return self.send(200, buf.getvalue(), 'application/zip', {'Content-Disposition': 'attachment; filename="portfolio-backup.zip"'})
        if p == '/api/data':
            try: write_json(DATA, clean(d))
            except Exception: return self.send(400, {'error': 'bad data'})
            return self.send(200, {'ok': True})
        if p == '/api/password':
            new = str(d.get('new', ''))
            if not check_pw(str(d.get('old', ''))) or len(new) < 6: return self.send(400, {'error': 'Old password wrong or new one too short'})
            save_pw(new); TOKENS.clear(); return self.send(200, {'ok': True})
        if p == '/api/upload':
            m = re.match(r'^data:image/(jpeg|png|webp);base64,(.+)$', str(d.get('data', '')), re.S)
            if not m: return self.send(400, {'error': 'bad image'})
            raw = base64.b64decode(m.group(2))
            sig = {'jpeg': raw[:2] == b'\xff\xd8', 'png': raw[:4] == b'\x89PNG', 'webp': raw[:4] == b'RIFF'}[m.group(1)]
            if not sig or len(raw) > 8 * 1024 * 1024: return self.send(400, {'error': 'invalid image'})
            name = secrets.token_hex(8) + {'jpeg': '.jpg', 'png': '.png', 'webp': '.webp'}[m.group(1)]
            open(os.path.join(UP, name), 'wb').write(raw)
            return self.send(200, {'url': '/uploads/' + name})
        self.send(404, {'error': 'unknown'})

if __name__ == '__main__':
    first_run()
    port = int(os.environ.get('PORT') or (sys.argv[1] if len(sys.argv) > 1 else 8000))
    host = '0.0.0.0' if os.environ.get('PORT') else '127.0.0.1'  # hosts like Render set PORT and need 0.0.0.0
    print(f'Portfolio running -> http://{host}:{port}   (Ctrl+C to stop)')
    try: ThreadingHTTPServer((host, port), H).serve_forever()
    except KeyboardInterrupt: print('\nBye')
