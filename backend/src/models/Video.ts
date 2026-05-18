import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
    title: string;
    youtubeUrl: string;
    videoId: string;
    thumbnailUrl?: string;
    duration?: string;
    category: 'Sport' | 'Podcast' | 'TV Show' | 'Other';
    views: number;
    uploadDate: Date;
}

const videoSchema = new Schema<IVideo>({
    title: { type: String, required: true },
    youtubeUrl: { type: String, required: true },
    videoId: { type: String, required: true },
    thumbnailUrl: String,
    duration: String,
    category: { type: String, enum: ['Sport', 'Podcast', 'TV Show', 'Other'], default: 'Other' },
    views: { type: Number, default: 0 },
    uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

videoSchema.index({ createdAt: -1 });
videoSchema.index({ category: 1 });
videoSchema.index({ views: -1 });

export default mongoose.model<IVideo>('Video', videoSchema);
