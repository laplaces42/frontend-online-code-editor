import {BrowserRouter, Routes, Route} from 'react-router-dom'

// pages and components
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Error404 from './pages/Error404'
import Project from './pages/Project'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <div className='pages'>
        <Routes>
          <Route
          path='/'
          element={<Home />}
          />
          <Route
          path='/dashboard/:id'
          element={<Dashboard />}
          />
          <Route
          path='/projects/:id'
          element={<Project />}
          />
          <Route
          path='/Error404'
          element={<Error404 />}
          />
        </Routes>
      </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
