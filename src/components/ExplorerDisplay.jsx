import { useState } from "react";

export function ExplorerDisplay({
  entry,
  toggleFile,
  toggleFolder,
  selectedFile,
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
  const [editFile, setEditFile] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("root");
  const [fileTitle, setFileTitle] = useState(entry.title);
  const [fileMove, setFileMove] = useState(false);

  function moveEntry(folder) {
    if (entry.title !== "") {
      const moveEntry = {
        id: entry.id,
        title: entry.title,
        type: entry.type,
        isOpen: entry.isOpen,
        value: entry.value,
        children: entry.children,
      };

      handleRemoveFile(entry.id);

      if (folder !== "root") {
        setSaveLog([
          ...saveLog,
          { type: "move", change: moveEntry, parent: folder },
        ]);
        setSessionLog([
          ...sessionLog,
          { type: "move", change: moveEntry, parent: folder },
        ]);
        updateChildren(folder, moveEntry);
      } else {
        setSaveLog([
          ...saveLog,
          { type: "move", change: moveEntry, parent: null },
        ]);
        setSessionLog([
          ...sessionLog,
          { type: "move", change: moveEntry, parent: null },
        ]);
        setEntries((currentEntries) => {
          return [...currentEntries, moveEntry];
        });
      }

      if (entry.type === "file") {
        toggleFile(entry.id);
      }
    }
  }

  function handleModifyEntry(title) {
    if (entry.title !== title) {
      entry.title = title;
      setSaveLog([
        ...saveLog,
        {
          type: "rename",
          change: entry,
          parent: findParent(entry.id) ? findParent(entry.id).id : null,
        },
      ]);
      setSessionLog([
        ...sessionLog,
        {
          type: "rename",
          change: entry,
          parent: findParent(entry.id) ? findParent(entry.id).id : null,
        },
      ]);
    }
    if (fileMove) {
      moveEntry(currentFolder);
      setFileMove(false);
    }
    setEditFile(false);
  }

  function handleDelete(entry, saveChanges = [], sessionChanges = []) {
    const parent = findParent(entry.id) ? findParent(entry.id).id : null;
    saveChanges.push({
      type: "remove",
      change: entry,
      parent: parent,
    });
    sessionChanges.push({
      type: "remove",
      change: entry,
      parent: parent,
    });
    if (entry.children && entry.children.length !== 0) {
      for (const child of entry.children) {
        handleDelete(child, saveChanges, sessionChanges);
      }
    }
    setSaveLog([...saveLog, ...saveChanges]);
    setSessionLog([...sessionLog, ...sessionChanges]);

    handleRemoveFile(entry.id);
  }

  if (entry.type === "file") {
    return (
      <div
        className={`${
          entry.id === selectedFile ? "file-button-selected" : "file-button"
        }`}
      >
        <li
          key={entry.id}
          className={entry.type}
          onClick={() => {
            if (!editFile) {
              toggleFile(entry.id);
            }
          }}
        >
          <button>{fileTitle}</button>
          <div className="edit-buttons">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditFile(true);
              }}
              className="file-rename-button"
            >
              &#9998;
            </button>
            {editFile && (
              <>
                <div
                  onClick={() => setEditFile(false)}
                  className="screen-dim"
                ></div>
                <div className="modal">
                  <p className="modal-title">Edit File</p>
                  <div className="modal-row">
                    <input
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      type="text"
                      className="modal-input"
                      placeholder="Enter name here:"
                    />
                    <select
                      name="folder-select"
                      id="folder-select"
                      className="folder-dropdown"
                      defaultValue={
                        findParent(entry.id) ? findParent(entry.id).id : "root"
                      }
                      onChange={(e) => {
                        setCurrentFolder(e.target.value);
                        setFileMove(true);
                      }}
                    >
                      <option>root</option>
                      {togglePages("")
                        .filter((page) => page.type === "folder")
                        .map((folder) => (
                          <option value={folder.id}>{folder.title}</option>
                        ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleModifyEntry(fileTitle)}
                    className="confirm-button"
                  >
                    Confirm Changes
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(entry);
                    }}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </li>
      </div>
    );
  } else if (entry.type === "folder") {
    return (
      <li key={entry.id} className={entry.type}>
        <div className="folder-button">
          <button onClick={() => toggleFolder(entry.id)}>
            {entry.isOpen ? `${entry.title} ↓` : `${entry.title} →`}
          </button>
          <div className="edit-buttons">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditFile(true);
              }}
              className="file-rename-button"
            >
              &#9998;
            </button>
            {editFile && (
              <>
                <div
                  onClick={() => setEditFile(false)}
                  className="screen-dim"
                ></div>
                <div className="modal">
                  <p className="modal-title">Edit Folder</p>
                  <div className="modal-row">
                    <input
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      type="text"
                      className="modal-input"
                      placeholder="Enter name here:"
                    />
                    <select
                      name="folder-select"
                      id="folder-select"
                      className="folder-dropdown"
                      defaultValue={
                        findParent(entry.id) ? findParent(entry.id).id : "root"
                      }
                      onChange={(e) => {
                        setCurrentFolder(e.target.value);
                        setFileMove(true);
                      }}
                    >
                      <option>root</option>
                      {togglePages("")
                        .filter(
                          (page) =>
                            page.type === "folder" && page.title !== fileTitle
                        )
                        .map((folder) => (
                          <option value={folder.id}>{folder.title}</option>
                        ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleModifyEntry(fileTitle)}
                    className="confirm-button"
                  >
                    Confirm Changes
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(entry);
                    }}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {entry.isOpen && entry.children.length !== 0 && (
          <ul className="folder-contents">
            {entry.children.map((child) => (
              <ExplorerDisplay
                key={child.id}
                entry={child}
                toggleFile={toggleFile}
                toggleFolder={toggleFolder}
                selectedFile={selectedFile}
                togglePages={togglePages}
                findParent={findParent}
                handleRemoveFile={handleRemoveFile}
                updateChildren={updateChildren}
                setEntries={setEntries}
                saveLog={saveLog}
                setSaveLog={setSaveLog}
                sessionLog={sessionLog}
                setSessionLog={setSessionLog}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }
}
