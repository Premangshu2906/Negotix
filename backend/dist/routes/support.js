"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Use FormSubmit to securely send emails without needing a password in the codebase.
        // It requires a POST request to their endpoint with the target email.
        const targetEmail = 'premangshuc3@gmail.com';
        const subject = `BargainHub Support Ticket from User ${user.userId}`;
        const emailBody = `
User Details:
ID: ${user.userId}
Role: ${user.role}

Message:
${message}
        `;
        try {
            const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': req.headers.origin || 'http://localhost:3000',
                    'Referer': req.headers.referer || 'http://localhost:3000',
                    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                },
                body: JSON.stringify({
                    _subject: subject,
                    message: emailBody,
                    _replyto: "noreply@bargainhub.com"
                })
            });
            if (!response.ok) {
                throw new Error(`FormSubmit responded with status ${response.status}`);
            }
            console.log('Support email request sent via FormSubmit successfully.');
        }
        catch (mailError) {
            console.error('Failed to dispatch support email via FormSubmit:', mailError);
            return res.status(500).json({ error: 'Failed to dispatch email. Please try again later.' });
        }
        res.status(200).json({ success: true, message: 'Support ticket submitted successfully' });
    }
    catch (error) {
        console.error('Support route error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
