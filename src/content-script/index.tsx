import 'github-markdown-css'
import { render } from 'preact'
import ChatGPTQuery from './ChatGPTQuery'
import BuildQuery from './ChatGPTQueryBuilder'
import Button  from './Interface'
import { config, NotebookInterface } from './interface-configs.js'
import './styles.scss'
import { promptSettings } from './prompt-configs.js'
import { CopilotIcon } from '@primer/octicons-react'

async function submit_and_add_question(
    queryType : string,
    siteConfig: NotebookInterface,
) {
    // Build query 
    const query = BuildQuery(queryType)
    if (query) {
        const container = document.createElement('div')
        container.className = 'chat-gpt-container' 
        
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
            resultContainerParent.style.display = 'block'
            resultContainer.prepend(container)
            resultContainer.style.overflowX = 'auto'

            render(
                <ChatGPTQuery question={query} type={queryType}/>,
                container,
            )
        }
        
    }    
}

function create_interface(siteConfig : NotebookInterface) { 
    const toolbar = document.querySelector(siteConfig.buttonParent)
    const controls_container = document.createElement('span')
    controls_container.className = 'chat-gpt-controls'
    toolbar!.append(controls_container)

    // Attach manual close to make sure the closing button still works
    const closeButton = document.querySelector('div#pager-button-area > a[title="Close the pager"]')
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            const resultContainerParent = document.querySelector<HTMLElement>(siteConfig.resultContainer)
            if (resultContainerParent) {
                resultContainerParent.style.display = 'none'
            }
        })
    }
    
    var buttons = [
        <Button 
            name="ChatGPT:" 
            onClick={() => null} 
            icon={CopilotIcon}
            disabled={true}
        />
    ];

    Object.keys(promptSettings).map((key) => {
        const prompt = promptSettings[key]
        buttons.push(
            <Button 
            name={prompt.buttonLabel}
            onClick={() => submit_and_add_question(
                        key,
                        siteConfig
                    )} 
            icon={prompt.buttonIcon}
            /> 
        )
    })

    render(
        buttons, 
        controls_container
    ) 
}

// TODO: Make this auto-detect the type of notebook interface
const siteName = "notebook"
const siteConfig = config[siteName]

// Wait for the toolbar to be loaded, and then add the interface

const maxTries = 7
let tries = 0
const interval = setInterval(() => {
    const toolbar = document.querySelector(siteConfig.buttonParent)
    if (toolbar) {
        clearInterval(interval)
        create_interface(siteConfig)
        console.log("ChatGPT - Jupyter - Active!")
    } else {
        tries += 1
        if (tries >= maxTries) {
            clearInterval(interval)
        }
    }
}
, 1000)

console.log("ChatGPT - Jupyter - TRYING!")
