import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import articleService from "../../services/articleService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ReaderDashboard = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articleService.getArticles({ status: "approved" });
      setArticles(response.data.articles);
    } catch (error) {
      toast.error("Failed to load articles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchArticles();
      return;
    }

    try {
      setSearching(true);
      const response = await articleService.searchArticles(searchQuery);
      setArticles(response.data.articles);
      if (response.data.articles.length === 0) {
        toast.info("No articles found");
      }
    } catch (error) {
      toast.error("Search failed");
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchArticles();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Published Articles
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title or author..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary"
              />
              <svg
                className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-6 py-2 bg-gray-200 dark:bg-dark-bg text-gray-800 dark:text-gray-200 font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Articles Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {searchQuery
              ? `Found ${articles.length} article(s)`
              : `${articles.length} published article(s)`}
          </p>
        </div>

        {/* Articles List */}
        {articles.length === 0 ? (
          <div className="bg-white dark:bg-dark-card rounded-lg shadow p-12 text-center border border-gray-100 dark:border-dark-border">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No articles available
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "Try a different search term"
                : "Check back later for new content"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article._id}
                className="bg-white dark:bg-dark-card rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer border border-gray-200 dark:border-dark-border"
                onClick={() => navigate(`/articles/${article._id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 hover:text-primary">
                        {article.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
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
                          {article.author?.name}
                        </span>
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {new Date(article.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      PUBLISHED
                    </span>
                  </div>

                  <div className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                    <div
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Approved by {article.approvedBy?.name}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/articles/${article._id}`);
                      }}
                      className="text-primary hover:text-blue-700 font-medium text-sm flex items-center"
                    >
                      Read more
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
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

export default ReaderDashboard;
