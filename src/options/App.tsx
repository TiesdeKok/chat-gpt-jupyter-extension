import { CssBaseline, GeistProvider, Text, Divider} from '@geist-ui/core'
import { useState, useEffect, useCallback } from 'preact/hooks'
import Browser from 'webextension-polyfill'
import { ToolsIcon } from '@primer/octicons-react'


import '../base.css'

import logo from '../logo.png'
import ProviderSelect from './ProviderSelect'
import ApiKeyInput from './ApiKeyInput' 




function OptionsPage() {

    const openShortcutsPage = useCallback(() => {
        Browser.tabs.create({ url: 'chrome://extensions/shortcuts' })
      }, [])

  return (
    <div className="container mx-auto">
      <nav className="flex flex-row justify-between items-center mt-5 px-2">
        <div className="flex flex-row items-center gap-2">
          <img src={logo} className="w-10 h-10 rounded-lg" />
          <span className="font-semibold">ChatGPT - Jupyter - AI Assistant</span>
        </div>
        <div className="flex flex-row gap-3">
          <a
            href="https://github.com/TiesdeKok/chat-gpt-jupyter-extension"
            target="_blank"
            rel="noreferrer"
          >
            Source code
          </a>
        </div>
      </nav>
      <main className="w-[500px] mx-auto mt-14">
        
        <Text h3 className="mt-5 mb-0">
          Which AI Provider do you want to use?
        </Text>
        <ProviderSelect />

        <Text h3 className="mt-10 mb-0 py-3">
          What is your OpenAI API Key?
        </Text>
        <ApiKeyInput />

        <Divider className="mt-10 mb-5 py-3" />

        <div className="flex flex-row items-center px-1">
            <p className="cursor-pointer leading-[0] italic text-center" onClick={openShortcutsPage}>
                Pro-tip: click here to set keyboard shortcuts {"-->"} <ToolsIcon size={16} /> Shortcuts
            </p>
        </div>
      </main>

      
    </div>
  )
}

function App() {

    const [themeType, setThemeType] = useState('light')

    return (
      <GeistProvider themeType={themeType}>
        <CssBaseline />
        <OptionsPage />
      </GeistProvider>
    )
}

export default App
