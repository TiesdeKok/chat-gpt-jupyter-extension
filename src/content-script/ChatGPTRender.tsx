import ChatGPTQuery from './ChatGPTQuery'
import BuildQuery from './ChatGPTQueryBuilder'
import { NotebookInterface } from './interface-configs.js'
import { render } from 'preact'

export async function submit_and_add_question(
    queryType : string,
    siteConfig: NotebookInterface,
    siteName: string,
    userInput?: string
) {
    console.log("ChatGPT Jupyter: Button clicked for: " + queryType)
    // Build query 
    let query;
    if (userInput) {
        query = BuildQuery(queryType, siteName, userInput)
    } else {
        query = BuildQuery(queryType, siteName)
    }
    
    if (query) {
        const container = document.createElement('div')
        container.className = 'chat-gpt-container' 
        container.style.margin = "10px"
        
        const resultContainerParent = document.querySelector<HTMLElement>(siteConfig.resultContainer)
        const resultContainer = resultContainerParent?.querySelector<HTMLElement>(siteConfig.resultContainerChild)
        
        if (resultContainerParent && resultContainer) {
            // Remove any existing items in resultContainer that match the selectors in ['pre', '.chat-gpt-container']
            for (const selector of ['.chat-gpt-container', 'pre']) {
                const elements = resultContainer.querySelectorAll(selector)
                for (const element of elements) {
                    element.remove()
                }
            }

            // Clear out result container
            resultContainer.innerHTML = ''
            
            // Add new result
            
            if (siteName === "notebook") {
                resultContainerParent.style.display = 'block'
                resultContainer.style.overflowX = 'auto'
            }
            
            resultContainer.prepend(container)
        
            if (siteName === "lab") {
                // Check if sidebar is open, otherwise toggle it. 
                const stack = document.querySelector<HTMLElement>('#jp-left-stack')
                const toggle = document.querySelector<HTMLElement>('li[data-command="application:toggle-left-area"]')
                if (stack && toggle) {
                    if (stack.offsetParent === null) {
                        toggle.click()
                    }
                }

                // Hide all other panels in the sidebar

                var candidates = document.querySelectorAll<HTMLElement>('div#jp-left-stack div.p-StackedPanel-child')
                for (const candidate of candidates) {
                    if (!candidate.classList.contains('lm-mod-hidden')) {
                        candidate.classList.add('lm-mod-hidden')
                        candidate.classList.add('p-mod-hidden')
                    }
                }

                // Show the GPT area
                resultContainerParent.classList.remove('lm-mod-hidden')
                resultContainerParent.classList.remove('p-mod-hidden')
            }
            
            render(
                <ChatGPTQuery question={query} type={queryType} siteName={siteName}/>,
                container,
            )
        }
        
    }    
}