import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'

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

const defaultWebClientConfig: WebProviderConfig = { model: "" };
const defaultAPIConfig: APIProviderConfig = { model: "", apiKey: "" };

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const { provider = ProviderType.WebClient } = await Browser.storage.local.get("provider");
  const webClientConfigKey = `provider:${ProviderType.WebClient}`;
  const apiConfigKey = `provider:${ProviderType.API}`;

  const [webClientConfigData, apiConfigData] = await Promise.all([
    Browser.storage.local.get(webClientConfigKey),
    Browser.storage.local.get(apiConfigKey),
  ]);

  return {
    provider: provider,
    configs: {
      [ProviderType.WebClient]: defaults(webClientConfigData[webClientConfigKey], defaultWebClientConfig),
      [ProviderType.API]: defaults(apiConfigData[apiConfigKey], defaultAPIConfig),
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