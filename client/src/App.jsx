import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
// import { ThemeProvider } from "./context/ThemeContext"; // ThemeProvider is moved to index.jsx
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { useTheme } from "./context/ThemeContext";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/Unauthorized";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Article Pages
import CreateArticle from "./pages/articles/CreateArticle";
import EditArticle from "./pages/articles/EditArticle";
import ArticleDetail from "./pages/articles/ArticleDetail";

function App() {
  const { theme } = useTheme(); 
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Article Routes */}
                <Route
                  path="/articles/create"
                  element={
                    <ProtectedRoute allowedRoles={["writer"]}>
                      <CreateArticle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/articles/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={["writer"]}>
                      <EditArticle />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/articles/:id"
                  element={
                    <ProtectedRoute>
                      <ArticleDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />

                {/* 404 */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                          404
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Page not found
                        </p>
                        <a
                          href="/dashboard"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700"
                        >
                          Go to Dashboard
                        </a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </div>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme={theme}
            />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;