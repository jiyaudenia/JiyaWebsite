#!/usr/bin/env python3
"""Local portfolio server with a persistent contact inbox and optional email delivery."""
import argparse, datetime, email, email.policy, json, os, re, smtplib, sqlite3
from email.message import EmailMessage
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,'.m3u8':'application/vnd.apple.mpegurl','.ts':'video/mp2t','.js':'text/javascript'}
    def __init__(self,*a,**k):super().__init__(*a,directory=str(ROOT/'public'),**k)
    def guess_type(self,path):
        if Path(path).name.startswith('css'):return 'text/css'
        return super().guess_type(path)
    def do_GET(self):
        if self.path.startswith('/api/'):
            self.send_response(204);self.end_headers();return
        # Permit direct routes with or without a trailing slash.
        return super().do_GET()
    def respond(self,status,data):
        body=json.dumps(data).encode();self.send_response(status)
        self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)))
        self.end_headers();self.wfile.write(body)
    def do_POST(self):
        if self.path!='/api/connect/forms/send/5795839':
            return self.respond(404,{'message':'Not found'})
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=65536:return self.respond(413,{'message':'Message is too large'})
            envelope=email.message_from_bytes(b'Content-Type: '+self.headers.get('Content-Type','').encode()+b'\r\nMIME-Version: 1.0\r\n\r\n'+self.rfile.read(size),policy=email.policy.default)
            parts={p.get_param('name',header='content-disposition'):p.get_content() for p in envelope.iter_parts()}
            fields=json.loads(parts.get('fields','[]'))
            values={f['type']:str(f['value']).strip() for f in fields}
            if not all(values.get(k) for k in ['name','email','text']) or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',values['email']):
                return self.respond(400,{'message':'Please complete all fields with a valid email.'})
            inbox=ROOT/'.data';inbox.mkdir(exist_ok=True)
            with sqlite3.connect(inbox/'contacts.sqlite3') as db:
                db.execute('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, created TEXT, name TEXT, email TEXT, message TEXT)')
                db.execute('INSERT INTO messages(created,name,email,message) VALUES(?,?,?,?)',(datetime.datetime.now(datetime.timezone.utc).isoformat(),values['name'],values['email'],values['text']))
            if os.environ.get('SMTP_HOST'):
                msg=EmailMessage();msg['Subject']='Portfolio contact from '+values['name']
                msg['From']=os.environ['SMTP_FROM'];msg['To']=os.environ['CONTACT_TO'];msg['Reply-To']=values['email']
                msg.set_content(values['text'])
                with smtplib.SMTP(os.environ['SMTP_HOST'],int(os.environ.get('SMTP_PORT','587')),timeout=20) as smtp:
                    smtp.starttls()
                    if os.environ.get('SMTP_USER'):smtp.login(os.environ['SMTP_USER'],os.environ['SMTP_PASSWORD'])
                    smtp.send_message(msg)
            self.respond(200,{'ok':True})
        except Exception as exc:
            print('Contact submission error:',type(exc).__name__,flush=True)
            self.respond(500,{'message':'Message could not be delivered. Please try again.'})
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=5173);args=parser.parse_args()
    print(f'Portfolio preview: http://localhost:{args.port}',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
