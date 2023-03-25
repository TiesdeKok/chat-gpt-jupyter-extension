import { CssBaseline, GeistProvider, Text} from '@geist-ui/core'
import { useState, useEffect } from 'preact/hooks'

import '../base.css'

import logo from '../logo.png'
import ProviderSelect from './ProviderSelect'

function OptionsPage() {

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
