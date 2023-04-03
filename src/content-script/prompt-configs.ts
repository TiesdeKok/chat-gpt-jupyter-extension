import { 
    Icon,
    ProjectRoadmapIcon,
    BugIcon,
    CodeReviewIcon,
    CommandPaletteIcon,
    PaintbrushIcon,
    CommentIcon
} from '@primer/octicons-react'

export interface PromptSettings {
    buttonId: string,
    buttonLabel: string,
    buttonIcon: Icon,
    title : string,
    maxCharPrevCells: number,
}

export const promptSettings: Record<string, PromptSettings> = {
    format: {
        buttonId: "ai_ext_format_code",
        buttonLabel : "Format",
        buttonIcon : PaintbrushIcon,
        title : "ChatGPT - Improve Formatting", 
        maxCharPrevCells: 0,
        
    }, 
    explain: {
        buttonId: "ai_ext_explain_code",
        buttonLabel : "Explain",
        buttonIcon : ProjectRoadmapIcon,
        title : "ChatGPT - Explain Code",
        maxCharPrevCells: 1250,
    },
    debug: {
        buttonId: "ai_ext_debug_code",
        buttonLabel : "Debug",
        buttonIcon : BugIcon,
        title : "ChatGPT - Debug Code",
        maxCharPrevCells: 500,
    },
    complete: {
        buttonId: "ai_ext_complete_code",
        buttonLabel : "Complete",
        buttonIcon : CommandPaletteIcon,
        title : "ChatGPT - Complete Code",
        maxCharPrevCells: 1250,

    },
    review : {
        buttonId: "ai_ext_review_code",
        buttonLabel : "Review",
        buttonIcon : CodeReviewIcon,
        title : "ChatGPT - Code Review",
        maxCharPrevCells: 1250,
    },
    question : {
        buttonId: "ai_ext_question",
        buttonLabel : "Question",
        buttonIcon : CommentIcon,
        title : "ChatGPT - Question",
        maxCharPrevCells: 1250,
    }
}
