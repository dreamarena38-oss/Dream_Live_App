import mongoose, { Schema, Document } from 'mongoose';

export interface ILeague extends Document {
    name: string;
    season: string;
    logoUrl?: string;
    matchCount: number;
}

const leagueSchema = new Schema<ILeague>({
    name: { type: String, required: true },
    season: { type: String, required: true },
    logoUrl: String,
    matchCount: { type: Number, default: 0 }
}, { timestamps: true });

leagueSchema.index({ name: 1 }, { unique: true });
leagueSchema.index({ createdAt: -1 });

export default mongoose.model<ILeague>('League', leagueSchema);
