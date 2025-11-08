import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import articleService from "../../services/articleService";
// import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const ArticleDetail = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await articleService.getArticleById(id);
      setArticle(response.data.article);
    } catch (error) {
      toast.error("Failed to load article");
      console.error(error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading article..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2
            className={
              theme === "dark"
                ? "text-2xl font-bold text-white"
                : "text-2xl font-bold text-gray-900"
            }
          >
            Article not found
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className={
              theme === "dark"
                ? "flex items-center text-gray-400 hover:text-white mb-4"
                : "flex items-center text-gray-600 hover:text-gray-900 mb-4"
            }
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${getStatusBadge(
                  article.status
                )}`}
              >
                {article.status.toUpperCase()}
              </span>
              <h1
                className={
                  theme === "dark"
                    ? "text-4xl font-bold text-white mb-4"
                    : "text-4xl font-bold text-gray-900 mb-4"
                }
              >
                {article.title}
              </h1>
            </div>
          </div>

          <div
            className={
              theme === "dark"
                ? "flex flex-wrap items-center gap-6 text-sm text-gray-400 pb-6 border-b border-dark-border"
                : "flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-6 border-b border-gray-200"
            }
          >
            {/* Author, Created, Submitted, Editor, Approved By */}
            {/* keep same structure; only text colors updated */}
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
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
              <span>
                <strong>Author:</strong> {article.author?.name}
              </span>
            </div>

            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                <strong>Created:</strong>{" "}
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {article.submittedAt && (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong>Submitted:</strong>{" "}
                  {new Date(article.submittedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {article.assignedEditor && (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong>Editor:</strong> {article.assignedEditor.name}
                </span>
              </div>
            )}

            {article.approvedBy && (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  <strong>Approved by:</strong> {article.approvedBy.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {article.status === "rejected" && article.rejectionComment && (
          <div
            className={
              theme === "dark"
                ? "mb-8 p-6 bg-red-900 bg-opacity-20 border border-red-500 rounded-lg"
                : "mb-8 p-6 bg-red-50 border border-red-200 rounded-lg"
            }
          >
            <h3
              className={
                theme === "dark"
                  ? "text-lg font-semibold text-red-300 mb-2 flex items-center"
                  : "text-lg font-semibold text-red-500 mb-2 flex items-center"
              }
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Rejection Reason
            </h3>
            <p className={theme === "dark" ? "text-red-300" : "text-red-700"}>
              {article.rejectionComment}
            </p>
          </div>
        )}

        <div
          className={`rounded-lg shadow-lg p-8 mb-8 ${
            theme === "dark" ? "bg-dark-card" : "bg-white"
          }`}
        >
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ArticleDetail;
