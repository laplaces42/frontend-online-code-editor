import { useNavigate } from "react-router-dom";

const Error404 = () => {
  const navigate = useNavigate();
  return (
    <div className="error404">
      <h1>Either you do not have access to this page, or it does not exist</h1>
      <button onClick={() => navigate('/')}>Home</button>
    </div>
  );
};

export default Error404;
