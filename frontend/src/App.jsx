import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ExperienceList from './pages/ExperienceList';
import ExperienceDetail from './pages/ExperienceDetail';
import CreateExperience from './pages/CreateExperience';
import Insights from './pages/Insights';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthModalProvider } from './context/AuthModalContext.jsx';
import './App.css';

function App() {
    return (
        <Router>
            <AuthModalProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/experiences"
                            element={
                                <ProtectedRoute>
                                    <ExperienceList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/experiences/:id"
                            element={
                                <ProtectedRoute>
                                    <ExperienceDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/create"
                            element={
                                <ProtectedRoute>
                                    <CreateExperience />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/insights" element={<Insights />} />
                    </Routes>
                </Layout>
            </AuthModalProvider>
        </Router>
    );
}

export default App;
