import mongoose, { Schema, Document } from 'mongoose';

export interface IHighlight extends Document {
    title: string;
    youtubeUrl: string;
    videoId: string;
    thumbnailUrl?: string;
    duration?: string;
    category: string;
    sport: string;
    featured: boolean;
    views: number;
    uploadDate: Date;
}

const highlightSchema = new Schema<IHighlight>({
    title: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    videoId: { type: String, required: true },
    thumbnailUrl: String,
    duration: String,
    category: { type: String, default: 'Sports' },
    sport: { type: String, required: true },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

highlightSchema.index({ createdAt: -1 });
highlightSchema.index({ featured: -1 });
highlightSchema.index({ sport: 1 });

export default mongoose.model<IHighlight>('Highlight', highlightSchema);
