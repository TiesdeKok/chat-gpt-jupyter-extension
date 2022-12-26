import { getPossibleElementByQuerySelector, getBefores } from './utils.js'
import { promptSettings } from './prompt-configs.js'

function BuildQuery(type : string) {
    const prompt = promptSettings[type]
    
    const focalCell = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected"])
    const code = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.input_area div.CodeMirror-code"])
    const stderr = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.output_area div.output_error"])
    const stdout = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.output_area div.output_stdout"])
    const stdresult = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.output_area div.output_result"])

    let befores
    if (prompt.numPrevCells > 0 && focalCell) {
        befores = getBefores(focalCell, [], 0, prompt.numPrevCells)
    }
    
    let query = ""
    if (code && code.textContent) {
        query += prompt.instructions + "\n"
        query += "### Focal cell:\n```python\n"
        query += code.textContent
        query += "\n```\n"

        if (stdout && stdout.textContent && prompt.includeStdout) {
            if (stdout.textContent.length > 3) {
                query += "### STDOUT of focal cell:\n"
                query += stdout.textContent + "\n"
            }
        }

        if (stdresult && stdresult.textContent && prompt.includeStdout) {
            if (stdresult.textContent.length > 3) {
                query += "### Result of focal cell:\n"
                query += stdresult.textContent + "\n"
            }
        }

        if (stderr && stderr.textContent && prompt.includeStderr) {
            if (stderr.textContent.length > 3) {
                query += "### STDERR of focal cell:\n" 
                query += stderr.textContent + "\n"
            }
        }

        if (befores && befores.length > 0) {
            query += "-------------\n### Additional context, ignore if not relevant!\n-------------\n"
            query += "```\n"
            befores.forEach((before) => {
                console.log(query.length)
                if (query.length < 10000) { // Is this a good limit?? 
                    const b_code = before.querySelector("div.CodeMirror-code")
                    if (b_code && b_code.textContent) {
                        if (b_code.textContent.length > 3) {
                            query += b_code.textContent
                            query += "\n\n"
                        }
                    }
                }
            })
            query += "\n```"
        }

        console.log(query)
        return query
    } else {
        return ""
    }
}

export default BuildQuery