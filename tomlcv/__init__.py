import base64
from datetime import date, datetime
from importlib.resources import open_text

import toml
from jinja2 import Environment, StrictUndefined


def res2str(name: str):
    with open_text('tomlcv', name) as f:
        return f.read()


def format_date(date: date, format="%b %Y"):
    return date.strftime(format)


if __name__ == "__main__":
    resume = toml.load('resume.toml')
    img = resume['basics']['image']

    with open(img, 'rb') as f:
        resume['basics']['image'] = base64.encodebytes(f.read()).decode()

    env = Environment(
        undefined=StrictUndefined)

    env.filters['date'] = format_date

    template = env.from_string(res2str('resume.j2'))

    resume_html = template.render(resume)

    with open('resume.html', 'w') as f:
        f.write(resume_html)

    print(datetime.now(), 'resume.html created')
