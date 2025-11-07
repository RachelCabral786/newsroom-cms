import { Schema, model } from 'mongoose';

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide content']
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft'
    },
    assignedEditor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rejectionComment: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for search functionality
articleSchema.index({ title: 'text' });
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ assignedEditor: 1, status: 1 });

export default model('Article', articleSchema);