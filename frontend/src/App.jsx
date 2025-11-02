import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ExperienceList from './pages/ExperienceList';
import ExperienceDetail from './pages/ExperienceDetail';
import CreateExperience from './pages/CreateExperience';
import Insights from './pages/Insights';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/experiences" element={<ExperienceList />} />
          <Route path="/experiences/:id" element={<ExperienceDetail />} />
          <Route path="/create" element={<CreateExperience />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
