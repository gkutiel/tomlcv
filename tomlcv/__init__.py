from dataclasses import dataclass
from datetime import date
from importlib.resources import open_text
from pathlib import Path

import toml
import typer
from cattr import Converter
from jinja2 import Environment, StrictUndefined
from rich import print


def res2str(name: str):
    with open_text('tomlcv', name) as f:
        return f.read()


@dataclass
class contact:
    email: str
    phone: str
    linkedin: str
    website: str | None = None
    dblp: str | None = None


@dataclass
class work:
    startDate: date
    endDate: date | None
    employer: str
    position: str
    summary: str
    highlights: list[str]


@dataclass
class education:
    startDate: date
    endDate: date | None
    degree: str
    institute: str
    field: str
    gpa: float
    summary: str
    highlights: list[str]


@dataclass
class publication:
    year: int
    title: str
    publisher: str
    summary: str


@dataclass
class project:
    name: str
    description: str
    url: str


@dataclass
class skill:
    name: str
    description: str


@dataclass
class cv:
    image: str
    name: str
    title: str
    summary: str
    contact: contact
    work: list[work]
    education: list[education]
    publications: list[publication]
    projects: list[project]
    skills: list[skill]


def tomlcv(
        *,
        in_toml: str = 'cv.toml',
        out_html: str = 'docs/index.html',
        date_format: str = "%b %Y",
        page_break: bool = False):

    Path(out_html).parent.mkdir(
        parents=True,
        exist_ok=True)

    def format_date(date: date):
        return date.strftime(date_format)

    def date2str(date: date) -> str:
        return date.strftime(date_format)

    def date2date(date: date):
        return date

    env = Environment(
        undefined=StrictUndefined)

    env.filters['date'] = format_date

    resume = toml.load(in_toml)

    con = Converter()
    con.register_unstructure_hook(date, date2str)
    con.register_structure_hook(date, lambda d, _: date2date(d))

    resume = con.structure(resume, cv)
    resume = con.unstructure(resume)

    template = env.from_string(res2str('cv.j2'))

    resume_html = template.render(
        resume,
        page_break=page_break)

    with open(out_html, 'w') as f:
        f.write(resume_html)

    print(f'{in_toml} -> {out_html}')


def main():
    typer.run(tomlcv)
