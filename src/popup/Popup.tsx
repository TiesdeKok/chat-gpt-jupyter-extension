import '@picocss/pico'
import '../base.css'

import { GearIcon, GlobeIcon } from '@primer/octicons-react'
import Browser from 'webextension-polyfill'
import { useCallback } from 'react'
import logo from '../logo.png'

/*
function Popup() {
    const openOptionsPage = useCallback(() => {
        Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
      }, [])

      
  return (
    <div className="container">
        <p className="font-bold" style={{textAlign : "center"}}>ChatGPT - Jupyter - AI Assistant</p>

        <span className="cursor-pointer" onClick={openOptionsPage}>
          <GearIcon size={16} /> Settings
        </span>
        
      <footer>
        <a
          href="https://github.com/TiesdeKok/chat-gpt-jupyter-extension"
          target="_blank"
          rel="noreferrer"
        >
          GitHub Repository
        </a>
      </footer>
    </div>
  )
}

export default Popup
*/

function Popup() {

    const openOptionsPage = useCallback(() => {
        Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
    }, [])

    const openGithub = () => {
        window.open('https://github.com/TiesdeKok/chat-gpt-jupyter-extension', '_blank');
    };


  return (
    <div className="flex flex-col w-200 h-200 min-h-max min-w-max m-4">
        <div className="mb-4 flex flex-row items-center px-1">
            <img src={logo} className="w-5 h-5 rounded-sm" />
            <p className="text-sm font-semibold m-1 ml-2">ChatGPT - Jupyter - AI Assistant</p>
        </div>          

        <div className="grow"></div>

        <div className="flex flex-row items-center px-1">
            <p className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
            <GearIcon size={16} /> Settings
            </p>
        </div>
        <div className="flex flex-row items-center px-1">
            <p className="cursor-pointer leading-[0]" onClick={openGithub}>
            <GlobeIcon size={16} /> Github
            </p>
        </div>

      
    </div>
  )
}

export default Popup