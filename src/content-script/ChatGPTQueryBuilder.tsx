import { getPossibleElementByQuerySelector, getBefores } from './utils.js'
import { promptSettings } from './prompt-configs.js'

function BuildQuery(type : string, siteName : string) : string {
    const prompt = promptSettings[type]
    
    let focalCell = null
    let code = null
    let stderr = null
    let stdout = null
    let stdresult = null
    if (siteName === "notebook") {
        focalCell = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected"])
        code = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.input_area div.CodeMirror-code"])
        stderr = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.output_area div.output_error"])
        stdout = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.output_area div.output_stdout"])
        stdresult = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.output_area div.output_result"])
    } else if (siteName === "lab") {
        const active_notebook = document.querySelector<HTMLInputElement>('div.jp-NotebookPanel:not(.p-mod-hidden)')
        if (active_notebook) {
            focalCell = active_notebook.querySelector<HTMLInputElement>(".jp-CodeCell.jp-mod-selected")
            code = active_notebook.querySelector<HTMLInputElement>(".jp-CodeCell.jp-mod-selected div.CodeMirror-code")
            stderr = active_notebook.querySelector<HTMLInputElement>('.jp-CodeCell.jp-mod-selected div.jp-OutputArea-output[data-mime-type="application/vnd.jupyter.stderr"]')
            stdout = active_notebook.querySelector<HTMLInputElement>('.jp-CodeCell.jp-mod-selected div.jp-OutputArea-output[data-mime-type="application/vnd.jupyter.stdout"]')
            stdresult = active_notebook.querySelector<HTMLInputElement>('.jp-CodeCell.jp-mod-selected div.jp-OutputArea-output[data-mime-type="text/plain"]')
        } else {
            console.log("ChatGPT Jupyter: Warning - No active notebook panel found")
            return ""
        }
        

    } else {
        return ""
    }

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

        //console.log(query)
        return query
    } else {
        return ""
    }
}

export default BuildQuery