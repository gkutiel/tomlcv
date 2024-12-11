import base64
from datetime import datetime
from importlib.resources import open_text

import toml
from jinja2 import StrictUndefined, Template


def res2str(name: str):
    with open_text('tomlcv', name) as f:
        return f.read()


if __name__ == "__main__":
    resume = toml.load('resume.toml')
    img = resume['basics']['image']

    with open(img, 'rb') as f:
        resume['basics']['image'] = base64.encodebytes(f.read()).decode()

    template = Template(
        res2str('resume.j2'),
        undefined=StrictUndefined)

    resume_html = template.render(resume)

    with open('resume.html', 'w') as f:
        f.write(resume_html)

    print(datetime.now(), 'resume.html created')
