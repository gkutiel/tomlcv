import base64
from datetime import date
from importlib.resources import open_text
from pathlib import Path

import toml
import typer
from jinja2 import Environment, StrictUndefined


def res2str(name: str):
    with open_text('tomlcv', name) as f:
        return f.read()


def tomlcv(
        *,
        in_toml: str = 'cv.toml',
        out_html: str = 'docs/index.html',
        date_format: str = "%b %Y"):

    Path(out_html).parent.mkdir(
        parents=True,
        exist_ok=True)

    def format_date(date: date):
        return date.strftime(date_format)

    env = Environment(
        undefined=StrictUndefined)

    env.filters['date'] = format_date

    resume = toml.load(in_toml)
    img = resume['basics']['image']

    with open(img, 'rb') as f:
        resume['basics']['image'] = base64.encodebytes(f.read()).decode()

    template = env.from_string(res2str('cv.j2'))

    resume_html = template.render(resume)

    with open(out_html, 'w') as f:
        f.write(resume_html)

    print(f'{in_toml} -> {out_html}')


def main():
    typer.run(tomlcv)
