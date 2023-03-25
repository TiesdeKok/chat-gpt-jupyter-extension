import { ThumbsdownIcon, ThumbsupIcon, XIcon } from '@primer/octicons-react'
import { memo, useCallback, useState } from 'react'
import Browser from 'webextension-polyfill'
import { config } from './interface-configs.js'

interface Props {
    messageId: string
    conversationId: string
    siteName: string
}

function ChatGPTFeedback(props: Props) {
    const siteConfig = config[props.siteName]

    const [action, setAction] = useState<'thumbsUp' | 'thumbsDown' | null>(null)

    const clickThumbsUp = useCallback(async () => {
        if (action) {
        return
        }

        if (props.conversationId !== "") {
            setAction('thumbsUp')
            await Browser.runtime.sendMessage({
            type: 'FEEDBACK',
            data: {
                conversation_id: props.conversationId,
                message_id: props.messageId,
                rating: 'thumbsUp',
            },
            })
        }
        
    }, [props, action])

    const clickThumbsDown = useCallback(async () => {
        if (action) {
        return
        }
        if (props.conversationId !== "") {
            setAction('thumbsDown')
            await Browser.runtime.sendMessage({
            type: 'FEEDBACK',
            data: {
                conversation_id: props.conversationId,
                message_id: props.messageId,
                rating: 'thumbsDown',
                text: '',
                tags: [],
            },
            })
        }
    
    }, [props, action])

        const clickClose = (siteName: string) => {
            if (siteName === "lab") {
                const toggle = document.querySelector<HTMLElement>('li[data-command="application:toggle-left-area"]')
                if (toggle) {
                    toggle.click()
                }

                const resultContainerParent = document.querySelector<HTMLElement>(siteConfig.resultContainer)
                const resultContainer = resultContainerParent?.querySelector<HTMLElement>(siteConfig.resultContainerChild)

                if (resultContainerParent && resultContainer) {
                    
                        resultContainerParent.classList.add('lm-mod-hidden')
                        resultContainerParent.classList.add('p-mod-hidden')         
                }
            } else if (siteName === "notebook") {
                const resultContainerParent = document.querySelector<HTMLElement>(siteConfig.resultContainer)
                if (resultContainerParent) {
                    resultContainerParent.style.display = 'none'
                }   
            }
        }

    return (
        <div className="gpt-feedback">
            <span
            onClick={clickThumbsUp}
            className={action === 'thumbsUp' ? 'gpt-feedback-selected' : undefined}
            >
            <ThumbsupIcon size={14} />
            </span>
            <span
            onClick={clickThumbsDown}
            className={action === 'thumbsDown' ? 'gpt-feedback-selected' : undefined}
            >
            <ThumbsdownIcon size={14} />
            </span>
            <span
            onClick={() => {clickClose(props.siteName)}}
            style={{marginLeft: '10px'}}
            >
            <XIcon size={14} />
            </span>
        </div>
    )
}

export default memo(ChatGPTFeedback)
