import { getPossibleElementByQuerySelector, getBefores } from './utils.js'
import { promptSettings } from './prompt-configs.js'
import { promptTemplates } from './promptTemplates.js'

function BuildQuery(type : string, siteName : string) : string {
    const prompt = promptSettings[type]

    /* -------------------------------------------------------------------------- */
    /*                    First get the data for the focal cell                   */
    /* -------------------------------------------------------------------------- */
    
    let focalCell = null
    let codeLines = null
    let stderr = null
    let stdout = null
    let stdresult = null
    if (siteName === "notebook") {
        focalCell = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected"])
        codeLines = document.querySelectorAll(".cell.selected div.input_area pre.CodeMirror-line")
        stderr = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.output_area div.output_error"])
        stdout = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.output_area div.output_stdout"])
        stdresult = getPossibleElementByQuerySelector<HTMLInputElement>([".cell.selected div.output_area div.output_result"])
    } else if (siteName === "lab") {
        const active_notebook = document.querySelector<HTMLInputElement>('div.jp-NotebookPanel:not(.p-mod-hidden)')
        if (active_notebook) {
            focalCell = active_notebook.querySelector<HTMLInputElement>(".jp-CodeCell.jp-mod-selected")
            codeLines = active_notebook.querySelectorAll<HTMLInputElement>(".jp-CodeCell.jp-mod-selected pre.CodeMirror-line")
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

    // Loop over codeLines and concatenate the textContent to code
    let code = ""
    if (codeLines && codeLines.length > 0) { 
        codeLines.forEach((line) => {
            if (line.textContent) {
                code += line.textContent + "\n"
            }
        })
    }

    /* -------------------------------------------------------------------------- */
    /*                 Second, get the data for the previous cells                */
    /* -------------------------------------------------------------------------- */

    let befores
    if (prompt.maxCharPrevCells > 0 && focalCell) {
        befores = getBefores(focalCell, [], 0, 9999)
    }

    let before_text_array : string[]= []
    if (befores && befores.length > 0) {
        befores.forEach((before) => {
            const lines = before.querySelectorAll("pre.CodeMirror-line")
            if (lines && lines.length > 0) {
                let before_text = ""
                lines.forEach((line) => {
                    if (line.textContent) {
                        before_text += line.textContent + "\n"
                    }
                })
                before_text_array.push(before_text)
            }
        })
    }

    let prev_cell_text = ""
    for (let i = before_text_array.length - 1; i >= 0; i--) {
        if ((prev_cell_text.length) < prompt.maxCharPrevCells) {
            prev_cell_text = before_text_array[i] + "\n" + prev_cell_text
        } else {
            break
        }
    }

    // Check if any of the last non-empty lines 3 of the prev_cell_text are headers
    // If so, add the header to the start of the code cell and remove it from the prev_cell_text
    // Stop when a non-header line is found
    if (prev_cell_text.length > 0) {
        const last_lines = prev_cell_text.split("\n").slice(-20)
        
        let len_to_remove = 0
        for (let i = last_lines.length - 1; i >= 0; i--) {
            if (last_lines[i].length > 3) {
                if (last_lines[i].startsWith("#")) {
                    code = last_lines[i] + "\n" + code
                    len_to_remove += last_lines[i].length 
                } else {
                    break
                }
            } else {
                len_to_remove += last_lines[i].length + 1
            }
        }
        if (len_to_remove > 0) {
            prev_cell_text = prev_cell_text.slice(0, -len_to_remove)
        }
    }

    // Remove any excessive newlines in the prev_cell_text or code
    prev_cell_text = prev_cell_text.replace(/\n{3,}/g, "\n\n")
    code = code.replace(/\n{3,}/g, "\n\n")

    /* -------------------------------------------------------------------------- */
    /*             Get the STDOUT / Result / STDERR of the focal cell             */
    /* -------------------------------------------------------------------------- */
    
    let stdout_text = ""
    if (stdout && stdout.textContent) {
        if (stdout.textContent.length > 3) {
            stdout_text = stdout.textContent
        }
    }

    let result_text = ""
    if (stdresult && stdresult.textContent) {
        if (stdresult.textContent.length > 3) {
            result_text = stdresult.textContent
        }
    }

    let stderr_text = ""
    if (stderr && stderr.textContent) {
        if (stderr.textContent.length > 3) {
            stderr_text = stderr.textContent
        }
    }    

    /* -------------------------------------------------------------------------- */
    /*                 Third, build the query string and return it                */
    /* -------------------------------------------------------------------------- */
    let query = ""
    if (code && code) {
        if (type == "complete") {
            query = promptTemplates["complete"](prev_cell_text, code)
        } else if (type == "explain") {
            query = promptTemplates["explain"](prev_cell_text, code, stdout_text, result_text)
        } else if (type == "format") {
            query = promptTemplates["format"](code)
        } else if (type == "debug") {
            query = promptTemplates["debug"](prev_cell_text, code, stderr_text)
        } else {
            query = promptTemplates["review"](prev_cell_text, code)
        }

        //console.log(query)
        return query
    } else {
        return ""
    }
}

export default BuildQuery