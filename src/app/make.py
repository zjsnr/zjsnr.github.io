import os
from pathlib import Path

import jinja2
from bs4 import BeautifulSoup

from config import pages

curPath = Path(__file__).absolute().parent
templatesPath = curPath / 'templates'
rootPath = curPath.parent.parent
outputPath = rootPath / os.environ['OUTPUT_PATH']

outputPath.mkdir(exist_ok=True)

def main():
    'Render pages'
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(str(templatesPath)))

    for page in pages:
        if 'filename' in page:
            template = env.get_template(page['filename'])
            rendered = template.render(
                pages=pages,
                curpage=page
            )
            text = BeautifulSoup(rendered, 'html.parser').prettify()
            with (outputPath / page['filename']).open('w', encoding='utf8') as f:
                f.write(text)


if __name__ == "__main__":
    main()
