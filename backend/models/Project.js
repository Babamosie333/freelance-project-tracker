const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
});

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientName: { type: String, required: true, trim: true },
    projectName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    deadline: { type: Date, required: true },
    budget: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'on-hold'],
      default: 'active',
    },
    milestones: [milestoneSchema],
    earnedAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
