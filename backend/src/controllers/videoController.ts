import { Request, Response } from 'express';
import Video from '../models/Video';
import { videoSchema } from '../validations/schemas';

export const getVideos = async (req: Request, res: Response) => {
    try {
        const videos = await Video.find()
            .select('title thumbnailUrl duration uploadDate videoId category views')
            .sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
};

export const getVideoById = async (req: Request, res: Response) => {
    try {
        const video = await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        if (!video) return res.status(404).json({ error: 'Video not found' });
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video' });
    }
};

export const createVideo = async (req: Request, res: Response) => {
    try {
        const validatedData = videoSchema.parse(req.body);
        const videoData = {
            ...validatedData,
            thumbnailUrl: validatedData.thumbnailUrl || `https://img.youtube.com/vi/${validatedData.videoId}/maxresdefault.jpg`
        };
        const video = new Video(videoData);
        await video.save();
        // @ts-ignore
        if (global.io) global.io.emit('dreamlive-update', { type: 'video', action: 'create', data: video, timestamp: Date.now() });
        res.status(201).json(video);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to create video' });
    }
};

export const updateVideo = async (req: Request, res: Response) => {
    try {
        const validatedData = videoSchema.partial().parse(req.body);
        const video = await Video.findByIdAndUpdate(req.params.id, validatedData, { new: true });
        if (!video) return res.status(404).json({ error: 'Video not found' });
        // @ts-ignore
        if (global.io) global.io.emit('dreamlive-update', { type: 'video', action: 'update', data: video, timestamp: Date.now() });
        res.json(video);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to update video' });
    }
};

export const deleteVideo = async (req: Request, res: Response) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id);
        if (!video) return res.status(404).json({ error: 'Video not found' });
        // @ts-ignore
        if (global.io) global.io.emit('dreamlive-update', { type: 'video', action: 'delete', data: { id: req.params.id }, timestamp: Date.now() });
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete video' });
    }
};
