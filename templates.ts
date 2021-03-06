import * as fs from 'fs'
import { minify } from 'html-minifier-terser'

export const makeCardFromTemplateHTML = (dict: Record<string, string>, html: string) => {
    const templateNames = html.match(/TEMPLATE_(\w+)/g)
    templateNames?.forEach((t) => {
        if (dict[t] !== undefined) {
            html = html.split(new RegExp(t, 'g')).join(dict[t])
        } else {
            throw `No value for ${t}`
        }
    })
    return html
    return html.split(/\s+/g).join(' ')
}

const makeCardFromTemplate = (dict: Record<string, string>, templateName: string) => {
    let html = fs.readFileSync(`/home/robert/Documents/QKP/templates/${templateName}.html`, 'utf8')
    return makeCardFromTemplateHTML(dict, html)
}

export const standardTrustCard = (
    frontElements: string[],
    backElements: string[],
    other?: { meta?: string; onRender?: string }
) => {
    const front = `<div class="parent"> ${frontElements.map((h) => `<div class="item">${h}</div>`).join('\n')}</div>`
    const back = `<div class="parent"> ${backElements.map((h) => `<div class="item">${h}</div>`).join('\n')}</div>`
    return {
        source: makeCardFromTemplate(
            {
                TEMPLATE_FRONT_CONTENT: front,
                TEMPLATE_BACK_CONTENT: back,
                TEMPLATE_HEAD_CONTENT: other?.meta || '',
                TEMPLATE_ONRENDER: other?.onRender || '',
            },
            'trust'
        ),
        front: front + (other?.meta || ''),
        back: back + (other?.meta || ''),
    }
}

export const standardTypeCard = (frontElements: string[], backElements: string[], answer: string, meta?: string) => {
    const front = `<div class="parent"> ${frontElements.map((h) => `<div class="item">${h}</div>`).join('\n')}</div>`
    const back = `<div class="parent"> ${backElements.map((h) => `<div class="item">${h}</div>`).join('\n')}</div>` + (meta || '')
    return {
        source: makeCardFromTemplate(
            {
                TEMPLATE_FRONT_CONTENT: front,
                TEMPLATE_BACK_CONTENT: back,
                TEMPLATE_CORRECT_ANSWER: answer,
                TEMPLATE_HEAD_CONTENT: meta || '',
            },
            'type'
        ),
        front: front + (meta || ''),
        back: back + (meta || ''),
    }
}

export const standardOptionCard = (
    frontElements: string[],
    backElements: string[],
    options: string[],
    correctOption: number
) => {}
