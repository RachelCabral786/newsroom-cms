import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import EditorDashboard from "./EditorDashboard";
import WriterDashboard from "./WriterDashboard";
import ReaderDashboard from "./ReaderDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  // Route to role-specific dashboard
  switch (user?.role) {
    case "admin":
      return <AdminDashboard />;
    case "editor":
      return <EditorDashboard />;
    case "writer":
      return <WriterDashboard />;
    case "reader":
      return <ReaderDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
          <p className="text-gray-600 dark:text-gray-400">Invalid user role</p>
        </div>
      );
  }
};

export default Dashboard;