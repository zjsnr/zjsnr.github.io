import os
from pathlib import Path
import jinja2
from bs4 import BeautifulSoup

curPath = Path(__file__).absolute().parent
templatesPath = curPath / 'templates'
outputPath = curPath.parent.parent

pages = (
    {
        'name': 'index',
        'filename': 'index.html',
        'nav_name': '出征查询',
    }, {
        'name': 'ranking',
        'filename': 'ranking.html',
        'nav_name': '出征排行',
    }, {
        'name': 'sequence',
        'filename': 'sequence.html',
        'nav_name': '炮序查询',
    }, {
        'name': 'power',
        'filename': 'power.html',
        'nav_name': '实力排行'
    }, {
        'name': 'min_power',
        'filename': 'min_power.html',
        'nav_name': '守门员排行'
    }
)

env = jinja2.Environment(loader=jinja2.FileSystemLoader(str(templatesPath)))

for page in pages:
    template = env.get_template(page['filename'])
    rendered = template.render(
        pages=pages,
        curpage=page
    )
    text = BeautifulSoup(rendered, 'html.parser').prettify()
    with (outputPath / page['filename']).open('w', encoding='utf8') as f:
        f.write(text)
