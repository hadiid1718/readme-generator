/**
 * Readme Model
 * Stores generated README documents with all form inputs and generated output
 */
import mongoose, { Document, Schema } from 'mongoose';

// ----- Interfaces -----
export interface IReadmeInput {
  projectName: string;
  description: string;
  techStack: string[];
  features: string[];
  installation: string[];
  usage: string;
  apiDocs?: string;
  screenshots: string[];
  githubRepo?: string;
  liveDemo?: string;
  license: string;
  authorName: string;
  authorGithub?: string;
  authorEmail?: string;
  authorWebsite?: string;
  customSections?: Array<{
    title: string;
    content: string;
  }>;
}

export interface IReadme extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  input: IReadmeInput;
  generatedMarkdown: string;
  templateId: string;
  themeVariant: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ----- Schema -----
const readmeSchema = new Schema<IReadme>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'README title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    input: {
      projectName: { type: String, required: true },
      description: { type: String, required: true },
      techStack: [{ type: String }],
      features: [{ type: String }],
      installation: [{ type: String }],
      usage: { type: String, default: '' },
      apiDocs: { type: String },
      screenshots: [{ type: String }],
      githubRepo: { type: String },
      liveDemo: { type: String },
      license: { type: String, default: 'MIT' },
      authorName: { type: String, required: true },
      authorGithub: { type: String },
      authorEmail: { type: String },
      authorWebsite: { type: String },
      customSections: [
        {
          title: { type: String },
          content: { type: String },
        },
      ],
    },
    generatedMarkdown: {
      type: String,
      required: true,
    },
    templateId: {
      type: String,
      default: 'modern',
    },
    themeVariant: {
      type: String,
      default: 'default',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ----- Indexes -----
readmeSchema.index({ userId: 1, createdAt: -1 });
readmeSchema.index({ isPublic: 1, createdAt: -1 });

const Readme = mongoose.model<IReadme>('Readme', readmeSchema);

export default Readme;
