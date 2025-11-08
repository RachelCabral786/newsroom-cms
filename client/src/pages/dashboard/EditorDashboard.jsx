import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import articleService from "../../services/articleService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const EditorDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("submitted"); // submitted, approved, rejected
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [rejectionComment, setRejectionComment] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    // Fetch all articles relevant to the editor on mount
    fetchArticles();
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

  const handleApprove = async (articleId) => {
    try {
      await articleService.approveArticle(articleId);
      toast.success("Article approved successfully!");
      // Refetch all articles to update the counts in the stats cards
      fetchArticles();
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
      // Refetch all articles to update the counts in the stats cards
      fetchArticles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject article");
    }
  };

  // Calculate stats from all fetched articles
  const stats = {
    pending: articles.filter((a) => a.status === "submitted").length,
    approved: articles.filter((a) => a.status === "approved").length,
    rejected: articles.filter((a) => a.status === "rejected").length,
  };

  // Filter articles based on the current filter state for the display list
  const filteredArticles = articles.filter((a) => a.status === filter);

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

        {/* Stats  */}
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
          {filteredArticles.length === 0 ? (
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
              {filteredArticles.map(
                (
                  article // <-- Use filteredArticles here
                ) => (
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
                          <p className="text-sm text-gray-500">
                            By: {article.author?.name || "N/A"}
                          </p>
                          <div
                            dangerouslySetInnerHTML={{
                              __html:
                                article.content.substring(0, 150) +
                                (article.content.length > 150 ? "..." : ""),
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-4">
                        {article.status === "submitted" && (
                          <>
                            <button
                              onClick={() => handleApprove(article._id)}
                              className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 w-full whitespace-nowrap"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(article)}
                              className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 w-full whitespace-nowrap"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(article.status === "approved" ||
                          article.status === "rejected") && (
                          <button
                            disabled
                            className="px-3 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed whitespace-nowrap"
                          >
                            {article.status === "approved"
                              ? "Approved"
                              : "Rejected"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">
                Reject Article: {selectedArticle?.title}
              </h3>
              <textarea
                rows="4"
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                  disabled={!rejectionComment.trim()}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditorDashboard;
