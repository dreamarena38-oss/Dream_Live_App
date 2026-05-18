import express from 'express';
import * as matchController from '../controllers/matchController';
import * as leagueController from '../controllers/leagueController';
import * as videoController from '../controllers/videoController';
import * as highlightController from '../controllers/highlightController';
import * as adminController from '../controllers/adminController';
import * as authController from '../controllers/authController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date(), server: 'Dream Live API v2' });
});

// Auth Routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);

// Matches
router.get('/matches', matchController.getMatches);
router.get('/matches/:id', matchController.getMatchById);
router.post('/matches', authMiddleware, adminMiddleware, matchController.createMatch);
router.put('/matches/:id', authMiddleware, adminMiddleware, matchController.updateMatch);
router.delete('/matches/:id', authMiddleware, adminMiddleware, matchController.deleteMatch);

// Leagues
router.get('/leagues', leagueController.getLeagues);
router.get('/leagues/:id', leagueController.getLeagueById);
router.get('/leagues/:id/matches', leagueController.getLeagueMatches);
router.post('/leagues', authMiddleware, adminMiddleware, leagueController.createLeague);
router.put('/leagues/:id', authMiddleware, adminMiddleware, leagueController.updateLeague);
router.delete('/leagues/:id', authMiddleware, adminMiddleware, leagueController.deleteLeague);

// Videos
router.get('/videos', videoController.getVideos);
router.get('/videos/:id', videoController.getVideoById);
router.post('/videos', authMiddleware, adminMiddleware, videoController.createVideo);
router.put('/videos/:id', authMiddleware, adminMiddleware, videoController.updateVideo);
router.delete('/videos/:id', authMiddleware, adminMiddleware, videoController.deleteVideo);

// Highlights
router.get('/highlights', highlightController.getHighlights);
router.get('/highlights/:id', highlightController.getHighlightById);
router.post('/highlights', authMiddleware, adminMiddleware, highlightController.createHighlight);
router.put('/highlights/:id', authMiddleware, adminMiddleware, highlightController.updateHighlight);
router.delete('/highlights/:id', authMiddleware, adminMiddleware, highlightController.deleteHighlight);

// Featured & Stats
router.get('/featured-video', adminController.getFeaturedVideo);
router.post('/featured-video', authMiddleware, adminMiddleware, adminController.updateFeaturedVideo);
router.get('/admin/stats', authMiddleware, adminMiddleware, adminController.getAdminStats);

export default router;
