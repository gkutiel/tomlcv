import { Command } from "commander"
import { readFile, writeFile } from "fs/promises"
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import yaml from "yaml"
import { version } from "../package.json"
import { CV } from "./schema"

const program = new Command()

function date(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
    })
}

program
    .name("yamlcv")
    .description("Write your CV in YAML format and convert it to PDF or HTML")
    .version(version)
    .argument("<cv.yml>", "Path to the CV YAML file")
    .action(async (cvYaml: string) => {
        console.log(`Processing CV file: ${cvYaml}`)

        const style = await readFile("src/index.css", "utf8")
        const {
            image,
            name,
            title,
            contact,
            summary,
            work,
            education,
            publications,
            projects,
            skills
        } = yaml.parse(await readFile(cvYaml, "utf8")) as CV

        const html = <html>
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{`${name} | ${title}`}</title>
                <style>{style}</style>
            </head>

            <body>
                <main id="main">
                    <header id="header" className="row center">
                        <div className="col gap center">
                            <img src={image} alt={name} />
                            <div id="contact">
                                <table className="small">
                                    <tr>
                                        <td>Email</td>
                                        <td><a href={`mailto:${contact.email}`}>{contact.email}</a></td>
                                    </tr>
                                    <tr>
                                        <td>Phone</td>
                                        <td>
                                            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>LinkedIn</td>
                                        <td><a href={contact.linkedin}>{contact.linkedin}</a></td>
                                    </tr>
                                    <tr>
                                        <td>Website</td>
                                        <td><a href={contact.website}>{contact.website}</a></td>
                                    </tr>
                                    <tr>
                                        <td>dblp</td>
                                        <td><a href={contact.dblp}>{contact.dblp}</a></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                        <div className="sep" />
                        <div>
                            <h1>{name}</h1>
                            <h2>{title}</h2>
                            <p className="large">{summary}</p>
                        </div>
                    </header>

                    <div id="content">
                        <h2>Work Experience</h2>
                        <table>
                            <tbody>
                                {
                                    work.map((w, i) => (
                                        <tr key={i}>
                                            <td className="nowrap top" style={{ padding: '6px 24px 0 0' }}>{date(w.startDate)} - {date(w.endDate)}</td>
                                            <td style={{ paddingBottom: 20 }}>
                                                <h3>{w.position} @ {w.employer}</h3>
                                                <p>{w.summary}</p>
                                                {w.highlights && <ul>
                                                    {w.highlights.map((highlight, i) => (
                                                        <li key={i}>{highlight}</li>
                                                    ))}
                                                </ul>}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>

                        <h2>Education</h2>
                        <table>
                            <tbody>
                                {
                                    education.map((e, i) => (
                                        <tr key={i}>
                                            <td className="nowrap top" style={{ padding: '6px 24px 0 0' }}>{date(e.startDate)} - {date(e.endDate)}</td>
                                            <td style={{ paddingBottom: 20 }}>
                                                <h3>{e.degree} in  {e.field} @ {e.institute}</h3>
                                                <p>{e.summary}</p>
                                                <ul>
                                                    <li key='gpa'>GPA: {e.gpa}</li>
                                                    {
                                                        e.highlights?.map((highlight, i) => (
                                                            <li key={i}>{highlight}</li>
                                                        ))
                                                    }
                                                </ul>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>

                        {publications && publications.length > 0 &&
                            <>
                                <h2>Selected Publication</h2>
                                <table>
                                    <tbody>
                                        {
                                            publications.map((p, i) => (
                                                <tr key={i}>
                                                    <td className="nowrap top" style={{ padding: '6px 24px 0 0' }}>{p.year}</td>
                                                    <td style={{ paddingBottom: 20 }}>
                                                        <h3>{p.title}</h3>
                                                        <h4>{p.publisher}</h4>
                                                        <p>{p.summary}</p>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </>
                        }

                        {projects && projects.length > 0 &&
                            <>
                                <h2>Projects</h2>
                                <table>
                                    <tbody>
                                        {
                                            projects.map((p, i) => (
                                                <tr key={i}>
                                                    <td
                                                        className="nowrap top"
                                                        style={{
                                                            padding: '6px 24px 0 0',
                                                            fontWeight: 'bold'
                                                        }}>{p.name}</td>

                                                    <td style={{ paddingBottom: 20 }}>
                                                        <p>{p.description}</p>
                                                        <a target='_blank' href={p.url}>{p.url}</a>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </>
                        }


                        {skills && skills.length > 0 &&
                            <>
                                <h2>Skills</h2>
                                <table id="skills">
                                    {skills.map((s, i) =>
                                        <tr>
                                            <td className="nowrap top" style={{
                                                padding: '6px 24px 0 0',
                                                fontWeight: 'bold'
                                            }}>{s.name}</td>
                                            <td><p>{s.description}</p></td>
                                        </tr>
                                    )}
                                </table>
                            </>
                        }


                    </div>
                </main>
            </body>
        </html>

        await writeFile('docs/index.html', renderToStaticMarkup(html), 'utf8')
    })



program.parse()