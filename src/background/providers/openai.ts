import { fetchSSE } from '../fetch-sse'
import { GenerateAnswerParams, Provider } from '../types'

export class OpenAIProvider implements Provider {
  constructor(private token: string, private model: string) {
    this.token = token
    this.model = model
  }

  async generateAnswer(params: GenerateAnswerParams) {
    let endpoint = 'https://api.openai.com/v1/chat/completions'
    let model_type = "chat"

    if (this.model === "text-davinci-003") {
        endpoint = 'https://api.openai.com/v1/completions'
        model_type = "completion"
    }
    
    let json_body;
    if (model_type === "chat") {
        json_body = JSON.stringify({
            model: this.model,
            messages: [
                {
                    "role" : "user",
                    "content" : params.prompt,
                }
            ],
            
            stream: true,
            max_tokens: 3072,
          })
    } else {
        json_body = JSON.stringify({
            model: this.model,
            prompt: params.prompt,
            stream: true,
            max_tokens: 2048,
        })
    }

    let result = ''
    await fetchSSE(endpoint, {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: json_body,
      onMessage: (message) => {
        console.debug('sse message', message)
        if (message === '[DONE]') {
          params.onEvent({ type: 'done' })
          return
        }
        let data
        try {
            
          data = JSON.parse(message)

          let text;
          if (model_type === "chat") {
            text = data.choices[0].delta.content
          } else { 
            text = data.choices[0].text
          }
          
          if (text === '<|im_end|>' || text === '<|im_sep|>') {
            return
          }
          if (text) {
            result += text
            params.onEvent({
              type: 'answer',
              data: {
                text: result,
                messageId: data.id,
                conversationId: data.id,
                model: this.model,
                provider: 'OpenAI API'
              },
            })
          }
          
        } catch (err) {
          console.error(err)
          return
        }
      },
    })
    return {}
  }
}
