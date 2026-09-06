"""Validate local references and assemble the static site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import shutil

ROOT = Path(__file__).resolve().parent

class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, 'Duplicate element ID'
            self.ids.add(attrs['id'])
        for key in ('src', 'href'):
            if key in attrs:
                self.links.append(attrs[key])

page = References()
page.feed((ROOT / 'index.html').read_text())
for link in page.links:
    parts = urlsplit(link)
    if parts.scheme or parts.netloc:
        continue
    if parts.path:
        assert (ROOT / parts.path).is_file(), f'Missing file: {link}'
    elif parts.fragment:
        assert parts.fragment in page.ids, f'Missing anchor: {link}'

output = ROOT / 'dist'
if output.exists():
    shutil.rmtree(output)
output.mkdir()
for filename in ('index.html', 'style.css', 'script.js'):
    shutil.copy2(ROOT / filename, output / filename)
shutil.copytree(ROOT / 'assets', output / 'assets', ignore=shutil.ignore_patterns('.DS_Store'))
print(f'Validated {len(page.links)} references; static site assembled.')
