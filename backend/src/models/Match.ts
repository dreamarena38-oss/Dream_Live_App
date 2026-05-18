import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
    team1: string;
    team2: string;
    date: string;
    time: string;
    status: 'live' | 'upcoming' | 'completed';
    venue?: string;
    imageUrl?: string;
    league: string;
    team1Logo?: string;
    team2Logo?: string;
    players?: {
        team1: string[];
        team2: string[];
    };
    teamStats?: {
        team1: { wins: number; losses: number; draws: number };
        team2: { wins: number; losses: number; draws: number };
    };
}

const matchSchema = new Schema<IMatch>({
    team1: { type: String, required: true },
    team2: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['live', 'upcoming', 'completed'], default: 'upcoming' },
    venue: String,
    imageUrl: String,
    league: { type: String, required: true },
    team1Logo: String,
    team2Logo: String,
    players: {
        team1: { type: [String], default: [] },
        team2: { type: [String], default: [] }
    },
    teamStats: {
        team1: {
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            draws: { type: Number, default: 0 }
        },
        team2: {
            wins: { type: Number, default: 0 },
            losses: { type: Number, default: 0 },
            draws: { type: Number, default: 0 }
        }
    }
}, { timestamps: true });

// Performance Indexes
matchSchema.index({ createdAt: -1 });
matchSchema.index({ status: 1 });
matchSchema.index({ league: 1 });
matchSchema.index({ date: 1, time: 1 });

export default mongoose.model<IMatch>('Match', matchSchema);
