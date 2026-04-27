import os
from flask import Flask, send_file, abort

app = Flask(__name__, static_folder='.')

HTML_FILES = [
    'index.html',
    'login.html',
    'signup.html',
    'dashboard.html',
    'account.html',
    'about.html',
    'services.html',
    'playbook.html',
    'quiz.html',
    'test.html'
]

STATIC_EXTENSIONS = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.webp']

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/<path:filename>')
def serve_file(filename):
    if filename in HTML_FILES:
        return send_file(filename)
    ext = os.path.splitext(filename)[1].lower()
    if ext in STATIC_EXTENSIONS and os.path.exists(filename):
        return send_file(filename)
    if os.path.exists(filename):
        return send_file(filename)
    abort(404)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=True)