import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [account, setAccount] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [accountPage, setAccountPage] = useState(false);
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(false);
  const backendURL = process.env.REACT_APP_BACKEND_URL

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    fetch(`${backendURL}/${account}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    }).then((result) => {
      result.json().then((data) => {
        if (result.ok) {
          navigate(`/dashboard/${data.data.userId}`);
        } else {
          setError(data.message);
        }
      });
    });
  };

  return (
    <div className="home">
      <div
        className={!accountPage ? "title-page" : "title-page title-page-hidden"}
      >
        <h1>The Only HTML Editor You'll Ever Need.</h1>
        <button onClick={() => setAccountPage(true)} className="get-started">
          Get Started &rarr;
        </button>
      </div>
      <div
        className={
          accountPage ? "account-input" : "account-input account-input-hidden"
        }
      >
        <div className={`flip-card ${flipped ? "flipped" : ""}`}>
          <div className="account-area front">
            <button
              className="flip-button"
              onClick={() => {
                handleFlip();
                setAccount("signup");
                setEmail("");
                setUsername("");
                setPassword("");
                setError("");
              }}
            >
              Sign Up &rarr;
            </button>
            <h2>Log In</h2>
            <p>Enter your credentials</p>
            <form onSubmit={handleSubmit} method="post">
              <div className="form-container">
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Username or Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                <button className="submit" type="submit">
                  Continue
                </button>
              </div>
            </form>
          </div>
          <div className="account-area back">
            <button
              className="flip-button"
              onClick={() => {
                handleFlip();
                setAccount("login");
                setUsername("");
                setEmail("");
                setPassword("");
                setError("");
              }}
            >
              Log In &rarr;
            </button>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} method="post">
              <div className="form-container">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                <button className="submit" type="submit">
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
