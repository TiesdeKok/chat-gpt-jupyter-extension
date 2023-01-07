import 'github-markdown-css'
import { render } from 'preact'
import ChatGPTQuery from './ChatGPTQuery'
import BuildQuery from './ChatGPTQueryBuilder'
import { Button, LabArea}  from './Interface'
import { config, NotebookInterface } from './interface-configs.js'
import './styles.scss'
import { promptSettings } from './prompt-configs.js'
import { CopilotIcon } from '@primer/octicons-react'

/* -------------------------------------------------------------------------- */
/*                                  Functions                                 */
/* -------------------------------------------------------------------------- */

async function identify_notebook_type(config : Record<string, NotebookInterface>) {
    const maxTries = 14
    let tries = 0
  
    while (tries < maxTries) {
      for (const [key, value] of Object.entries(config)) {
        const parent = document.querySelector<HTMLElement>(value.buttonParent)
        if (parent && parent.offsetParent !== null) {
          console.log("ChatGPT Jupyter: Identified notebook type as: " + key)
          return key
        }
      }
      tries += 1
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  
    return null
}


async function submit_and_add_question(
    queryType : string,
    siteConfig: NotebookInterface,
    siteName: string
) {
    console.log("ChatGPT Jupyter: Button clicked for: " + queryType)
    // Build query 
    const query = BuildQuery(queryType, siteName)
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

function attach_lab_area() {
    const parentArea = document.querySelector('#jp-left-stack')
    const area_container = document.createElement('span')
    area_container.className = 'chat-gpt-area'
    parentArea!.append(area_container)
    if (!parentArea) {
        console.log("ChatGPT Jupyter: Error - could not find parent area")
        return
    }
    render(
        <LabArea/>,
        area_container
    )
}

function create_interface(siteConfig : NotebookInterface, siteName : string) { 
    const toolbar = document.querySelector(siteConfig.buttonParent)
    const controls_container = document.createElement('span')
    controls_container.className = 'chat-gpt-controls'
    toolbar!.append(controls_container)

    // Attach manual close to make sure the closing button still works in Jupyter Notebook
    if (siteName === "notebook") {
        const closeButton = document.querySelector('div#pager-button-area > a[title="Close the pager"]')
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                const resultContainerParent = document.querySelector<HTMLElement>(siteConfig.resultContainer)
                if (resultContainerParent) {
                    resultContainerParent.style.display = 'none'
                }
            })
        }
    }

    var buttons = [
        <Button 
            name="ChatGPT:" 
            onClick={() => null} 
            icon={CopilotIcon}
            disabled={true}
            siteName={siteName}
        />
    ];

    Object.keys(promptSettings).map((key) => {
        const prompt = promptSettings[key]
        buttons.push(
            <Button 
            name={prompt.buttonLabel}
            onClick={() => submit_and_add_question(
                        key,
                        siteConfig,
                        siteName
                    )} 
            icon={prompt.buttonIcon}
            siteName={siteName}
            /> 
        )
    })

    render(
        buttons, 
        controls_container
    ) 
}

/* -------------------------------------------------------------------------- */
/*                           Execute extension logic                          */
/* -------------------------------------------------------------------------- */

async function main() {

    const siteName = await identify_notebook_type(config)
    if (siteName) {
        // Get the config for the current site
        const siteConfig = config[siteName]

        // Add the extension interface
        create_interface(siteConfig, siteName)

        if (siteName === "lab") {
            setTimeout(() => {attach_lab_area()}, 1000) // This is a quick hack, but it works
        }

        console.log("ChatGPT - Jupyter: active and ready!")
    }
}

main()

