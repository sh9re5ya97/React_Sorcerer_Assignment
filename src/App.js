import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils,Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './App.css';

const DraftEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    // const savedContent = localStorage.getItem('draftEditorContent');
    const savedContent = ''
    return savedContent ? EditorState.createWithContent(JSON.parse(savedContent)) : EditorState.createEmpty();
  });

  useEffect(() => {
    localStorage.setItem('draftEditorContent', JSON.stringify(editorState.getCurrentContent()));
  }, [editorState]);

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
      const newContentState = Modifier.setBlockType(
        currentContent,
        selection,
        'header-one'
      );

      const newContentStateWithoutHash = Modifier.removeRange(
        newContentState,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        'backward'
      );

      setEditorState(EditorState.push(editorState, newContentStateWithoutHash, 'change-block-type'));
      return 'handled';
    }

    if (chars === ' ' && blockText === '*') {
      const newContentState = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 1,
        }),
        'backward'
      );
      const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'BOLD'));
      return 'handled';
    }

    if (chars === ' ' && blockText === '**') {
      const newContentState = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 2,
        }),
        'backward'
      );
      const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'RED'));
      return 'handled';
    }

    if (chars === ' ' && blockText === '*') {
      const newContentState = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: 3,
        }),
        'backward'
      );
      const newEditorState = EditorState.push(editorState, newContentState, 'remove-range');
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, 'UNDERLINE'));
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

  return (
    <div className="editor">
      <Editor
        editorState={editorState}
        onChange={handleChange}
        handleKeyCommand={handleKeyCommand}
        handleBeforeInput={(char) => handleBeforeInput(char, editorState)}
        placeholder="Start typing..."
      />
    </div>
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
    const content = editorState.getCurrentContent();
    localStorage.setItem('editorContent', JSON.stringify(convertToRaw(content)));
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
      <Button editorState={editorState}/>
    </div>
  );
};

export default App;

