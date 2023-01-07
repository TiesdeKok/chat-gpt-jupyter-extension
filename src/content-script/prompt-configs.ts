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
    maxCharPrevCells: number,
}

export const promptSettings: Record<string, PromptSettings> = {
    format: {
        buttonLabel : "Format",
        buttonIcon : PaintbrushIcon,
        title : "ChatGPT - Improve Formatting", 
        maxCharPrevCells: 0,
        
    }, 
    explain: {
        buttonLabel : "Explain",
        buttonIcon : ProjectRoadmapIcon,
        title : "ChatGPT - Explain Code",
        maxCharPrevCells: 1250,
    },
    debug: {
        buttonLabel : "Debug",
        buttonIcon : BugIcon,
        title : "ChatGPT - Debug Code",
        maxCharPrevCells: 500,
    },
    complete: {
        buttonLabel : "Complete",
        buttonIcon : CommandPaletteIcon,
        title : "ChatGPT - Complete Code",
        maxCharPrevCells: 1250,

    },
    fun : {
        buttonLabel : "Fun",
        buttonIcon : GiftIcon,
        title : "ChatGPT - Fun",
        maxCharPrevCells: 500,
    }
}
