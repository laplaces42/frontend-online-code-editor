import { useEffect, useRef, useState } from "react";

export function Frame({
  selectedFile,
  loadFileContent,
  lastHTMLFile,
  setShowHtmlPages,
  showHtmlPages,
  entries,
  toggleFile,
  loadFileContentName,
  togglePages,
}) {
  const cssFiles = togglePages(".css");

  const jsFiles = togglePages(".js");
  const file = loadFileContent(selectedFile);
  function toggleHtmlPages() {
    setShowHtmlPages(!showHtmlPages);
  }

  const iframeRef = useRef(null);

  const [fileContent, setFileContent] = useState("");
  useEffect(() => {
    if (file) {
      let htmlContent = loadFileContent(lastHTMLFile).value;
      let match;
      let cssContent = "";
      let jsContent = "";
      const cssRegex = /<link rel="stylesheet" href="(.*?)" \/>/g;
      while ((match = cssRegex.exec(htmlContent)) !== null) {
        const cssFile = loadFileContentName(match[1]);
        if (cssFile) {
          htmlContent += `<style>${cssFile.value}</style>`;
        }
      }

      const jsRegex = /<script src="(.*?)"><\/script>/g;
      while ((match = jsRegex.exec(htmlContent)) !== null) {
        const jsFile = loadFileContentName(match[1]);
        if (jsFile) {
          htmlContent += `<script>${jsFile.value}</script>`;
        }
      }
      setFileContent(htmlContent);
    }
  }, [lastHTMLFile]);

  if (!file || !lastHTMLFile) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="frame-container">
      <div className="frame-nav-bar">
        <button onClick={() => toggleHtmlPages()} className="pages-button">
          {`Page: ${loadFileContent(lastHTMLFile).title}`}
        </button>
      </div>
      {showHtmlPages && (
        <ul className="html-files">
          {entries.map((entry) => {
            function htmlButton() {
              setShowHtmlPages(!showHtmlPages);
              toggleFile(entry.id);
            }
            if (entry.title.endsWith(".html")) {
              return (
                <li key={entry.id} className="html-file">
                  <button
                    className={"html-button"}
                    onClick={() => htmlButton()}
                  >
                    {entry.title}
                  </button>
                </li>
              );
            }
          })}
        </ul>
      )}
      {showHtmlPages && (
        <div
          onClick={() => setShowHtmlPages(false)}
          className="screen-dim"
        ></div>
      )}

      <iframe srcDoc={fileContent} id="live-preview"></iframe>
    </div>
  );
}
