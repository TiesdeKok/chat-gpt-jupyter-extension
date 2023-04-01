// FloatingInput.tsx
import React, { useImperativeHandle, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { GrabberIcon, XIcon } from '@primer/octicons-react';

import { submit_and_add_question } from './ChatGPTRender';


interface FloatingInputProps {
  onSubmit: (inputValue: string) => void;
}

const FloatingInput = React.forwardRef((props: FloatingInputProps, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleSubmit = () => {
    if (textareaRef.current) {
      props.onSubmit(textareaRef.current.value);
      textareaRef.current.value = '';
    setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleOpen = () => { // Add this function
    setIsVisible(true);
  };

// Expose the handleOpen function to the parent component
useImperativeHandle(ref, () => ({
    openFloatingInput: handleOpen,
    }));

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const boxWidth = 600;
  const boxHeight = 300;
  const initialX = (windowWidth - boxWidth) / 2;
  const initialY = (windowHeight - boxHeight) / 2;

  if (!isVisible) {
    return null;
  }

  return (
    <Rnd
      default={{
        x: initialX,
        y: initialY,
        width: boxWidth,
        height: boxHeight,
      }}
      minWidth={boxWidth/2}
      minHeight={boxHeight/2}
      dragHandleClassName="drag-handle"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
      cancel="textarea, button"
      dragGrid={[40, 40]}
      >
      <div className="floating-input-container">
        <div className="top-bar">
          <div className="drag-handle">
            <GrabberIcon size={16} />
          </div>
          <div className="title">Your question or task:</div>
          <div className="close-button" onClick={handleClose}>
            <XIcon size={16} />
          </div>
        </div>
        <div className="textarea-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <textarea
            ref={textareaRef}
            style={{ flex: 1 }}
            placeholder="Type your input"
          />
        </div>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </Rnd>
  );
});

export default FloatingInput;