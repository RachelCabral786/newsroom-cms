import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import ThemeToggle from "../../components/common/ThemeToggle";

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      roles: ["admin", "editor", "writer", "reader"],
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: "Create Article",
      href: "/articles/create",
      roles: ["writer"],
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role)
  );
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      {/* top navbar */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </div>

      <div className="flex pt-16">
        {" "}
        {/* account for fixed Navbar height */}
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-gray-600 bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border
            transform transition-transform duration-300 ease-in-out
            lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            mt-0
          `}
          aria-label="Sidebar"
        >
          <nav className="px-4 py-6 space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed bottom-4 right-4 z-50 lg:hidden p-3 bg-primary text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {sidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full lg:w-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
