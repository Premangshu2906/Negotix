"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const index_1 = require("../index");
const router = express_1.default.Router();
// Helper to determine AI response
const processSmartOffer = (offerAmount, acceptFloor, counterFloor) => {
    // If the offer is above the strict accept floor, we naturally accept
    if (offerAmount >= acceptFloor) {
        return { status: 'ACCEPTED' };
    }
    // If the offer is strictly below the counter floor limit, reject entirely
    else if (offerAmount < counterFloor) {
        return { status: 'REJECTED' };
    }
    // If the offer is anywhere between or equal to the counter floor, ACCEPT IT directly.
    // The seller specified the counterFloor as their absolute minimum, so any valid offer
    // above it should be taken instead of arbitrarily increasing the price.
    else {
        return { status: 'ACCEPTED' };
    }
};
// Create Offer (Buyer only)
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user?.role !== 'BUYER' && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only buyers can make offers' });
        }
        const { productId, offerAmount } = req.body;
        const buyerId = req.user.userId;
        const user = await db_1.prisma.user.findUnique({ where: { id: buyerId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const tier = user.subscriptionTier;
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Calculate used limits
        const [offersThisProduct, offersThisMonth] = await Promise.all([
            db_1.prisma.offer.count({ where: { buyerId, productId } }),
            db_1.prisma.offer.count({ where: { buyerId, createdAt: { gte: firstDayOfMonth } } })
        ]);
        if (tier === 'FREE') {
            if (offersThisProduct >= 3) {
                return res.status(403).json({ error: 'Free tier is limited to 3 negotiations per product. Upgrade to Pro!' });
            }
            if (offersThisMonth >= 25) {
                return res.status(403).json({ error: 'Free tier is limited to 25 negotiations per month. Upgrade to Pro!' });
            }
        }
        else if (tier === 'PRO') {
            if (offersThisProduct >= 5) {
                return res.status(403).json({ error: 'Pro tier is limited to 5 negotiations per product. Switch to Premium for 10!' });
            }
            if (offersThisMonth >= 50) {
                return res.status(403).json({ error: 'Pro tier is limited to 50 negotiations per month. Switch to Premium for Unlimited!' });
            }
        }
        else if (tier === 'PREMIUM') {
            if (offersThisProduct >= 10) {
                return res.status(403).json({ error: 'Premium tier allows a maximum of 10 negotiations per product.' });
            }
            // Premium has unlimited negotiations per month
        }
        const product = await db_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
        if (product.inventoryCount <= 0)
            return res.status(400).json({ error: 'Product out of stock' });
        const aiResponse = processSmartOffer(offerAmount, product.autoAcceptFloorPrice, product.autoCounterFloorPrice);
        // Add history log
        const history = [{
                type: 'BUYER_OFFER',
                amount: offerAmount,
                timestamp: new Date().toISOString()
            }];
        if (aiResponse.status === 'AUTO_COUNTERED') {
            history.push({
                type: 'SELLER_AI_COUNTER',
                amount: aiResponse.counterAmount || 0,
                timestamp: new Date().toISOString()
            });
        }
        let expiresAt = null;
        if (aiResponse.status === 'ACCEPTED') {
            // Set to 10 minutes from now
            expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        }
        const offer = await db_1.prisma.offer.create({
            data: {
                productId,
                buyerId,
                sellerId: product.sellerId,
                offerAmount: aiResponse.counterAmount || offerAmount,
                status: aiResponse.status,
                expiresAt,
                history: JSON.stringify(history)
            }
        });
        // Fire WebSocket Events
        if (aiResponse.status === 'ACCEPTED') {
            index_1.io.emit(`offer_accepted_${buyerId}`, { offer });
            index_1.io.emit(`offer_accepted_seller_${product.sellerId}`, { offer });
        }
        else if (aiResponse.status === 'REJECTED') {
            index_1.io.emit(`offer_rejected_${buyerId}`, { offer });
        }
        else if (aiResponse.status === 'AUTO_COUNTERED') {
            index_1.io.emit(`offer_countered_${buyerId}`, { offer });
        }
        res.status(201).json(offer);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Accept Offer (Seller Only - Manually)
router.post('/:id/accept', auth_1.authenticate, async (req, res) => {
    try {
        const offerId = req.params.id;
        const offer = await db_1.prisma.offer.findUnique({ where: { id: offerId } });
        if (!offer)
            return res.status(404).json({ error: 'Offer not found' });
        if (req.user?.userId !== offer.sellerId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const updatedOffer = await db_1.prisma.offer.update({
            where: { id: offerId },
            data: { status: 'ACCEPTED', expiresAt }
        });
        index_1.io.emit(`offer_accepted_${updatedOffer.buyerId}`, { offer: updatedOffer });
        res.json(updatedOffer);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Reject Offer (Seller Only - Manually)
router.post('/:id/reject', auth_1.authenticate, async (req, res) => {
    try {
        const offerId = req.params.id;
        const offer = await db_1.prisma.offer.findUnique({ where: { id: offerId } });
        if (!offer)
            return res.status(404).json({ error: 'Offer not found' });
        if (req.user?.userId !== offer.sellerId && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const updatedOffer = await db_1.prisma.offer.update({
            where: { id: offerId },
            data: { status: 'REJECTED' }
        });
        index_1.io.emit(`offer_rejected_${updatedOffer.buyerId}`, { offer: updatedOffer });
        res.json(updatedOffer);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Get user's offers
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const offers = await db_1.prisma.offer.findMany({
            where: {
                OR: [
                    { buyerId: req.user?.userId },
                    { sellerId: req.user?.userId }
                ]
            },
            include: { product: true }
        });
        res.json(offers);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
