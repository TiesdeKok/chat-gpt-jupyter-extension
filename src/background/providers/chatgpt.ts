import { v4 as uuidv4 } from 'uuid'
import ExpiryMap from 'expiry-map'
import { fetchSSE } from '../fetch-sse'
import { GenerateAnswerParams, Provider } from '../types'

async function request(token: string, method: string, path: string, data?: unknown) {
    return fetch(`https://chat.openai.com/backend-api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: data === undefined ? undefined : JSON.stringify(data),
    })
  }
  

export async function sendMessageFeedback(token: string, data: unknown) {
  await request(token, 'POST', '/conversation/message_feedback', data)
}

export async function setConversationProperty(
  token: string,
  conversationId: string,
  propertyObject: object,
) {
  await request(token, 'PATCH', `/conversation/${conversationId}`, propertyObject)
}

const KEY_ACCESS_TOKEN = 'accessToken'

const cache = new ExpiryMap(10 * 1000)

export async function getChatGPTAccessToken(): Promise<string> {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN)
  }
  const resp = await fetch('https://chat.openai.com/api/auth/session')
  if (resp.status === 403) {
    throw new Error('CLOUDFLARE')
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.accessToken) {
    throw new Error('UNAUTHORIZED')
  }
  cache.set(KEY_ACCESS_TOKEN, data.accessToken)
  return data.accessToken
}

export class ChatGPTProvider implements Provider {
  constructor(private token: string, private model: string) {
    this.token = token
    this.model = model || ''
  }

  public async fetchModels(): Promise<
    { slug: string; title: string; description: string; max_tokens: number }[]
  > {
    const resp = await request(this.token, 'GET', '/models').then((r) => r.json())
    return resp.models
  }

  public async getModelNames(): Promise<string[]> {
    try {
      const models = await this.fetchModels()
      return models.map((model) => model.slug)
    } catch (err) {
      console.error(err)
      return ['text-davinci-002-render', "gpt-4"]
    }
  }

  async initialize(): Promise<void> {
    if (!this.model) {
      try {
        const modelNames = await this.getModelNames();
        this.model = modelNames[0];
      } catch (err) {
        console.error('Error fetching model names:', err);
      }
    }
  }

  async generateAnswer(params: GenerateAnswerParams) {
    await this.initialize()

    let conversationId: string | undefined

    const cleanup = () => {
      if (conversationId) {
        setConversationProperty(this.token, conversationId, { is_visible: false })
      }
    }

    //const modelName = await this.getModelName()
    console.log('Using model:', this.model)

    await fetchSSE('https://chat.openai.com/backend-api/conversation', {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        action: 'next',
        messages: [
          {
            id: uuidv4(),
            role: 'user',
            content: {
              content_type: 'text',
              parts: [params.prompt],
            },
          },
        ],
        model: this.model,
        parent_message_id: uuidv4(),
      }),
      onMessage: (message) => {
        console.debug('sse message', message)
        if (message === '[DONE]') {
          params.onEvent({ type: 'done' })
          cleanup()
          return
        }
        let data
        try {
          data = JSON.parse(message)
        } catch (err) {
          //console.error(err)
          return
        }
        const text = data.message?.content?.parts?.[0]
        if (text) {
          conversationId = data.conversation_id
          params.onEvent({
            type: 'answer',
            data: {
              text,
              messageId: data.message.id,
              conversationId: data.conversation_id,
              model: this.model,
              provider: 'ChatGPT App'
            },
          })
        }
      },
    })
    return { cleanup }
  }
}