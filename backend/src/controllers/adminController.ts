import { Request, Response } from 'express';
import FeaturedContent from '../models/FeaturedContent';
import Match from '../models/Match';
import League from '../models/League';
import Video from '../models/Video';
import Highlight from '../models/Highlight';

export const getFeaturedVideo = async (req: Request, res: Response) => {
    try {
        let featured = await FeaturedContent.findOne({ active: true }).sort({ createdAt: -1 });
        if (!featured) {
            featured = new FeaturedContent({ videoId: 'dQw4w9WgXcQ', title: 'Featured Match Highlights', active: true });
            await featured.save();
        }
        res.json(featured);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch featured content' });
    }
};

export const updateFeaturedVideo = async (req: Request, res: Response) => {
    try {
        await FeaturedContent.updateMany({}, { active: false });
        const featured = new FeaturedContent({ ...req.body, active: true });
        await featured.save();
        // @ts-ignore
        if (global.io) global.io.emit('dreamlive-update', { type: 'featured', action: 'update', data: featured, timestamp: Date.now() });
        res.json(featured);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update featured content' });
    }
};

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [totalMatches, liveMatches, upcomingMatches, completedMatches, totalLeagues, totalVideos, totalHighlights] = await Promise.all([
            Match.countDocuments(),
            Match.countDocuments({ status: 'live' }),
            Match.countDocuments({ status: 'upcoming' }),
            Match.countDocuments({ status: 'completed' }),
            League.countDocuments(),
            Video.countDocuments(),
            Highlight.countDocuments()
        ]);
        res.json({ totalMatches, liveMatches, upcomingMatches, completedMatches, totalLeagues, totalVideos, totalHighlights });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
};
