import React, { useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { GrabberIcon, XIcon } from '@primer/octicons-react';

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

  const handleOpen = () => {
    setIsVisible(true);
  };

  useImperativeHandle(ref, () => ({
    openFloatingInput: handleOpen,
  }));

  // Focus textarea when isVisible changes to true
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isVisible]);

  // Add event listener for Ctrl+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    } else if (e.key === 'Escape') {
        handleClose();
    } 
    e.stopPropagation();
  };
    
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const boxWidth = 600;
  const boxHeight = 300;
  const topPercentage = (windowHeight - boxHeight) / (2 * windowHeight) * 100;
  const leftPercentage = (windowWidth - boxWidth) / (2 * windowWidth) * 100;

  if (!isVisible) {
    return null;
  }
    

  return (
    <div>
    <div className="backdrop" onClick={handleClose}></div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: `${topPercentage}%`,
        left: `${leftPercentage}%`,
        right: 0,
        bottom: 0,
        zIndex: 9999998,
      }}
    >
      <Rnd
        default={{
          x: 0,
          y: 0,
          width: boxWidth,
          height: boxHeight,
        }}
        minWidth={boxWidth / 2}
        minHeight={boxHeight / 2}
      dragHandleClassName='drag-handle'
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
      style = {{zIndex: 9999999}}
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
            onKeyDown={handleKeyDown}
          />
        </div>
        <button onClick={handleSubmit}>Submit (ctrl+Enter)</button>
      </div>
      </Rnd>
    </div>
    </div>
  );
});

export default FloatingInput;