import { Button, Input, useInput, useToasts, Spinner } from '@geist-ui/core';
import { FC, useCallback } from 'react';
import useSWR from 'swr';
import { getProviderConfigs, ProviderType, saveProviderConfigs, getDefaultConfigs, ProviderConfigs } from '../config';


const ApiKeyInput: FC = () => {
  const query = useSWR("provider-configs", async () => {
    const config = await getProviderConfigs();
    return { config };
  });

  if (query.isLoading) {
    return <Spinner />;
  }

  const apiKey = query.data?.config.configs[ProviderType.API]?.apiKey || '';
  const { bindings: apiKeyBindings } = useInput(apiKey);
  const { setToast } = useToasts();

  const save = useCallback(async () => {
    if (!apiKeyBindings.value) {
      alert('Please enter your OpenAI API key');
      return;
    }

    const defaultConfig: ProviderConfigs = await getDefaultConfigs();
    const currentConfigs = query.data?.config.configs || defaultConfig.configs;

    console.log(currentConfigs)

    const updatedConfigs = {
      ...currentConfigs,
      [ProviderType.API]: {
        ...currentConfigs[ProviderType.API],
        apiKey: apiKeyBindings.value,
      },
    };

    await saveProviderConfigs(ProviderType.API, updatedConfigs);

    setToast({ text: 'API key saved', type: 'success' });

    setTimeout(() => {window.location.reload()}, 250); // A temporary hack to reload the page

  }, [apiKeyBindings.value, query.data?.config.configs, setToast]);

    

  return (
    <div className="flex flex-col gap-2">
      <Input style={{ width: '350px' }} htmlType="password" label="API key" {...apiKeyBindings} />
      <span className="italic text-xs py-2">
              You can find or create your API key{' '}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
    </span>
    <div className="text-red-600 font-semibold pb-1 text-xs">
        Warning: the voice features use the OpenAI Whisper API, which charges $0.006 per minute. 
      </div>
      <Button onClick={save} type="success">
        Save API Key
      </Button>
    </div>
  );
};

export default ApiKeyInput;
