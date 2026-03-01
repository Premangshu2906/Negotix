import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

import { sendOTP } from '../lib/email';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_bargainhub_key';

// OTP sending logic removed

// Register User
router.post('/register', async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: role || 'BUYER',
                isVerified: true, // Auto-verify since we disabled OTP
            },
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login User
router.post('/login', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
