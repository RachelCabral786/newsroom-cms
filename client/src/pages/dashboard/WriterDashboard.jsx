import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import articleService from "../../services/articleService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const WriterDashboard = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchArticles();

    // Listen for article status changes
    const handleStatusChange = () => {
      console.log("📢 Article status changed - refreshing...");
      fetchArticles();
    };

    window.addEventListener("articleStatusChanged", handleStatusChange);

    return () => {
      window.removeEventListener("articleStatusChanged", handleStatusChange);
    };
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articleService.getArticles({});
      setArticles(response.data.articles);
    } catch (error) {
      toast.error("Failed to load articles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm("Are you sure you want to delete this article?")) {
      return;
    }

    try {
      await articleService.deleteArticle(articleId);
      toast.success("Article deleted successfully");
      fetchArticles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete article");
    }
  };

  // Filter articles based on current filter
  const getFilteredArticles = () => {
    if (filter === "all") return articles;
    return articles.filter((a) => a.status === filter);
  };

  const filteredArticles = getFilteredArticles();

  const stats = {
    total: articles.length,
    draft: articles.filter((a) => a.status === "draft").length,
    submitted: articles.filter((a) => a.status === "submitted").length,
    approved: articles.filter((a) => a.status === "approved").length,
    rejected: articles.filter((a) => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading your articles..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Articles</h1>
          <button
            onClick={() => navigate("/articles/create")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Article
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs font-medium text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs font-medium text-gray-600">Draft</p>
            <p className="text-2xl font-bold text-gray-600 mt-1">
              {stats.draft}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs font-medium text-gray-600">Submitted</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {stats.submitted}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs font-medium text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {stats.approved}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-xs font-medium text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {stats.rejected}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto">
              {[
                { key: "all", label: "All", count: stats.total },
                { key: "draft", label: "Draft", count: stats.draft },
                {
                  key: "submitted",
                  label: "Submitted",
                  count: stats.submitted,
                },
                { key: "approved", label: "Approved", count: stats.approved },
                { key: "rejected", label: "Rejected", count: stats.rejected },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${
                    filter === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No articles found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === "all"
                ? "Get started by creating your first article"
                : `You don't have any ${filter} articles yet`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => navigate("/articles/create")}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700"
              >
                Create Article
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article._id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        article.status === "draft"
                          ? "bg-gray-100 text-gray-800"
                          : article.status === "submitted"
                          ? "bg-yellow-100 text-yellow-800"
                          : article.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {article.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  <div className="text-sm text-gray-600 mb-4 line-clamp-3">
                    <div
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>

                  {article.status === "submitted" && article.assignedEditor && (
                    <p className="text-xs text-gray-500 mb-3">
                      Assigned to: {article.assignedEditor.name}
                    </p>
                  )}

                  {article.status === "rejected" &&
                    article.rejectionComment && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs text-red-800">
                          <strong>Rejection reason:</strong>{" "}
                          {article.rejectionComment}
                        </p>
                      </div>
                    )}

                  <div className="flex space-x-2">
                    {(article.status === "draft" ||
                      article.status === "rejected") && (
                      <>
                        <button
                          onClick={() =>
                            navigate(`/articles/edit/${article._id}`)
                          }
                          className="flex-1 px-3 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-700"
                        >
                          {article.status === "rejected"
                            ? "Edit & Resubmit"
                            : "Edit"}
                        </button>
                        {article.status === "draft" && (
                          <button
                            onClick={() => handleDelete(article._id)}
                            className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}

                    {article.status === "approved" && (
                      <button
                        onClick={() => navigate(`/articles/${article._id}`)}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
                      >
                        View
                      </button>
                    )}
                    {article.status === "submitted" && (
                      <button
                        disabled
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
                      >
                        Under Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default WriterDashboard;
