import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Dashboard = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState();
  const [newProject, setNewProject] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const [projects, setProjects] = useState();
  const [invalidTitle, setInvalidTitle] = useState(false);
  // const backendURL = process.env.BACKEND_URL
  const backendURL =
    "https://backend-online-code-editor-production.up.railway.app";

  useEffect(() => {
    fetch(`${backendURL}/dashboard/${id}`, { credentials: true }).then(
      (result) => {
        if (result.ok) {
          result.json().then((data) => {
            setUserData(data.data.user);
            setProjects([...data.data.projects]);
          });
        } else {
          navigate("/Error404");
        }
      }
    );
  }, []);

  const checkProjectName = (projectName) => {
    if (projects.map((project) => project.name).includes(projectName)) {
      return setInvalidTitle(true);
    } else {
      setInvalidTitle(false);
    }
  };

  const handleNewProject = () => {
    setNewProject(false);
    fetch(`${backendURL}/dashboard/${id}/new-project`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, userId: userData._id }),
    }).then((result) => {
      if (result.ok) {
        result.json().then((data) => {
          setProjects([...projects, data.data]);
          navigate(`/projects/${data.data._id}`);
        });
      }
    });
  };

  const handleDeleteProject = (projectId) => {
    const fetchData = async () => {
      try {
        const result = await fetch(
          `${backendURL}/dashboard/${id}/delete-project`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: userData._id, projectId }),
          }
        );
        const data = await result.json();

        if (result.ok) {
          setProjects(projects.filter((project) => project._id !== projectId));

          setUserData({
            ...userData,
            projects: projects.filter((project) => project.id !== projectId),
          });
        }
      } catch (err) {
        console.error("Error deleting project:", err);
      }
    };

    fetchData();
  };

  const handleLogout = () => {
    fetch(`${backendURL}/dashboard/${id}/logout`).then((result) => {
      navigate("/");
    });
  };

  if (!userData) {
    return <h1>Loading</h1>;
  } else {
    return (
      <div className="dashboard-container">
        <div className="dashboard">
          <nav>
            <div className="dashboard-nav">
              <p className="dashboard-title">{`${userData.username}'s Dashboard`}</p>
              <div className="dashboard-nav-buttons">
                <button
                  onClick={() => setNewProject(true)}
                  className="dashboard-nav-button"
                >
                  New Project
                </button>
                <button onClick={handleLogout} className="dashboard-nav-button">
                  Log Out
                </button>
              </div>
            </div>
          </nav>
          <div className="dashboard-header-container">
            <h2 className="dashboard-header">Hello {userData.username}</h2>
          </div>
          <h2 className="projects-header">Projects</h2>
          {newProject && (
            <>
              <div
                onClick={() => {
                  setNewProject(false);
                  setTitle("");
                  setDescription("");
                  setInvalidTitle(false);
                }}
                className="screen-dim"
              ></div>
              <div className="modal">
                <p className="modal-title">New Project</p>

                <input
                  type="text"
                  id="titleInput"
                  placeholder="Enter title here"
                  value={title}
                  className="modal-input1"
                  onChange={(e) => {
                    setTitle(e.target.value);
                    checkProjectName(e.target.value);
                  }}
                />

                <textarea
                  className="modal-textarea"
                  id="descriptionInput"
                  placeholder="Enter description here (Optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <button
                  onClick={() => {
                    setTitle("");
                    setDescription("");
                    handleNewProject();
                  }}
                  disabled={invalidTitle}
                  className="create-button"
                >
                  {!invalidTitle ? "Create" : "Pick a New Name"}
                </button>
              </div>
            </>
          )}
          <div className="projects-list-container">
            <ul className="projects-list">
              {projects.length !== 0 &&
                projects.map((project) => (
                  <div
                    onClick={() => {
                      navigate(`/projects/${project._id}`);
                    }}
                    className="indiv-project"
                  >
                    {/* <img src='/images/browser_thumbnail.jpeg' alt="Browser thumbnail" className="project-thumbnail" /> */}
                    <li className="indiv-project-text" key={project._id}>
                      <h3 className="project-name">{project.name}</h3>
                      <p className="project-description">
                        {project.description
                          ? project.description
                          : "No project description"}
                      </p>
                    </li>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project._id);
                      }}
                      className="delete-project"
                    >
                      Delete Project
                    </button>
                  </div>
                ))}
            </ul>
          </div>
          {projects.length === 0 && (
            <div className="no-projects">No projects to display</div>
          )}
        </div>
      </div>
    );
  }
};

export default Dashboard;
