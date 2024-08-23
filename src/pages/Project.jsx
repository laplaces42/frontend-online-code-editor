import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import "./style.css";
import { FileExplorer } from "../components/FileExplorer";
import { TextEditor } from "../components/TextEditor";
import { Frame } from "../components/Frame";
import ProjectNav from "../components/ProjectNav";
// import Navbar  from "../components/Navbar";

function Project() {
  const htmlText = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>

</body>
</html>`;
  const { id } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [files, setFiles] = useState([]);
  const [entries, setEntries] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const [lastHTMLFile, setLastHTMLFile] = useState();
  const [showHtmlPages, setShowHtmlPages] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("root");
  const [lastFiles, setLastFiles] = useState([]);
  const [userData, setUserData] = useState();
  const [lastSave, setLastSave] = useState();
  const [editorOpen, setEditorOpen] = useState(true);
  const [newFile, setNewFile] = useState(false);
  const [fileSelected, setFileSelected] = useState(true);
  const [saveLog, setSaveLog] = useState([]);
  const [sessionLog, setSessionLog] = useState([]);
  // const backendURL = "https://backend-online-code-editor-production.up.railway.app/"
  const backendURL = process.env.BACKEND_URL
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch(`${backendURL}/projects/${id}`);
        const data = await result.json();
        setUserData(data.data.account);
        setProjectData(data.data.project);
        setLastSave(data.data.project.updatedAt);
        setFiles(data.data.files);
      } catch (err) {
        console.error("Error fetching project data:", err);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const loadFiles = async () => {
      if (files.length > 0) {
        await prepareFiles({ parent: null, oldFiles: files });
      }

      let starterFile = entries.find((entry) => entry.title === "index.html");
      if (starterFile) {
        setSelectedFile(starterFile.id);
        setLastHTMLFile(starterFile.id);
      }
    };

    loadFiles();
    if (lastFiles.length !== 0) {
      const selectedFileEntry = files.find(
        (entry) => entry.name === lastFiles[0]
      );
      const lastHTMLFileEntry = files.find(
        (entry) => entry.name === lastFiles[1]
      );

      if (selectedFileEntry) {
        setSelectedFile(selectedFileEntry._id);
      }
      if (lastHTMLFileEntry) {
        setLastHTMLFile(lastHTMLFileEntry._id);
      }
    }
  }, [files]);

  useEffect(() => {
    if (selectedFile) {
      const file = loadFileContent(selectedFile);
      if (file && file.title.endsWith(".html")) {
        setLastHTMLFile(selectedFile);
      }
    }
  }, [selectedFile]);

  function saveProject(entries) {
    const fetchData = async () => {
      try {
        const result = await fetch(`${backendURL}/projects/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userData,
            projectData,
            entries,
            changes: saveLog,
          }),
        });

        if (result.ok) {
          const data = await result.json();

          setLastSave(data.data.saveDate);
          setLastFiles([
            loadFileContent(selectedFile).title,
            loadFileContent(lastHTMLFile).title,
          ]);

          const oldIds = togglePages("").map((page) => page.id);
          const newIds = data.data.files.map((page) => page.id);

          for (const id of oldIds) {
            if (!newIds.includes(id)) {
              handleRemoveFile(id);
            }
          }

          setFiles(data.data.files);
          setSaveLog([]);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }

  async function prepareFiles({ parent = null, oldFiles = files }) {
    let removeFiles = [];
    let newFiles = [];
    for (const oldFile of oldFiles) {
      const fileExists = entries.some(
        (entry) => entry.id.toString() === oldFile._id.toString()
      );
      if (fileExists) continue;

      if (parent === null && !oldFile.insideFolder) {
        const addedFile = {
          id: oldFile._id.toString(),
          title: oldFile.name,
          type: oldFile.fileType,
          value: oldFile.content,
          isOpen: false,
          children: [],
        };

        newFiles.push(addedFile);
        removeFiles.push(oldFile);
        if (oldFile.fileType === "folder") {
          prepareFiles({
            parent: addedFile,
            oldFiles: oldFiles.filter((file) => !removeFiles.includes(file)),
          });
        }
      } else if (parent && oldFile.insideFolder === parent.id.toString()) {
        const addedFile = {
          id: oldFile._id.toString(),
          title: oldFile.name,
          type: oldFile.fileType,
          value: oldFile.content,
          isOpen: false,
          children: [],
        };

        parent.children.push(addedFile);
        removeFiles.push(oldFile);
        if (oldFile.fileType === "folder") {
          prepareFiles({
            parent: parent.children.find((child) => child === addedFile),
            oldFiles: oldFiles.filter((file) => !removeFiles.includes(file)),
          });
        }
      }
    }
    setEntries((prevEntries) => {
      return [...prevEntries, ...newFiles];
    });
  }

  function newEntry(entryType, folder) {
    if (newItem !== "") {
      const newEntry = {
        id: crypto.randomUUID(),
        title: newItem,
        type: entryType,
        isOpen: false,
        value: newItem.endsWith(".html") ? htmlText : "",
        children: [],
      };
      if (folder !== "root") {
        setSaveLog([
          ...saveLog,
          { type: "create", change: newEntry, parent: folder },
        ]);
        setSessionLog([
          ...sessionLog,
          { type: "create", change: newEntry, parent: folder },
        ]);

        updateChildren(folder, newEntry);
      } else {
        setSaveLog([
          ...saveLog,
          { type: "create", change: newEntry, parent: null },
        ]);
        setSessionLog([
          ...sessionLog,
          { type: "create", change: newEntry, parent: null },
        ]);
        setEntries((currentEntries) => {
          return [...currentEntries, newEntry];
        });
      }

      setNewItem("");
      if (newEntry.type === "file") {
        toggleFile(newEntry.id);
      }
    }
  }

  function removeFileById(id, entriesList) {
    return entriesList.reduce((acc, entry) => {
      if (entry.id === id) {
        return acc;
      } else if (entry.type === "folder" && entry.children.length > 0) {
        const updatedChildren = removeFileById(id, entry.children);
        return [...acc, { ...entry, children: updatedChildren }];
      } else {
        return [...acc, entry];
      }
    }, []);
  }

  function handleRemoveFile(id) {
    setEntries((currentEntries) => removeFileById(id, currentEntries));
  }

  function toggleFolder(id) {
    setEntries((currentEntries) => {
      return currentEntries.map((entry) => {
        if (entry.id === id) {
          return { ...entry, isOpen: !entry.isOpen };
        } else if (entry.type === "folder" && entry.children) {
          return { ...entry, children: toggleNestedFolder(entry.children, id) };
        } else {
          return entry;
        }
      });
    });
  }

  function toggleNestedFolder(children, id) {
    return children.map((child) => {
      if (child.id === id) {
        return { ...child, isOpen: !child.isOpen };
      } else if (child.type === "folder" && child.children) {
        return { ...child, children: toggleNestedFolder(child.children, id) };
      } else {
        return child;
      }
    });
  }

  function toggleFile(id) {
    setSelectedFile(id);
  }

  function togglePages(fileType) {
    let pages = [];
    for (const entry of entries) {
      if (entry.title.endsWith(fileType)) {
        pages.push(entry);
      }
      if (entry.type === "folder") {
        let nestedPages = toggleNestedPages(fileType, entry.children);
        pages = [...pages, ...nestedPages];
      }
    }
    return pages;
  }

  function toggleNestedPages(fileType, children) {
    let pages = [];
    for (const entry of children) {
      if (entry.title.endsWith(fileType)) {
        pages.push(entry);
      }
      if (entry.type === "folder") {
        let nestedPages = toggleNestedPages(fileType, entry.children);
        pages = [...pages, ...nestedPages];
      }
    }
    return pages;
  }

  function displayEditors(entries) {
    return entries.map((entry) => {
      if (entry.type === "file") {
        return (
          <textarea
            key={entry.id}
            id={`${entry.title.replace(".", "_")}Editor`}
            className={`${
              entry.id === selectedFile ? "text-editor-selected" : "text-editor"
            }`}
            defaultValue={entry.value}
            onChange={(e) => updateTextArea(entry.id, e.target.value)}
          ></textarea>
        );
      } else if (entry.type === "folder") {
        return <>{displayEditors(entry.children)}</>;
      }
    });
  }

  function updateTextArea(id, value = "") {
    const updateEntryValue = (entries) => {
      return entries.map((entry) => {
        if (entry.id === id) {
          return { ...entry, value };
        } else if (entry.type === "folder" && entry.children) {
          return { ...entry, children: updateEntryValue(entry.children) };
        } else {
          return entry;
        }
      });
    };

    setEntries((currentEntries) => updateEntryValue(currentEntries));
  }

  function updateChildren(id, child) {
    const updateChild = (entries) => {
      return entries.map((entry) => {
        if (entry.id === id) {
          return { ...entry, children: [...entry.children, child] };
        } else if (entry.type === "folder" && entry.children) {
          return { ...entry, children: updateChild(entry.children) };
        } else {
          return entry;
        }
      });
    };

    setEntries((currentEntries) => updateChild(currentEntries));
  }

  function loadFileContent(selectedFile) {
    for (const entry of entries) {
      if (entry.id === selectedFile) {
        return entry;
      } else if (entry.type === "folder") {
        const nestedEntry = loadNestedFileContent(selectedFile, entry.children);
        if (nestedEntry) return nestedEntry;
      }
    }
  }

  function loadNestedFileContent(selectedFile, children) {
    for (const entry of children) {
      if (entry.id === selectedFile) {
        return entry;
      } else if (entry.type === "folder") {
        const nestedEntry = loadNestedFileContent(selectedFile, entry.children);
        if (nestedEntry) return nestedEntry;
      }
    }
  }

  function loadFileContentName(fileName) {
    for (const entry of entries) {
      if (entry.title === fileName) {
        return entry;
      } else if (entry.type === "folder") {
        const nestedEntry = loadNestedFileContentName(fileName, entry.children);
        if (nestedEntry) return nestedEntry;
      }
    }
  }

  function loadNestedFileContentName(fileName, children) {
    for (const entry of children) {
      if (entry.title === fileName) {
        return entry;
      } else if (entry.type === "folder") {
        const nestedEntry = loadNestedFileContentName(fileName, entry.children);
        if (nestedEntry) return nestedEntry;
      }
    }
  }

  function findParent(id) {
    if (entries.map((entry) => entry.id).includes(id)) {
      return null;
    }
    for (const entry of entries) {
      if (entry.children.map((file) => file.id).includes(id)) {
        return entry;
      } else if (entry.children.filter((file) => file.type === "folder")) {
        for (const child of entry.children.filter(
          (file) => file.type === "folder"
        )) {
          findNestedParent(id, child.children);
        }
      }
    }
  }

  function findNestedParent(id, nestedEntries) {
    for (const entry of nestedEntries) {
      if (entry.children.map((file) => file.id).includes(id)) {
        return entry;
      } else if (entry.children.filter((file) => file.type === "folder")) {
        for (const child of entry.children.filter(
          (file) => file.type === "folder"
        )) {
          findNestedParent(id, child.children);
        }
      }
    }
  }

  return (
    <div className="project">
      <ProjectNav
        projectData={projectData}
        lastSave={lastSave}
        editorOpen={editorOpen}
        setEditorOpen={setEditorOpen}
        saveProject={saveProject}
        entries={entries}
        userData={userData}
      />
      {editorOpen && (
        <div className="explorer-editor-container">
          {newFile && (
            <>
              <div
                onClick={() => setNewFile(false)}
                className="screen-dim"
              ></div>
              <div className="modal">
                <p className="modal-title">New File or Folder</p>
                <div className="modal-row">
                  <input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    type="text"
                    className="modal-input"
                    placeholder="Enter name here:"
                  />
                  <select
                    name="folder-select"
                    id="folder-select"
                    className="folder-dropdown"
                    defaultValue={"root"}
                    onChange={(e) => setCurrentFolder(e.target.value)}
                  >
                    <option value="root">root</option>
                    {togglePages("")
                      .filter((page) => page.type === "folder")
                      .map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.title}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="modal-row">
                  <button
                    onClick={() => setFileSelected(true)}
                    className={fileSelected ? "new-file-selected" : "new-file"}
                  >
                    File
                  </button>
                  <button
                    onClick={() => setFileSelected(false)}
                    className={
                      !fileSelected ? "new-folder-selected" : "new-folder"
                    }
                  >
                    Folder
                  </button>
                </div>
                <button
                  onClick={() => {
                    newEntry(fileSelected ? "file" : "folder", currentFolder);
                    setNewFile(false);
                    setCurrentFolder("root");
                    setFileSelected(true);
                  }}
                  className="create-button"
                >
                  Create
                </button>
              </div>
            </>
          )}

          <div className="explorer-editor">
            <TextEditor
              entries={entries}
              selectedFile={selectedFile}
              displayEditors={displayEditors}
            />
            <FileExplorer
              entries={entries}
              newItem={newItem}
              toggleFile={toggleFile}
              toggleFolder={toggleFolder}
              selectedFile={selectedFile}
              setNewItem={setNewItem}
              newEntry={newEntry}
              saveProject={saveProject}
              lastSave={lastSave}
              userData={userData}
              newFile={newFile}
              setNewFile={setNewFile}
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
          </div>
        </div>
      )}

      {!editorOpen && (
        <div className="frame-editor">
          <Frame
            selectedFile={selectedFile}
            loadFileContent={loadFileContent}
            lastHTMLFile={lastHTMLFile}
            setShowHtmlPages={setShowHtmlPages}
            showHtmlPages={showHtmlPages}
            entries={entries}
            toggleFile={toggleFile}
            loadFileContentName={loadFileContentName}
            togglePages={togglePages}
          />
        </div>
      )}
    </div>
  );
}

export default Project;
