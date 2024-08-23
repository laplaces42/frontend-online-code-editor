import { useNavigate } from "react-router-dom";

const ProjectNav = ({
  projectData,
  lastSave,
  editorOpen,
  setEditorOpen,
  saveProject,
  entries,
  userData,
}) => {
  const navigate = useNavigate();
  const date = new Date(lastSave);
  let formattedDate;
  if (!isNaN(date)) {
    formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(date);
  }

  if (!projectData && !lastSave) {
    return <div>Loading...</div>;
  }

  return (
    <nav>
      <div className="project-nav">
        <p className="project-title">{projectData.name}</p>
        <div className="project-nav-buttons">
          <p className="last-save">
            Last Save: {formattedDate ? formattedDate : ""}
          </p>
          <button
            onClick={() => saveProject(entries)}
            className="project-nav-button"
          >
            Save
          </button>
          <button
            onClick={() => {
              saveProject(entries);
              navigate(`/dashboard/${userData.userId}`);
            }}
            className="project-nav-button"
          >
            Dashboard
          </button>
          <button
            className="project-nav-button"
            onClick={() => setEditorOpen(!editorOpen)}
          >
            {editorOpen ? "Frame" : "Editor"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ProjectNav;
