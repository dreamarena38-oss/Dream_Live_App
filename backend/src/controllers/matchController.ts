import { Request, Response } from 'express';
import Match from '../models/Match';
import League from '../models/League';
import { matchSchema } from '../validations/schemas';

export const getMatches = async (req: Request, res: Response) => {
    try {
        const matches = await Match.find()
            .select('team1 team2 date time status venue imageUrl league team1Logo team2Logo')
            .sort({ createdAt: -1 });
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
};

export const getMatchById = async (req: Request, res: Response) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ error: 'Match not found' });
        res.json(match);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch match' });
    }
};

export const createMatch = async (req: Request, res: Response) => {
    try {
        const validatedData = matchSchema.parse(req.body);
        const match = new Match(validatedData);
        await match.save();

        if (match.league) {
            await League.updateOne(
                { name: match.league },
                { $inc: { matchCount: 1 } },
                { upsert: true }
            );
        }

        // @ts-ignore
        if (global.io) {
            // @ts-ignore
            global.io.emit('dreamlive-update', { type: 'match', action: 'create', data: match, timestamp: Date.now() });
        }

        res.status(201).json(match);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to create match' });
    }
};

export const updateMatch = async (req: Request, res: Response) => {
    try {
        const validatedData = matchSchema.partial().parse(req.body);
        const match = await Match.findByIdAndUpdate(req.params.id, validatedData, { new: true });
        if (!match) return res.status(404).json({ error: 'Match not found' });

        // @ts-ignore
        if (global.io) {
            // @ts-ignore
            global.io.emit('dreamlive-update', { type: 'match', action: 'update', data: match, timestamp: Date.now() });
        }

        res.json(match);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to update match' });
    }
};

export const deleteMatch = async (req: Request, res: Response) => {
    try {
        const match = await Match.findByIdAndDelete(req.params.id);
        if (!match) return res.status(404).json({ error: 'Match not found' });

        if (match.league) {
            await League.updateOne({ name: match.league }, { $inc: { matchCount: -1 } });
        }

        // @ts-ignore
        if (global.io) {
            // @ts-ignore
            global.io.emit('dreamlive-update', { type: 'match', action: 'delete', data: { id: req.params.id }, timestamp: Date.now() });
        }

        res.json({ message: 'Match deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete match' });
    }
};
