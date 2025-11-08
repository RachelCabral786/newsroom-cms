import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ArticleForm from "../../pages/articles/ArticleForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import articleService from "../../services/articleService";

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await articleService.getArticleById(id);
      const articleData = response.data.article;

      // Check if article can be edited
      if (!["draft", "rejected"].includes(articleData.status)) {
        toast.error("This article cannot be edited");
        navigate("/dashboard");
        return;
      }

      setArticle(articleData);
    } catch (error) {
      toast.error("Failed to load article");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);

      // Update the article
      await articleService.updateArticle(id, {
        title: formData.title,
        content: formData.content,
      });

      // If editor is selected submit the article
      if (formData.editorId) {
        await articleService.submitArticle(id, formData.editorId);
        toast.success("Article updated and submitted for review!");
      } else {
        toast.success("Article updated successfully!");
      }

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update article";
      toast.error(message);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      navigate("/dashboard");
    }
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
          <p className="mt-2 text-gray-600">
            {article?.status === "rejected"
              ? "This article was rejected. Make necessary changes and resubmit for review."
              : "Update your article and save changes or submit it for review."}
          </p>

          {article?.status === "rejected" && article?.rejectionComment && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Rejection Reason:
              </h3>
              <p className="text-sm text-red-700">{article.rejectionComment}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <ArticleForm
            initialData={article}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={submitting}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditArticle;
