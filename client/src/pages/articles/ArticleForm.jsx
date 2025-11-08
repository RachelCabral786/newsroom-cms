import { useState, useEffect, useRef } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import userService from "../../services/userService";

const ArticleForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    editorId: "",
  });
  const [editors, setEditors] = useState([]);
  const [loadingEditors, setLoadingEditors] = useState(false);
  const [errors, setErrors] = useState({});

  // Quill modules and formats
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "script",
    "list",
    "blockquote",
  ];

  const { quill, quillRef } = useQuill({ modules, formats });
  const quillInitializedRef = useRef(false);

  useEffect(() => {
    // when quill is ready, set up change listener
    if (!quill) return;

    // avoid re-attaching listeners on re-renders
    if (quillInitializedRef.current) return;
    quillInitializedRef.current = true;

    // initialize content if available
    if (initialData?.content) {
      quill.root.innerHTML = initialData.content;
      setFormData((prev) => ({ ...prev, content: initialData.content }));
    }

    const handleTextChange = () => {
      const html = quill.root.innerHTML;
      setFormData((prev) => ({ ...prev, content: html }));
      if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
    };

    quill.on("text-change", handleTextChange);

    return () => {
      quill.off("text-change", handleTextChange);
    };
  }, [quill]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!quill) return;
    if (initialData?.content) {
      // update only if different to avoid resetting user's typing
      if (quill.root.innerHTML !== initialData.content) {
        quill.root.innerHTML = initialData.content;
        setFormData((prev) => ({ ...prev, content: initialData.content }));
      }
    } else {
      // when creating a new article clear quill if necessary
      if (initialData === undefined && quill.root.innerHTML !== "<p><br></p>") {
        quill.root.innerHTML = "<p><br></p>";
        setFormData((prev) => ({ ...prev, content: "" }));
      }
    }
  }, [initialData, quill]);

  useEffect(() => {
    // set title & editor when initialData is provided
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        content: initialData.content || "",
        editorId: initialData.assignedEditor?._id || "",
      });
    }
    fetchEditors();
  }, [initialData]);

  const fetchEditors = async () => {
    try {
      setLoadingEditors(true);
      const response = await userService.getEditors();
      setEditors(response.data.editors || []);
    } catch (error) {
      console.error("Failed to load editors:", error);
    } finally {
      setLoadingEditors(false);
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must not exceed 200 characters";
    }

    // Strip HTML tags for content validation
    const strippedContent = formData.content.replace(/<[^>]*>/g, "").trim();
    if (!strippedContent) {
      newErrors.content = "Content is required";
    } else if (strippedContent.length < 50) {
      newErrors.content = "Content must be at least 50 characters";
    }

    return newErrors;
  };

  // Non-editor field change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the validation errors");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Article Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={`w-full px-4 py-2 border ${
            errors.title ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-dark-bg dark:border-dark-border dark:text-white`}
          placeholder="Enter article title..."
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {formData.title.length}/200 characters
        </p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Article Content <span className="text-red-500">*</span>
        </label>
        <div
          className={`${
            errors.content ? "ring-2 ring-red-500 rounded-md" : ""
          }`}
        >
          {/* react-quilljs editor mount point */}
          <div
            ref={quillRef}
            className="bg-white dark:bg-dark-card dark:text-white"
            style={{ minHeight: 400 }}
          />
        </div>
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Minimum 50 characters required
        </p>
      </div>

      {/* Editor Selection (for submission) */}
      {formData.editorId !== undefined && (
        <div>
          <label
            htmlFor="editor"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Assign to Editor (Optional - required for submission)
          </label>
          <select
            id="editor"
            value={formData.editorId}
            onChange={(e) => handleInputChange("editorId", e.target.value)}
            disabled={loadingEditors}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-dark-card dark:border-dark-border dark:text-white"
          >
            <option value="">Select an editor (optional)</option>
            {editors.map((editor) => (
              <option key={editor._id} value={editor._id}>
                {editor.name} ({editor.email})
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You can save as draft without selecting an editor, or select one to
            submit for review
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-dark-border">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 dark:border-dark-border dark:text-gray-300 dark:hover:bg-opacity-5"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : initialData ? (
            "Update Article"
          ) : (
            "Save Article"
          )}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;
