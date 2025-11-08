import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/useSocket";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      editor: "bg-blue-100 text-blue-800",
      writer: "bg-green-100 text-green-800",
      reader: "bg-gray-100 text-gray-800",
    };
    return colors[role] || colors.reader;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Desktop Connection Indicator */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold text-primary">Newsroom CMS</h1>
            </Link>

            {/* DESKTOP/TABLET connection indicator (left) */}
            {user && (
              <div className="hidden md:flex ml-6 items-center">
                <div
                  className={`h-2 w-2 rounded-full ${
                    connected ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                  aria-hidden="true"
                  title={connected ? "Connected" : "Disconnected"}
                />
                <span className="ml-2 text-xs text-gray-500">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            )}
          </div>

          {/* Right: Desktop actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role.toUpperCase()}
                </span>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            )}
            {!user && (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-gray-700">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium text-white bg-primary px-3 py-1 rounded-md"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: right controls (compact connection dot + hamburger) */}
          <div className="flex md:hidden items-center">
            {/* MOBILE connection indicator (compact and on the right) */}
            {user && (
              <div className="mr-3 flex items-center">
                <div
                  className={`h-2 w-2 rounded-full ${
                    connected ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                  aria-hidden="true"
                  title={connected ? "Connected" : "Disconnected"}
                />
              </div>
            )}

            <button
              onClick={() => setMobileOpen((s) => !s)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {mobileOpen ? (
                // X icon
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger icon
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        className={`md:hidden transition-max-height duration-200 ease-in-out overflow-hidden ${
          mobileOpen ? "max-h-[400px]" : "max-h-0"
        }`}
      >
        <div className="px-4 pt-4 pb-4 space-y-3 border-t border-gray-100">
          {user ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role.toUpperCase()}
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                className="block w-full text-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block w-full text-center px-3 py-2 rounded-md text-sm font-medium text-white bg-primary"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
