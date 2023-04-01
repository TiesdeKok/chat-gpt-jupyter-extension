import React, { Component, useCallback } from 'react';

import audioRecorder from './audioRecorder';
import Browser from 'webextension-polyfill';
import { submit_and_add_question } from './ChatGPTRender';
import { NotebookInterface } from './interface-configs.js';
import { UnmuteIcon, MuteIcon } from '@primer/octicons-react'


interface VoiceRecorderProps {
  siteName: string;
  siteConfig: NotebookInterface;
}

interface VoiceRecorderState {
  isRecording: boolean;
  audioBlobUrl: string | null;
}

const openOptionsPage = () => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' });
  };

const checkAPIKey = async () => {
    return await Browser.runtime.sendMessage({ type: 'CHECK_API_KEY' });
};

class VoiceRecorder extends Component<VoiceRecorderProps, VoiceRecorderState> {
  constructor(props: VoiceRecorderProps) {
    super(props);
    this.state = {
      isRecording: false,
      audioBlobUrl: null,
    };
  }

  handleStartRecording = async () => {
    try {
        const hasAPIKey = await checkAPIKey();
        if (!hasAPIKey) {
            alert("You need to enter your OpenAI key for voice commands to work.");
            openOptionsPage();
            return;
        }
      await audioRecorder.start();
      this.setState({ isRecording: true });
    } catch (err) {
      console.error(err);
    }
  };

  handleStopRecording = async () => {
    try {
      const audioBlob = await audioRecorder.stop();
      const audioBlobUrl = URL.createObjectURL(audioBlob);
      this.setState({ isRecording: false, audioBlobUrl });
      await this.sendToAPI(audioBlob);
    } catch (err) {
      console.error(err);
    }
  };

  handleCancelRecording = () => {
    audioRecorder.cancel();
    this.setState({ isRecording: false });
  };

  blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort();
        reject(new Error('Error reading Blob as data URL.'));
      };
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  };

  sendToAPI = async (audioBlob: Blob) => {
    const dataUrl = await this.blobToDataURL(audioBlob);

    console.log('Sending dataUrl:', dataUrl);

    const port = Browser.runtime.connect({ name: 'transcription' });
    port.postMessage({ type: 'TRANSCRIBE_AUDIO', dataUrl });
    port.onMessage.addListener((msg) => {
      if (msg.event === 'DONE') {
        console.log('Success:', msg.data);

        // Send the transcription result to the AI model
        submit_and_add_question(
          "question",
          this.props.siteConfig,
          this.props.siteName,
          msg.data["text"]
        )

        // Display the transcription result here or update the state
      } else if (msg.error) {
        console.error('Error:', msg.error);
      }
    });
  };

  render() {
    const { isRecording, audioBlobUrl } = this.state;
    const isNotebook = this.props.siteName == "notebook"

    const toggleRecording = () => {
      if (isRecording) {
        this.handleStopRecording();
      } else {
        this.handleStartRecording();
      }
    };

    return (
        <button className="btn btn-default btn-xs chat-gpt-button" onClick={toggleRecording} style= {{marginTop: isNotebook ? '-0.5px' : '4px' }} title="Voice Question">
          {isRecording ? (
            <>
              <span className="recording-icon blink"></span>
              <MuteIcon size='small' className="icon" />
            </>
          ) : (
            <UnmuteIcon size='small' className="icon" />
          )}
        </button>
        
    );
  }
}

export default VoiceRecorder;
