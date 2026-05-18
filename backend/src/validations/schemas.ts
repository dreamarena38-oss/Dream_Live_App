import { z } from 'zod';

export const matchSchema = z.object({
    team1: z.string().min(1, 'Team 1 name is required'),
    team2: z.string().min(1, 'Team 2 name is required'),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    status: z.enum(['live', 'upcoming', 'completed']).default('upcoming'),
    venue: z.string().optional(),
    imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
    league: z.string().min(1, 'League name is required'),
    team1Logo: z.string().optional(),
    team2Logo: z.string().optional(),
    players: z.object({
        team1: z.array(z.string()).default([]),
        team2: z.array(z.string()).default([])
    }).optional(),
    teamStats: z.object({
        team1: z.object({
            wins: z.number().default(0),
            losses: z.number().default(0),
            draws: z.number().default(0)
        }),
        team2: z.object({
            wins: z.number().default(0),
            losses: z.number().default(0),
            draws: z.number().default(0)
        })
    }).optional()
});

export const leagueSchema = z.object({
    name: z.string().min(1, 'League name is required'),
    season: z.string().min(1, 'Season is required'),
    logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
    matchCount: z.number().default(0)
});

export const videoSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    youtubeUrl: z.string().url('Invalid YouTube URL'),
    videoId: z.string().min(1, 'Video ID is required'),
    thumbnailUrl: z.string().optional(),
    duration: z.string().optional(),
    category: z.enum(['Sport', 'Podcast', 'TV Show', 'Other']).default('Other'),
    views: z.number().default(0)
});

export const highlightSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    youtubeUrl: z.string().url('Invalid YouTube URL'),
    videoId: z.string().min(1, 'Video ID is required'),
    thumbnailUrl: z.string().optional(),
    duration: z.string().optional(),
    category: z.string().default('Sports'),
    sport: z.string().min(1, 'Sport name is required'),
    featured: z.boolean().default(false),
    views: z.number().default(0)
});
