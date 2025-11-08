import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const ArticleCard = ({
  article,
  showActions = false,
  onEdit,
  onDelete,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const getStatusBadge = (status) => {
    const badges = {
      draft:
        theme === "dark"
          ? "bg-gray-800 text-gray-200"
          : "bg-gray-100 text-gray-500",
      submitted:
        theme === "dark"
          ? "bg-yellow-900 text-yellow-200"
          : "bg-yellow-100 text-yellow-500",
      approved:
        theme === "dark"
          ? "bg-green-900 text-green-200"
          : "bg-green-100 text-green-500",
      rejected:
        theme === "dark"
          ? "bg-red-900 text-red-200"
          : "bg-red-100 text-red-500",
    };
    return badges[status] || badges.draft;
  };

  return (
    <div
      className={`rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden ${
        theme === "dark"
          ? "bg-dark-card border-dark-border"
          : "bg-white border border-gray-200"
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
              article.status
            )}`}
          >
            {article.status.toUpperCase()}
          </span>
          <span
            className={
              theme === "dark"
                ? "text-gray-400 text-xs"
                : "text-gray-500 text-xs"
            }
          >
            {new Date(article.createdAt).toLocaleDateString()}
          </span>
        </div>

        <h3
          className={
            theme === "dark"
              ? "text-lg font-semibold text-white mb-2 line-clamp-2 cursor-pointer hover:text-primary"
              : "text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-primary"
          }
          onClick={() => navigate(`/articles/${article._id}`)}
        >
          {article.title}
        </h3>

        <div
          className={
            theme === "dark"
              ? "text-sm text-gray-300 mb-4 line-clamp-3"
              : "text-sm text-gray-600 mb-4 line-clamp-3"
          }
        >
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        <div
          className={
            theme === "dark"
              ? "flex items-center text-sm text-gray-400 mb-4"
              : "flex items-center text-sm text-gray-500 mb-4"
          }
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {article.author?.name}
        </div>

        {article.rejectionComment && (
          <div
            className={
              theme === "dark"
                ? "mb-3 p-3 bg-red-900 bg-opacity-20 border border-red-500 rounded-md"
                : "mb-3 p-3 bg-red-50 border border-red-200 rounded-md"
            }
          >
            <p
              className={
                theme === "dark"
                  ? "text-xs text-red-300 line-clamp-2"
                  : "text-xs text-red-500 line-clamp-2"
              }
            >
              <strong>Rejected:</strong> {article.rejectionComment}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-dark-border">
            {(article.status === "draft" || article.status === "rejected") &&
              onEdit && (
                <button
                  onClick={() => onEdit(article._id)}
                  className="flex-1 px-3 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>
              )}
            {article.status === "draft" && onDelete && (
              <button
                onClick={() => onDelete(article._id)}
                className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            )}
            {article.status === "draft" && onSubmit && (
              <button
                onClick={() => onSubmit(article._id)}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                Submit
              </button>
            )}
            {article.status === "approved" && (
              <button
                onClick={() => navigate(`/articles/${article._id}`)}
                className={
                  theme === "dark"
                    ? "flex-1 px-3 py-2 bg-dark-bg text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700"
                    : "flex-1 px-3 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-md hover:bg-gray-300"
                }
              >
                View
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleCard;
