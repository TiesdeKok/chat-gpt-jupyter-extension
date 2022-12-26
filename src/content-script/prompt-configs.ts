import { 
    Icon,
    ProjectRoadmapIcon,
    BugIcon,
    GiftIcon,
    CommandPaletteIcon,
    PaintbrushIcon,
} from '@primer/octicons-react'

export interface PromptSettings {
    buttonLabel: string,
    buttonIcon: Icon,
    title : string,
    instructions: string,
    includeStdout: boolean ,
    includeStderr: boolean,
    numPrevCells: number,
}

const defaultNumCells = 40

export const promptSettings: Record<string, PromptSettings> = {
    format: {
        buttonLabel : "Format",
        buttonIcon : PaintbrushIcon,
        title : "ChatGPT - Improve Formatting", 
        instructions: "Improve the code below by improving the formatting, adding comments where nescessary, and adding docstrings where nescessary. Never include import statements",
        includeStdout: false,
        includeStderr: false,
        numPrevCells: 0,
        
    }, 
    explain: {
        buttonLabel : "Explain",
        buttonIcon : ProjectRoadmapIcon,
        title : "ChatGPT - Explain Code",
        instructions: "Explain the code in the focal cell in a few sentences, ELI5 style. Focus solely on the code in the focal cell.",
        includeStdout: true,
        includeStderr: false, 
        numPrevCells: defaultNumCells,
    },
    debug: {
        buttonLabel : "Debug",
        buttonIcon : BugIcon,
        title : "ChatGPT - Debug Code",
        instructions: "Explain why the code below is throwing an error. Provide a short solution or recommendation at the end, if possible.",
        includeStdout: false,
        includeStderr: true,
        numPrevCells: defaultNumCells,
    },
    complete: {
        buttonLabel : "Complete",
        buttonIcon : CommandPaletteIcon,
        title : "ChatGPT - Complete Code",
        instructions: "Complete the code below.",
        includeStdout: false,
        includeStderr: false,
        numPrevCells: defaultNumCells,
    },
    fun : {
        buttonLabel : "Fun",
        buttonIcon : GiftIcon,
        title : "ChatGPT - Fun",
        instructions: "Have fun with the code below, for example by creating either a joke, or a meme, or a poem.",
        includeStdout: true,
        includeStderr: true,
        numPrevCells: 3,
    }
}
