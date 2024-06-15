import React, { useState, useEffect } from 'react';

import { Editor, EditorState, RichUtils,Modifier,convertToRaw,convertFromRaw,DefaultDraftBlockRenderMap  } from 'draft-js';
import Immutable from 'immutable';
import 'draft-js/dist/Draft.css';
import './App.css';

const DraftEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem('draftEditorContent');
    const myEditorState=EditorState.createEmpty();
    return savedContent ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent))) : myEditorState;
  });


  const BLOCK_TYPE_BOLD = 'bold';
  const BLOCK_TYPE_UNDERLINE = 'underline';
  const BLOCK_TYPE_RED = 'red';

  const blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === BLOCK_TYPE_BOLD) {
      return 'bold-block'; // CSS class name for your custom block
    }
    if (type === BLOCK_TYPE_UNDERLINE) {
      return 'underline-block'; // CSS class name for your custom block
    }
    if (type === BLOCK_TYPE_RED) {
      return 'red-block'; // CSS class name for your custom block
    }
  };


  const blockRenderMap = Immutable.Map({
    [BLOCK_TYPE_BOLD]: {
      element: 'blockbold',
      wrapper: <blockbold className="bold-block" />, // JSX element or string for block wrapper
    },
    [BLOCK_TYPE_UNDERLINE]: {
      element: 'blockunderline',
      wrapper: <blockunderline className="underline-block" />, // JSX element or string for block wrapper
    },
    [BLOCK_TYPE_RED]: {
      element: 'blockred',
      wrapper: <blockred className="red-block" />, // JSX element or string for block wrapper
    }
  });

  const handleChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const handleBeforeInput = (chars, editorState) => {
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = currentContent.getBlockForKey(blockKey);
    const blockText = block.getText();

    if (chars === ' ' && blockText === '#') {
      

      const newContentStateWithoutHash = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        'backward'
      );

      const newContentState = Modifier.setBlockType(
        newContentStateWithoutHash,
        newContentStateWithoutHash.getSelectionAfter(),
        'header-one'
      );

      setEditorState(EditorState.push(editorState, newContentState, 'change-block-type'));
      return 'handled';
    }

    if (chars === ' ' && blockText === '*') {
      const newContentStateWithoutStar = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        'backward'
      );
      const newContentState = Modifier.setBlockType(
        newContentStateWithoutStar,
        newContentStateWithoutStar.getSelectionAfter(),
        BLOCK_TYPE_BOLD
      );
      setEditorState(EditorState.push(editorState, newContentState, 'change-block-type'));
      return 'handled';
    }

    if (chars === ' ' && blockText === '**') {
      const newContentStateWithoutStar2 = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        'backward'
      );
      const newContentState = Modifier.setBlockType(
        newContentStateWithoutStar2,
        newContentStateWithoutStar2.getSelectionAfter(),
        BLOCK_TYPE_RED
      );
      setEditorState(EditorState.push(editorState, newContentState, 'change-block-type'));
      return 'handled';
    }

    if (chars === ' ' && blockText === '***') {
      const newContentStateWithoutStar3 = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        'backward'
      );
      const newContentState = Modifier.setBlockType(
        newContentStateWithoutStar3,
        newContentStateWithoutStar3.getSelectionAfter(),
        BLOCK_TYPE_UNDERLINE
      );
      setEditorState(EditorState.push(editorState, newContentState, 'change-block-type'));
      return 'handled';
    }

    if (chars === ' ' && blockText === '```') {
      const newContentState = Modifier.setBlockType(
        currentContent,
        selection,
        'code-block'
      );

      const newContentStateWithoutBackticks = Modifier.removeRange(
        newContentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        'backward'
      );

      setEditorState(EditorState.push(editorState, newContentStateWithoutBackticks, 'change-block-type'));
      return 'handled';
    }

    return 'not-handled';
  };






  const handleReturn = (e, editorState) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();

    const newContentState = Modifier.splitBlock(
      currentContent,
      selection
    );

    const newEditorState = EditorState.push(editorState, newContentState, 'split-block');
    

        // Change the new block type to 'unstyled'
    const newSelection = newEditorState.getSelection();
    const newContentStateWithUnstyled = Modifier.setBlockType(
      newEditorState.getCurrentContent(),
      newSelection,
      'unstyled'
    );

    // // Remove all inline styles from the new block
    // const blockKey = newContentStateWithUnstyled.getSelectionAfter().getStartKey();
    // const blockLength = newContentStateWithUnstyled.getBlockForKey(blockKey).getLength();
    // // const blockSelection = SelectionState.createEmpty(blockKey).merge({
    // //   anchorOffset: 0,
    // //   focusOffset: blockLength,
    // // });

    // const finalContentState = Modifier.applyInlineStyle(
    //   newContentStateWithUnstyled,
    //   newSelection,
    //   'UNDERLINE'
    // );


    const finalEditorState = EditorState.push(newEditorState, newContentStateWithUnstyled, 'change-block-type');
    setEditorState(finalEditorState);

    return 'handled';
  };



  return (
    <>
    <div className="editor">
      <Editor
        editorState={editorState}
        onChange={handleChange}
        handleKeyCommand={handleKeyCommand}
        handleReturn={handleReturn}
        handleBeforeInput={(char) => handleBeforeInput(char, editorState)}
        blockStyleFn={blockStyleFn}
        blockRenderMap={DefaultDraftBlockRenderMap.merge(blockRenderMap)}
        placeholder="Start typing..."
      />
    </div>
      <Button editorState={editorState}/>
      </>
  );
};

const Title = () => {
  return (
    <div className="title">
      <h1>Demo Editor by Shreya</h1>
    </div>
  );
};

const Button = ({editorState}) => {

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const serializedContent = JSON.stringify(convertToRaw(contentState));
    // EditorState.createWithContent(convertFromRaw(JSON.parse(serializedContent)));
    localStorage.setItem('draftEditorContent', serializedContent);
    alert('Content saved!');
  };

  return (
    <div className="button">
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

const App = () => {
  return (
    <div className="app">
      <Title />
      <DraftEditor />
    </div>
  );
};

export default App;

