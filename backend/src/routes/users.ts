import express, { Response } from 'express';
import { prisma } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get current user details (including sub tier)
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId },
            select: { id: true, name: true, email: true, role: true, subscriptionTier: true, reputationScore: true, address: true, bankAccount: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Seller Profile (Address & Bank Account)
router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { address, bankAccount } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user?.userId },
            data: { address, bankAccount },
            select: { id: true, name: true, email: true, role: true, address: true, bankAccount: true }
        });

        res.json({ message: 'Profile successfully updated', user });
    } catch (error) {
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

// Upgrade Subscription
router.post('/upgrade', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const { tier } = req.body;

        if (!['FREE', 'PRO', 'PREMIUM'].includes(tier)) {
            return res.status(400).json({ error: 'Invalid subscription tier' });
        }

        const user = await prisma.user.update({
            where: { id: req.user?.userId },
            data: { subscriptionTier: tier },
            select: { id: true, name: true, email: true, role: true, subscriptionTier: true }
        });

        res.json({ message: 'Subscription successfully upgraded', user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
