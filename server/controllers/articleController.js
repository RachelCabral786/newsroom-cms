import Article from '../models/Article.js';
import User from '../models/User.js';
import sanitizeHtml from 'sanitize-html';

// Sanitize HTML content
const sanitizeContent = (content) => {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
      a: ['href', 'name', 'target']
    }
  });
};

// Helper to emit socket event
const emitToUser = (req, userId, event, data) => {
  const io = req.app.get('io');
  if (io) {
    io.emit(`${event}:${userId}`, data);
  }
};

// Create new article (draft)
export const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Sanitize content
    const sanitizedContent = sanitizeContent(content);

    const article = await Article.create({
      title,
      content: sanitizedContent,
      author: req.user.id,
      status: 'draft'
    });

    const populatedArticle = await Article.findById(article._id)
      .populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article: populatedArticle }
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating article'
    });
  }
};

// Get all articles 
export const getArticles = async (req, res) => {
  try {
    const { status, search, author, editor } = req.query;
    let query = {};

    // If user is not authenticated, only show approved articles
    if (!req.user) {
      query.status = 'approved';
    } else {
      // Role-based filtering
      switch (req.user.role) {
        case 'reader':
          query.status = 'approved';
          break;
        case 'writer':
          // Writers see their own articles
          query.author = req.user.id;
          break;
        case 'editor':
          // Editors see articles assigned to them or approved by them
          if (!status) {
            query.$or = [
              { assignedEditor: req.user.id },
              { approvedBy: req.user.id }
            ];
          } else {
            query.assignedEditor = req.user.id;
          }
          break;
        case 'admin':
          // Admin sees everything
          break;
      }
    }

    // Apply additional filters
    if (status && req.user?.role !== 'reader') {
      query.status = status;
    }

    if (author) {
      query.author = author;
    }

    if (editor) {
      query.assignedEditor = editor;
    }

    // Search by title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const articles = await Article.find(query)
      .populate('author', 'name email')
      .populate('assignedEditor', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: articles.length,
      data: { articles }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching articles'
    });
  }
};

// Get single article by ID
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name email')
      .populate('assignedEditor', 'name email')
      .populate('approvedBy', 'name email');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check access permissions
    if (article.status !== 'approved' && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this article'
      });
    }

    if (req.user) {
      const isAuthor = article.author._id.toString() === req.user.id;
      const isEditor = article.assignedEditor?._id.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';

      if (article.status !== 'approved' && !isAuthor && !isEditor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this article'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: { article }
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching article'
    });
  }
};

// Update article (only draft or rejected)
export const updateArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user is the author
    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this article'
      });
    }

    // Can only update draft or rejected articles
    if (!['draft', 'rejected'].includes(article.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update article with status: ${article.status}`
      });
    }

    // Update fields
    if (title) article.title = title;
    if (content) article.content = sanitizeContent(content);

    await article.save();

    const updatedArticle = await Article.findById(article._id)
      .populate('author', 'name email')
      .populate('assignedEditor', 'name email');

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: { article: updatedArticle }
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating article'
    });
  }
};

// Submit article to editor
export const submitArticle = async (req, res) => {
  try {
    const { editorId } = req.body;

    if (!editorId) {
      return res.status(400).json({
        success: false,
        message: 'Please select an editor'
      });
    }

    // Verify editor exists and has editor role
    const editor = await User.findById(editorId);
    if (!editor || editor.role !== 'editor') {
      return res.status(400).json({
        success: false,
        message: 'Invalid editor selected'
      });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user is the author
    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this article'
      });
    }

    // Can only submit draft or rejected articles
    if (!['draft', 'rejected'].includes(article.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit article with status: ${article.status}`
      });
    }

    // Update article status
    article.status = 'submitted';
    article.assignedEditor = editorId;
    article.submittedAt = new Date();
    article.rejectionComment = ''; // Clear previous rejection comment

    await article.save();

    const updatedArticle = await Article.findById(article._id)
      .populate('author', 'name email')
      .populate('assignedEditor', 'name email');

    res.status(200).json({
      success: true,
      message: 'Article submitted successfully',
      data: { article: updatedArticle }
    });
  } catch (error) {
    console.error('Submit article error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting article'
    });
  }
};

// Approve article
export const approveArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user is the assigned editor
    if (article.assignedEditor?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this article'
      });
    }

    // Can only approve submitted articles
    if (article.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve article with status: ${article.status}`
      });
    }

    // Update article status
    article.status = 'approved';
    article.approvedBy = req.user.id;
    article.reviewedAt = new Date();
    article.rejectionComment = '';

    await article.save();

    const updatedArticle = await Article.findById(article._id)
      .populate('author', 'name email')
      .populate('assignedEditor', 'name email')
      .populate('approvedBy', 'name email');

    // Emit socket event to author
    emitToUser(req, article.author.toString(), 'articleApproved', {
      articleId: article._id,
      title: article.title,
      editorName: req.user.name,
      message: `Your article "${article.title}" has been approved!`
    });

    res.status(200).json({
      success: true,
      message: 'Article approved successfully',
      data: { article: updatedArticle }
    });
  } catch (error) {
    console.error('Approve article error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error approving article'
    });
  }
};

// Reject article
export const rejectArticle = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection comment is required'
      });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user is the assigned editor
    if (article.assignedEditor?.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this article'
      });
    }

    // Can only reject submitted articles
    if (article.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject article with status: ${article.status}`
      });
    }

    // Update article status
    article.status = 'rejected';
    article.rejectionComment = comment;
    article.reviewedAt = new Date();

    await article.save();

    const updatedArticle = await Article.findById(article._id)
      .populate('author', 'name email')
      .populate('assignedEditor', 'name email');

    // Emit socket event to author
    emitToUser(req, article.author.toString(), 'articleRejected', {
      articleId: article._id,
      title: article.title,
      editorName: req.user.name,
      comment: comment,
      message: `Your article "${article.title}" needs revisions`
    });

    res.status(200).json({
      success: true,
      message: 'Article rejected',
      data: { article: updatedArticle }
    });
  } catch (error) {
    console.error('Reject article error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error rejecting article'
    });
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check permissions
    const isAuthor = article.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this article'
      });
    }

    // Writers can only delete draft articles
    if (isAuthor && !isAdmin && article.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete draft articles'
      });
    }

    await article.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting article'
    });
  }
};

// Get article statistics
export const getArticleStats = async (req, res) => {
  try {
    const stats = await Article.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalArticles = await Article.countDocuments();
    
    const statsByAuthor = await Article.aggregate([
      {
        $group: {
          _id: '$author',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          authorName: '$author.name',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const formattedStats = {
      total: totalArticles,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      topAuthors: statsByAuthor
    };

    res.status(200).json({
      success: true,
      data: { stats: formattedStats }
    });
  } catch (error) {
    console.error('Get article stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching article statistics'
    });
  }
};

// Search articles by title or author
export const searchArticles = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search only approved articles for public
    const articles = await Article.find({
      status: 'approved',
      $or: [
        { title: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('author', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: articles.length,
      data: { articles }
    });
  } catch (error) {
    console.error('Search articles error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching articles'
    });
  }
};