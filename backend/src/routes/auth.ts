import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';

import { sendOTP } from '../lib/email';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_bargainhub_key';

// Send OTP for Registration
router.post('/send-otp', async (req: Request, res: Response): Promise<any> => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // If user already requested an OTP but isn't verified, update it. If not, create a temp record.
        if (existingUser && !existingUser.isVerified) {
            await prisma.user.update({
                where: { email },
                data: { verificationCode: otp }
            });
        } else {
            // Create scaffolding user just to hold the verification code.
            // We pad a dummy password temporarily
            await prisma.user.create({
                data: {
                    name: 'Pending User',
                    email,
                    passwordHash: 'pending',
                    verificationCode: otp,
                    isVerified: false
                }
            });
        }

        const emailSent = await sendOTP(email, otp);
        if (!emailSent) {
            return res.status(500).json({ error: 'Failed to send verification email.' });
        }

        res.status(200).json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Server error while sending OTP' });
    }
});

// Register User
router.post('/register', async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, email, password, role, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ error: 'Verification code is required' });
        }

        const pendingUser = await prisma.user.findUnique({ where: { email } });

        if (!pendingUser) {
            return res.status(400).json({ error: 'No verification request found for this email' });
        }

        if (pendingUser.isVerified) {
            return res.status(400).json({ error: 'User is already verified and registered' });
        }

        if (pendingUser.verificationCode !== otp) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Update the pending user with actual details and mark as verified
        const user = await prisma.user.update({
            where: { email },
            data: {
                name,
                passwordHash,
                role: role || 'BUYER',
                isVerified: true,
                verificationCode: null // clear code after use
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

        if (!user.isVerified) {
            return res.status(400).json({ error: 'Please verify your email before logging in' });
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
