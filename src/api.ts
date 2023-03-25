const API_HOST = 'https://www.tiesdekok.com/'


export async function fetchExtensionConfigs(): Promise<{
    client_model_names: string[]
    api_model_names: string[]  
}> {
  return fetch(`${API_HOST}/config.json`, {
  }).then((r) => r.json())
}
