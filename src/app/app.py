from pathlib import Path

import flask

from config import pages

curPath = Path(__file__).absolute().parent
staticPath = curPath.parent.parent / 'static'
print(staticPath)
assert staticPath.exists()
app = flask.Flask(__name__, static_folder=str(staticPath))


def wrap(page):
    def func():
        return flask.render_template(
            page['filename'], pages=pages, curpage=page
        )
    return func


@app.route('/<string:name>')
def render(name):
    match = filter(lambda p: p['name'] == name, pages)
    try:
        page = next(match)
        return flask.render_template(page['filename'], pages=pages, curpage=page)
    except:
        flask.abort(404)


app.run('127.0.0.1', threaded=True, debug=True)
