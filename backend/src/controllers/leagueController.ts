import { Request, Response } from 'express';
import League from '../models/League';
import Match from '../models/Match';
import { leagueSchema } from '../validations/schemas';

export const getLeagues = async (req: Request, res: Response) => {
    try {
        const leagues = await League.find()
            .select('name season logoUrl matchCount')
            .sort({ createdAt: -1 });
        res.json(leagues);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }
};

export const getLeagueById = async (req: Request, res: Response) => {
    try {
        const league = await League.findById(req.params.id);
        if (!league) return res.status(404).json({ error: 'League not found' });
        res.json(league);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch league' });
    }
};

export const getLeagueMatches = async (req: Request, res: Response) => {
    try {
        const league = await League.findById(req.params.id);
        if (!league) return res.status(404).json({ error: 'League not found' });
        const matches = await Match.find({ league: league.name }).sort({ date: 1, time: 1 });
        res.json({ leagueName: league.name, matches });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch league matches' });
    }
};

export const createLeague = async (req: Request, res: Response) => {
    try {
        const validatedData = leagueSchema.parse(req.body);
        const league = new League(validatedData);
        await league.save();
        // @ts-ignore
        if (global.io) global.io.emit('dreamlive-update', { type: 'league', action: 'create', data: league, timestamp: Date.now() });
        res.status(201).json(league);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to create league' });
    }
};

export const updateLeague = async (req: Request, res: Response) => {
    try {
        const validatedData = leagueSchema.partial().parse(req.body);
        const league = await League.findByIdAndUpdate(req.params.id, validatedData, { new: true });
        if (!league) return res.status(404).json({ error: 'League not found' });
        // @ts-ignore
        if (global.io) global.io.emit('dreamlive-update', { type: 'league', action: 'update', data: league, timestamp: Date.now() });
        res.json(league);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: 'Validation failed', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to update league' });
    }
};

export const deleteLeague = async (req: Request, res: Response) => {
    try {
        const league = await League.findByIdAndDelete(req.params.id);
        if (!league) return res.status(404).json({ error: 'League not found' });
        // @ts-ignore
        if (global.io) global.io.emit('dreamlive-update', { type: 'league', action: 'delete', data: { id: req.params.id }, timestamp: Date.now() });
        res.json({ message: 'League deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete league' });
    }
};
