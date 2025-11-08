import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ArticleForm from "../../pages/articles/ArticleForm";
import articleService from "../../services/articleService";

const CreateArticle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);

      // create the article
      const response = await articleService.createArticle({
        title: formData.title,
        content: formData.content,
      });

      const articleId = response.data.article._id;

      // If editor is selected, submit the article
      if (formData.editorId) {
        await articleService.submitArticle(articleId, formData.editorId);
        toast.success("Article created and submitted for review!");
      } else {
        toast.success("Article saved as draft!");
      }

      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create article";
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Article
          </h1>
          <p className="mt-2 text-gray-600">
            Write your article and save it as a draft, or submit it directly to
            an editor for review.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <ArticleForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateArticle;
