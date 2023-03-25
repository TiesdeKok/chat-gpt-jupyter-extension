import { Button, Input, Select, Spinner, Tabs, useInput, useToasts } from '@geist-ui/core'
import { FC, useCallback, useState } from 'react'
import useSWR from 'swr'
import { fetchExtensionConfigs } from '../api'
import { getProviderConfigs, ProviderConfigs, ProviderType, saveProviderConfigs } from '../config'
import { ChatGPTProvider, getChatGPTAccessToken } from '../background/providers/chatgpt'

interface ConfigProps {
  config: ProviderConfigs
  models: Record<ProviderType, string[]>
}

async function loadModels(): Promise<Record<ProviderType, string[]>> {
    const configs = await fetchExtensionConfigs()
  
    const token = await getChatGPTAccessToken()
    const chatGPTProvider = new ChatGPTProvider(token, '')
    const webClientModelNames = await chatGPTProvider.getModelNames().catch((err) => {
      console.error(err)
      return configs.client_model_names
    })
  
    return {
      [ProviderType.API]: configs.api_model_names,
      [ProviderType.WebClient]: webClientModelNames,
    }
  }

const ConfigPanel: FC<ConfigProps> = ({ config, models }) => {
    const [tab, setTab] = useState<ProviderType>(config.provider ?? ProviderType.WebClient)
  const { bindings: apiKeyBindings } = useInput(config.configs[ProviderType.API]?.apiKey ?? '')
  const [APIModel, setAPIModel] = useState(config.configs[ProviderType.API]?.model ?? models[ProviderType.API][0])
  const [WebModel, setWebModel] = useState(config.configs[ProviderType.WebClient]?.model ?? models[ProviderType.WebClient][0])
  const { setToast } = useToasts()

  const save = useCallback(async () => {
    if (tab === ProviderType.API) {
      if (!apiKeyBindings.value) {
        alert('Please enter your OpenAI API key')
        return
      }
      if (!APIModel || !models[ProviderType.API].includes(APIModel)) {
        alert('Please select a valid model')
        return
      }
    }
    await saveProviderConfigs(tab, {
      [ProviderType.API]: {
        model: APIModel,
        apiKey: apiKeyBindings.value,
      },
      [ProviderType.WebClient]: {
        model: WebModel,
      },
    })
    setToast({ text: 'Changes saved', type: 'success' })
  }, [apiKeyBindings.value, APIModel, WebModel, models, setToast, tab])

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={tab} onChange={(v) => setTab(v as ProviderType)}>
        <Tabs.Item label="ChatGPT webapp" value={ProviderType.WebClient}>
          The unofficial, free, API through the ChatGPT webapp.<br/>
          <span className="font-semibold">What model do you want to use?</span>
          <div className="flex flex-row gap-2 mt-2">
            <Select
              scale={2 / 3}
              value={WebModel}
              onChange={(v) => setWebModel(v as string)}
              placeholder="model"
            >
              {models[ProviderType.WebClient].map((m) => (
                <Select.Option key={m} value={m}>
                  {m}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Tabs.Item>
        <Tabs.Item label="OpenAI API" value={ProviderType.API}>
          <div className="flex flex-col gap-2">
            <span>
              OpenAI official API:{' '}
              <span className="font-semibold">you will be charged per use!</span>
            </span>
            <div className="flex flex-row gap-2">
              <Select
                scale={2 / 3}
                value={APIModel}
                onChange={(v) => setAPIModel(v as string)}
                placeholder="model"
              >
                {models[ProviderType.API].map((m) => (
                  <Select.Option key={m} value={m}>
                    {m}
                  </Select.Option>
                ))}
              </Select>
              <Input htmlType="password" label="API key" scale={2 / 3} {...apiKeyBindings} />
            </div>
            <span className="italic text-xs">
              You can find or create your API key{' '}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
            </span>
          </div>
        </Tabs.Item>
      </Tabs>
      <Button scale={2 / 3} ghost style={{ width: 250 }} type="success" onClick={save}>
        Save and activate as current provider
      </Button>
    </div>
  )
}

function ProviderSelect() {
    const query = useSWR("provider-configs", async () => {
        const [config, models] = await Promise.all([getProviderConfigs(), loadModels()]);
        return { config, models };
    });
    
    if (query.isLoading) {
        return <Spinner />;
    }

    
    const models = query.data?.models || {
        [ProviderType.WebClient]: [],
        [ProviderType.API]: [],
    };
    
    const defaultConfig: ProviderConfigs = {
        provider: ProviderType.WebClient,
        configs: {
        [ProviderType.WebClient]: { model: models[ProviderType.WebClient][0] },
        [ProviderType.API]: { model: models[ProviderType.API][0], apiKey: "" },
        },
    };

    const config = query.data?.config || defaultConfig;
    
    
    return <ConfigPanel config={config} models={models} />;
}
    
export default ProviderSelect;


/*
function ProviderSelect() {
  const query = useSWR("provider-configs", async () => {
    const [config, models] = await Promise.all([getProviderConfigs(), loadModels()]);
    return { config, models };
  });

  if (query.isLoading ) {
    return <Spinner />;
  }

  const defaultConfig: ProviderConfigs = {
    provider: ProviderType.WebClient,
    configs: {
      [ProviderType.WebClient]: { model: "" },
      [ProviderType.API]: { model: "", apiKey: "" },
    },
  };

  const config = query.data!.config || defaultConfig;
  const models = query.data!.models || {
    [ProviderType.WebClient]: [],
    [ProviderType.API]: [],
  };

  // Set the first respective item in models if the config has an empty string for the model
  if (config.configs[ProviderType.WebClient]?.model === "") {
    config.configs[ProviderType.WebClient].model = models[ProviderType.WebClient][0];
  }
  if (config.configs[ProviderType.API]?.model === "") {
    config.configs[ProviderType.API].model = models[ProviderType.API][0];
  }

  return <ConfigPanel config={config} models={models} />;
}

  export default ProviderSelect;
  */