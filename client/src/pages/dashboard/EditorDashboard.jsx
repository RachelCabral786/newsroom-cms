import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import articleService from "../../services/articleService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const EditorDashboard = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]); // State for all articles for stats
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("submitted");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [rejectionComment, setRejectionComment] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Function to fetch articles based on status
  const fetchArticles = useCallback(
    async (status = filter) => {
      try {
        setLoading(true);
        // Fetch articles based on the filter for the main list
        const response = await articleService.getArticles({ status: status });
        setArticles(response.data.articles);

        if (status === filter) {
          const allResponse = await articleService.getArticles({}); // Fetch all statuses for stats
          setAllArticles(allResponse.data.articles);
        }
      } catch (error) {
        toast.error("Failed to load articles");
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [filter]
  ); // Include filter in useCallback dependencies

  useEffect(() => {
    fetchArticles();

    // Listen for article status changes to refresh editor view
    const handleStatusChange = () => {
      console.log("📢 Refreshing editor dashboard...");
      fetchArticles(); // Refetch with the current filter
    };

    window.addEventListener("articleStatusChanged", handleStatusChange);

    return () => {
      window.removeEventListener("articleStatusChanged", handleStatusChange);
    };
  }, [filter, fetchArticles]); // Added fetchArticles to dependencies

  const handleApprove = async (articleId) => {
    try {
      await articleService.approveArticle(articleId);
      toast.success("Article approved successfully!");
      // Dispatch custom event to trigger refresh in useEffect
      window.dispatchEvent(new Event("articleStatusChanged"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve article");
    }
  };

  const handleRejectClick = (article) => {
    setSelectedArticle(article);
    setShowRejectModal(true);
    setRejectionComment("");
  };

  const handleReject = async () => {
    if (!rejectionComment.trim()) {
      toast.error("Please provide a rejection comment");
      return;
    }

    try {
      await articleService.rejectArticle(selectedArticle._id, rejectionComment);
      toast.success("Article rejected");
      setShowRejectModal(false);
      setSelectedArticle(null);
      setRejectionComment("");
      // Dispatch custom event to trigger refresh in useEffect
      window.dispatchEvent(new Event("articleStatusChanged"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject article");
    }
  };

  const handleViewArticle = (articleId) => {
    navigate(`/articles/${articleId}`);
    console.log(`Viewing article with ID: ${articleId}`);
    // toast.info(`Simulating view for article ID: ${articleId}`);
  };

  // Calculate stats based on ALL articles fetched for the dashboard
  const stats = {
    pending: allArticles.filter((a) => a.status === "submitted").length,
    approved: allArticles.filter((a) => a.status === "approved").length,
    rejected: allArticles.filter((a) => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading articles..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Editor Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg
                  className="w-8 h-8 text-yellow-600"
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
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.approved}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600"
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
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.rejected}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setFilter("submitted")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  filter === "submitted"
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pending Review ({stats.pending})
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  filter === "approved"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setFilter("rejected")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  filter === "rejected"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </nav>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {articles.length === 0 ? (
            <div className="px-6 py-12 text-center">
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
              <p className="mt-4 text-gray-500">No articles in this category</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {articles.map((article) => (
                <div key={article._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {article.title}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            article.status === "submitted"
                              ? "bg-yellow-100 text-yellow-800"
                              : article.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {article.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: article.content.substring(0, 200) + "...",
                          }}
                        />
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
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
                          By {article.author?.name}
                        </span>
                        <span>
                          {new Date(
                            article.submittedAt || article.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {article.status === "rejected" &&
                        article.rejectionComment && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800">
                              <strong>Rejection reason:</strong>{" "}
                              {article.rejectionComment}
                            </p>
                          </div>
                        )}
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => handleViewArticle(article._id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View
                      </button>
                      {article.status === "submitted" && (
                        <>
                          <button
                            onClick={() => handleApprove(article._id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(article)}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Reject Article
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Please provide a reason for rejecting this article. The writer
                  will see this comment.
                </p>
                <textarea
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  rows="4"
                  placeholder="Enter rejection reason..."
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedArticle(null);
                      setRejectionComment("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                  >
                    Reject Article
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditorDashboard;
