import {
    Button,
    Select,
    Tabs,
    useToasts,
    Spinner
  } from "@geist-ui/core";
  import { FC, useCallback, useState, useEffect } from "react";
  import {
    getProviderConfigs,
    ProviderConfigs,
    ProviderType,
    saveProviderConfigs,
    loadModels,
    getDefaultConfigs,
  } from "../config";
  
  interface ConfigProps {
    config: ProviderConfigs;
    models: Record<ProviderType, string[]>;
  }
  
  const ConfigPanel: FC<ConfigProps> = ({ config, models }) => {
    const [tab, setTab] = useState<ProviderType>(
      config.provider ?? ProviderType.WebClient
    );
    const [APIModel, setAPIModel] = useState(
      config.configs[ProviderType.API]?.model ?? models[ProviderType.API][0]
    );
    const [WebModel, setWebModel] = useState(
      config.configs[ProviderType.WebClient]?.model ??
        models[ProviderType.WebClient][0]
    );
    const { setToast } = useToasts();
  
    const save = useCallback(async () => {
      if (tab === ProviderType.API) {
        if (!config.configs[ProviderType.API]?.apiKey) {
          alert("Not saved! - Please first enter your OpenAI API key below.");
          return;
        }
        if (!APIModel || !models[ProviderType.API].includes(APIModel)) {
          alert("Please select a valid model");
          return;
        }
      }
      await saveProviderConfigs(tab, {
        [ProviderType.API]: {
          model: APIModel,
          apiKey: config.configs[ProviderType.API]?.apiKey,
        },
        [ProviderType.WebClient]: {
          model: WebModel,
        },
      });
      setToast({ text: "Changes saved", type: "success" });
    }, [APIModel, WebModel, models, setToast, tab, config.configs]);
  
    return (
    <div className="flex flex-col gap-3">
      <div className="text-red-600 font-semibold py-2">
        You might not see all your models until you authenticate with OpenAI. You can do so by using the extension once. 
      </div>
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
            </div>
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
    const [config, setConfig] = useState<ProviderConfigs | null>(null);
    const [models, setModels] = useState<Record<ProviderType, string[]> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    const fetchConfigsAndModels = async () => {
      try {
        const [providerConfig, modelsData] = await Promise.all([getProviderConfigs(), loadModels()]);
        const defaultConfig = await getDefaultConfigs();
        setConfig(providerConfig || defaultConfig);
        setModels(modelsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching provider configs and models:', error);
      }
    };
  
    useEffect(() => {
      fetchConfigsAndModels();
    }, []);
  
    if (isLoading) {
      return <Spinner />;
    }
  
    if (!models || !config) {
      throw new Error('Unable to load models or config');
    }
  
    return <ConfigPanel config={config} models={models} />;
  }
  
  export default ProviderSelect;