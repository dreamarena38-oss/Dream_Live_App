import mongoose, { Schema, Document } from 'mongoose';

export interface IFeaturedContent extends Document {
    type: 'video' | 'match';
    videoId?: string;
    title?: string;
    active: boolean;
}

const featuredContentSchema = new Schema<IFeaturedContent>({
    type: { type: String, enum: ['video', 'match'], default: 'video' },
    videoId: String,
    title: String,
    active: { type: Boolean, default: true }
}, { timestamps: true });

featuredContentSchema.index({ active: 1 });
featuredContentSchema.index({ createdAt: -1 });

export default mongoose.model<IFeaturedContent>('FeaturedContent', featuredContentSchema);
