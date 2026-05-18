import { Request, Response } from 'express';
import Highlight from '../models/Highlight';
import { highlightSchema } from '../validations/schemas';

export const getHighlights = async (req: Request, res: Response) => {
    try {
        const highlights = await Highlight.find()
            .select('title thumbnailUrl duration uploadDate videoId category sport featured views')
            .sort({ featured: -1, createdAt: -1 });
        res.json(highlights);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch highlights' });
    }
};

export const getHighlightById = async (req: Request, res: Response) => {
    try {
        const highlight = await Highlight.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        if (!highlight) return res.status(404).json({ error: 'Highlight not found' });
        res.json(highlight);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch highlight' });
    }
};

export const createHighlight = async (req: Request, res: Response) => {
    try {
        const validatedData = highlightSchema.parse(req.body);
        const highlightData = {
            ...validatedData,
            thumbnailUrl: validatedData.thumbnailUrl || `https://img.youtube.com/vi/${validatedData.videoId}/maxresdefault.jpg`
        };
        const highlight = new Highlight(highlightData);
        await highlight.save();
        // @ts-ignore
        if (global.io) global.io.emit('dreamlive-update', { type: 'highlight', action: 'create', data: highlight, timestamp: Date.now() });
        res.status(201).json(highlight);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to create highlight' });
    }
};

export const updateHighlight = async (req: Request, res: Response) => {
    try {
        const validatedData = highlightSchema.partial().parse(req.body);
        const highlight = await Highlight.findByIdAndUpdate(req.params.id, validatedData, { new: true });
        if (!highlight) return res.status(404).json({ error: 'Highlight not found' });
        // @ts-ignore
        if (global.io) global.io.emit('dreamlive-update', { type: 'highlight', action: 'update', data: highlight, timestamp: Date.now() });
        res.json(highlight);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to update highlight' });
    }
};

export const deleteHighlight = async (req: Request, res: Response) => {
    try {
        const highlight = await Highlight.findByIdAndDelete(req.params.id);
        if (!highlight) return res.status(404).json({ error: 'Highlight not found' });
        // @ts-ignore
        if (global.io) global.io.emit('dreamlive-update', { type: 'highlight', action: 'delete', data: { id: req.params.id }, timestamp: Date.now() });
        res.json({ message: 'Highlight deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete highlight' });
    }
};
