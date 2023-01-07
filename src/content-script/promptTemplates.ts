function completionTemplate(previousCode : string, focalCode : string) { return `
/* -------------------------------------------------------------------------- */
/*                           BACKGROUND INFORMATION                           */
/* -------------------------------------------------------------------------- */

<|PREVIOUS CODE - START|>
${previousCode}
<|PREVIOUS CODE - END|>

<|FOCAL CELL - TO COMPLETE - START|>
${focalCode}
## CODE CONTINUES HERE
<|FOCAL CELL - TO COMPLETE - END|>

/* -------------------------------------------------------------------------- */
/*                              MAIN INSTRUCTIONS                             */
/* -------------------------------------------------------------------------- */

Help me by continuing and completing the code in the FOCAL CELL.
Please answer using the FORMAT below, replacing text in brackets with the result. Do not include the brackets in the output.
Use the PREVIOUS CODE to better understand the objective of the FOCAL CELL, but never repeat parts of the PREVIOUS CODE. 

The format:
Here is the completed code (which is [Identified language of the code]):
\`\`\`[Identified language of the code]
[Complete code of the focal cell, in markdown]
\`\`\`
`
}

function explainTemplate(
    previousCode : string, 
    focalCode : string,
    stdout : string,
    result : string
    ) { return `
/* -------------------------------------------------------------------------- */
/*                           BACKGROUND INFORMATION                           */
/* -------------------------------------------------------------------------- */

<|PREVIOUS CODE - START|>
${previousCode}
<|PREVIOUS CODE - END|>

<|FOCAL CELL - START|>
${focalCode}
<|FOCAL CELL - END|>

<|STDOUT OF FOCAL CELL - START|>
${stdout}
<|STDOUT OF FOCAL CELL - END|>

<|RESULT OF FOCAL CELL - START|>
${result}
<|result OF FOCAL CELL - END|>

/* -------------------------------------------------------------------------- */
/*                              MAIN INSTRUCTIONS                             */
/* -------------------------------------------------------------------------- */

Help me by explaining what the code in the FOCAL CELL is doing. 
Please answer using the FORMAT below, replacing text in brackets with the result. Do not include the brackets in the output.

The format:
**Here is the explanation of the focal cell (which is in [Identified language of the code]):**
[Explanation of the focal cell]
`
}

function formatTemplate(
    focalCode : string,
    ) { return `
/* -------------------------------------------------------------------------- */
/*                           BACKGROUND INFORMATION                           */
/* -------------------------------------------------------------------------- */

<|FOCAL CELL - START|>
${focalCode}
<|FOCAL CELL - END|>

/* -------------------------------------------------------------------------- */
/*                              MAIN INSTRUCTIONS                             */
/* -------------------------------------------------------------------------- */

Help me by improving the formatting of the code in the FOCAL CELL, where nescessary.
Example of improvements: adding comments, improve spacing, adding docstrings, add type hints etc.
Focus solely on the format, never alter the code itself!

Please answer using the FORMAT below, replacing text in brackets with the result. Do not include the brackets in the output.

The format:
**Here is improved code for the focal cell (which is in [Identified language of the code]):**
\`\`\`[Identified language of the code]
[The improved code of the focal cell, in markdown]
\`\`\`
`
}

function debugTemplate(
    previousCode : string, 
    focalCode : string,
    stderr : string,
    ) { return `
/* -------------------------------------------------------------------------- */
/*                           BACKGROUND INFORMATION                           */
/* -------------------------------------------------------------------------- */

<|PREVIOUS CODE - START|>
${previousCode}
<|PREVIOUS CODE - END|>

<|FOCAL CELL - START|>
${focalCode}
<|FOCAL CELL - END|>

<|STDERR OF FOCAL CELL - START|>
${stderr}
<|STDERR OF FOCAL CELL - END|>

/* -------------------------------------------------------------------------- */
/*                              MAIN INSTRUCTIONS                             */
/* -------------------------------------------------------------------------- */

Help me by explaining why the code in the FOCAL CELL is not working and/or throwing an error. 
Please answer using the FORMAT below, replacing text in brackets with the result. Do not include the brackets in the output.

The format:
**Here is the explanation of the problem with the focal cell (which is in [Identified language of the code]):**
[Explanation of why the code in the focal cell is not working]

**Here is a short solution or recommendation to fix the problem:**
\`\`\`[Identified language of the code]
[The recommended code to fix the focal cell, in markdown]
\`\`\`
`
}

function funTemplate(
    previousCode : string, 
    focalCode : string,
    ) { return `
/* -------------------------------------------------------------------------- */
/*                           BACKGROUND INFORMATION                           */
/* -------------------------------------------------------------------------- */

<|PREVIOUS CODE - START|>
${previousCode}
<|PREVIOUS CODE - END|>

<|FOCAL CELL - START|>
${focalCode}
<|FOCAL CELL - END|>

/* -------------------------------------------------------------------------- */
/*                              MAIN INSTRUCTIONS                             */
/* -------------------------------------------------------------------------- */

Share a fact about something in the FOCAL CELL that most (new) programmers are likely to not know. 
Please answer using the FORMAT below, replacing text in brackets with the result. Do not include the brackets in the output.

The format:
**Here is something about the code in the focal cell which you maybe didn't know:**
[Fact about the code in the focal cell]
`
}

export const promptTemplates = {
    complete : completionTemplate,
    explain : explainTemplate,
    format : formatTemplate,
    debug : debugTemplate,
    fun : funTemplate,
}

