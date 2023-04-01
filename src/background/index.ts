import Browser from 'webextension-polyfill'
import { getProviderConfigs, ProviderType } from '../config'
import { ChatGPTProvider, getChatGPTAccessToken, sendMessageFeedback } from './providers/chatgpt'
import { OpenAIProvider } from './providers/openai'
import { Provider } from './types'
import { Buffer } from 'buffer'

async function generateAnswers(port: Browser.Runtime.Port, question: string) {
    const providerConfigs = await getProviderConfigs()
  
    let provider: Provider
    if (providerConfigs.provider === ProviderType.WebClient) {
      const token = await getChatGPTAccessToken()
      const model = providerConfigs.configs[ProviderType.WebClient]?.model
      provider = new ChatGPTProvider(token, model)
    } else if (providerConfigs.provider === ProviderType.API) {
      const { apiKey, model } = providerConfigs.configs[ProviderType.API]!
      provider = new OpenAIProvider(apiKey, model)
    } else {
      throw new Error(`Unknown provider ${providerConfigs.provider}`)
    }
  
    const controller = new AbortController()
    port.onDisconnect.addListener(() => {
      controller.abort()
      cleanup?.()
    })
  
    const { cleanup } = await provider.generateAnswer({
      prompt: question,
      signal: controller.signal,
      onEvent(event) {
        console.log("debug")
        if (event.type === 'done') {
          port.postMessage({ event: 'DONE' })
          return
        }
        port.postMessage(event.data)
      },
    })
}

function dataURLtoBlob(dataUrl: string): Blob {
    const base64Regex = /^data:.+\/(.+);base64,(.*)$/;
    const match = dataUrl.match(base64Regex);
    if (!match) {
      throw new Error('Invalid data URL format');
    }
  
    const mimeString = match[1];
    const base64Data = match[2];
    const byteString = Buffer.from(base64Data, 'base64').toString('binary');
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

async function transcribeAudio(port: Browser.Runtime.Port, dataUrl: string) {
    const providerConfigs = await getProviderConfigs();

    const { apiKey } = providerConfigs.configs[ProviderType.API]!;
    if (!apiKey) {
        throw new Error('No API token available. Please add it in the config.');
    }

    const provider = new OpenAIProvider(apiKey, 'whisper-1');
    const audioBlob = dataURLtoBlob(dataUrl);
    const audioFile = new File([audioBlob], 'recorded_audio.wav', { type: 'audio/wav' });

    try {
        const data = await provider.transcribeAudio(audioFile);
        port.postMessage({ event: 'DONE', data });
    } catch (err: any) {
        console.error(err);
        port.postMessage({ error: err.message });
    }
}

Browser.runtime.onConnect.addListener((port) => {
port.onMessage.addListener(async (msg) => {
    console.debug('received msg', msg);
    try {
    if (msg.type === 'GENERATE_ANSWERS') {
        await generateAnswers(port, msg.question);
    } else if (msg.type === 'TRANSCRIBE_AUDIO') {
        console.log("received", msg.dataUrl)
        await transcribeAudio(port, msg.dataUrl);
    }
    } catch (err: any) {
    console.error(err);
    port.postMessage({ error: err.message });
    }
});
});

Browser.runtime.onMessage.addListener(async (message) => {
if (message.type === 'FEEDBACK') {
    const token = await getChatGPTAccessToken()
    await sendMessageFeedback(token, message.data)
} else if (message.type === 'OPEN_OPTIONS_PAGE') {
    Browser.runtime.openOptionsPage()
} else if (message.type === 'GET_ACCESS_TOKEN') {
    return getChatGPTAccessToken()
}  else if (message.type === 'CHECK_API_KEY') {
    const providerConfigs = await getProviderConfigs();
    const { apiKey } = providerConfigs.configs[ProviderType.API]!;
    return !!apiKey;
}
})

Browser.runtime.onInstalled.addListener((details) => {
if (details.reason === 'install') {
    Browser.runtime.openOptionsPage()
}
})