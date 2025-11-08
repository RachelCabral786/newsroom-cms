import api from './api';

const articleService = {
  // Create article
  createArticle: async (articleData) => {
    const response = await api.post('/articles', articleData);
    return response.data;
  },

  // Get all articles
  getArticles: async (params) => {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  // Get article by ID
  getArticleById: async (id) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  // Update article
  updateArticle: async (id, articleData) => {
    const response = await api.put(`/articles/${id}`, articleData);
    return response.data;
  },

  // Submit article to editor
  submitArticle: async (id, editorId) => {
    const response = await api.put(`/articles/${id}/submit`, { editorId });
    return response.data;
  },

  // Approve article
  approveArticle: async (id) => {
    const response = await api.put(`/articles/${id}/approve`);
    return response.data;
  },

  // Reject article
  rejectArticle: async (id, comment) => {
    const response = await api.put(`/articles/${id}/reject`, { comment });
    return response.data;
  },

  // Delete article
  deleteArticle: async (id) => {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
  },

  // Search articles
  searchArticles: async (query) => {
    const response = await api.get('/articles/search', { params: { q: query } });
    return response.data;
  },

  // Get article statistics
  getArticleStats: async () => {
    const response = await api.get('/articles/stats');
    return response.data;
  }
};

export default articleService;