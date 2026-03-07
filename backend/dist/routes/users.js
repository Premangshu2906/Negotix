"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get current user details (including sub tier)
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user?.userId },
            select: { id: true, name: true, email: true, role: true, subscriptionTier: true, reputationScore: true, address: true, bankAccount: true }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Update Seller Profile (Address & Bank Account)
router.put('/profile', auth_1.authenticate, async (req, res) => {
    try {
        const { address, bankAccount } = req.body;
        const user = await db_1.prisma.user.update({
            where: { id: req.user?.userId },
            data: { address, bankAccount },
            select: { id: true, name: true, email: true, role: true, address: true, bankAccount: true }
        });
        res.json({ message: 'Profile successfully updated', user });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error updating profile' });
    }
});
// Upgrade Subscription
router.post('/upgrade', auth_1.authenticate, async (req, res) => {
    try {
        const { tier } = req.body;
        if (!['FREE', 'PRO', 'PREMIUM'].includes(tier)) {
            return res.status(400).json({ error: 'Invalid subscription tier' });
        }
        const user = await db_1.prisma.user.update({
            where: { id: req.user?.userId },
            data: { subscriptionTier: tier },
            select: { id: true, name: true, email: true, role: true, subscriptionTier: true }
        });
        res.json({ message: 'Subscription successfully upgraded', user });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
