import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'
import { fetchExtensionConfigs } from './api'
import { ChatGPTProvider, getChatGPTAccessToken } from './background/providers/chatgpt'

const userConfigWithDefaultValue = {
}

export type UserConfig = typeof userConfigWithDefaultValue

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates: Partial<UserConfig>) {
  console.debug('update configs', updates)
  return Browser.storage.local.set(updates)
}

export enum ProviderType {
  WebClient = 'browser',
  API = 'api',
}

interface APIProviderConfig {
  model: string
  apiKey: string
}

interface WebProviderConfig {
  model: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.WebClient]: WebProviderConfig,
    [ProviderType.API]: APIProviderConfig
  }
}

export async function getProviderConfigs(): Promise<ProviderConfigs> {
    const { provider = ProviderType.WebClient } = await Browser.storage.local.get("provider");
    const webClientConfigKey = `provider:${ProviderType.WebClient}`;
    const apiConfigKey = `provider:${ProviderType.API}`;
  
    const [webClientConfigData, apiConfigData] = await Promise.all([
      Browser.storage.local.get(webClientConfigKey),
      Browser.storage.local.get(apiConfigKey),
    ]);
  
    // Get default configs
    const defaultConfigs = await getDefaultConfigs();
  
    return {
      provider: provider,
      configs: {
        [ProviderType.WebClient]: defaults(
          webClientConfigData[webClientConfigKey],
          defaultConfigs.configs[ProviderType.WebClient]
        ),
        [ProviderType.API]: defaults(
          apiConfigData[apiConfigKey],
          defaultConfigs.configs[ProviderType.API]
        ),
      },
    };
  }
  
export async function saveProviderConfigs(
  provider: ProviderType,
  configs: ProviderConfigs['configs'],
) {
  return Browser.storage.local.set({
    provider: provider,
    [`provider:${ProviderType.WebClient}`]: configs[ProviderType.WebClient],
    [`provider:${ProviderType.API}`]: configs[ProviderType.API]
  })
}

export async function loadModels(): Promise<Record<ProviderType, string[]>> {
    const configs = await fetchExtensionConfigs()
  
    const token = await getChatGPTAccessToken()
    const chatGPTProvider = new ChatGPTProvider(token, '')
    let webClientModelNames = await chatGPTProvider.getModelNames().catch((err) => {
      console.error(err)
      return []
    })
  
    if (webClientModelNames.length === 0) {
      webClientModelNames = configs.client_model_names
    }
  
    let apiModelNames = configs.api_model_names
  
    if (apiModelNames.length === 0) {
      apiModelNames = ['gpt-3.5-turbo']
    }

    if ( webClientModelNames.length === 0) {
        webClientModelNames = ['text-davinci-002-render']
    }

    //console.log("API MODELS:", apiModelNames)
    //console.log("Web MODELS:", webClientModelNames)
  
    return {
      [ProviderType.API]: apiModelNames,
      [ProviderType.WebClient]: webClientModelNames,
    }
  }

  // Function to get default configs

  export async function getDefaultConfigs(): Promise<ProviderConfigs> {
    const models = await loadModels();
    
    if (!models) {
      throw new Error('Unable to load models');
    }

    //console.log(models[ProviderType.WebClient][0])
  
    const defaultConfig: ProviderConfigs = {
      provider: ProviderType.WebClient,
      configs: {
        [ProviderType.WebClient]: { model: models[ProviderType.WebClient][0] },
        [ProviderType.API]: { model: models[ProviderType.API][0], apiKey: "" },
      },
    };
  
    return defaultConfig;
  }
  