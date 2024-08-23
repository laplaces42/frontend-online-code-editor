import { ExplorerDisplay } from "./ExplorerDisplay";

export function FileExplorer({
  entries,
  newItem,
  toggleFile,
  toggleFolder,
  selectedFile,
  setNewItem,
  newEntry,
  saveProject,
  lastSave,
  userData,
  newFile,
  setNewFile,
  togglePages,
  findParent,
  handleRemoveFile,
  updateChildren,
  setEntries,
  saveLog,
  setSaveLog,
  sessionLog,
  setSessionLog,
}) {
  return (
    <div className="file-explorer-container">
      <button className="new-button" onClick={() => setNewFile(true)}>
        +
      </button>
      <div className="file-explorer">
        <div className="new-entry-menu"></div>
        {newFile && (
          <div onClick={() => setNewFile(false)} className="screen-dim"></div>
        )}

        <ul className="editor-files">
          {entries.map((entry) => (
            <ExplorerDisplay
              key={entry.id}
              entry={entry}
              toggleFile={toggleFile}
              toggleFolder={toggleFolder}
              selectedFile={selectedFile}
              togglePages={togglePages}
              findParent={findParent}
              handleRemoveFile={handleRemoveFile}
              newEntry={newEntry}
              updateChildren={updateChildren}
              setEntries={setEntries}
              saveLog={saveLog}
              setSaveLog={setSaveLog}
              sessionLog={sessionLog}
              setSessionLog={setSessionLog}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
