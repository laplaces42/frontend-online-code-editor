export function TextEditor({ entries, selectedFile,  displayEditors}) {
  

  return (<div className="text-editor-container">{displayEditors(entries)}</div>);
}
