"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all products (Public)
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const whereClause = category && category !== 'ALL' ? { category: category } : {};
        const products = await db_1.prisma.product.findMany({
            where: whereClause,
            include: { seller: { select: { name: true, reputationScore: true } } }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Get product by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const product = await db_1.prisma.product.findUnique({
            where: { id: req.params.id },
            include: { seller: { select: { name: true, reputationScore: true } } }
        });
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// Create a Product (Seller only)
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user?.role !== 'SELLER' && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only sellers can create products' });
        }
        const user = await db_1.prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const tier = user.subscriptionTier;
        if (tier === 'FREE') {
            const productCount = await db_1.prisma.product.count({ where: { sellerId: req.user.userId } });
            if (productCount >= 1) {
                return res.status(403).json({ error: 'Free tier is limited to 1 active listing. Upgrade to Pro for more!' });
            }
        }
        else if (tier === 'PRO') {
            const productCount = await db_1.prisma.product.count({ where: { sellerId: req.user.userId } });
            if (productCount >= 10) {
                return res.status(403).json({ error: 'Pro tier is limited to 10 active listings. Switch to Premium for Unlimited!' });
            }
        }
        const { title, description, category, images, publicPrice, autoAcceptFloorPrice, autoCounterFloorPrice, inventoryCount } = req.body;
        const newProduct = await db_1.prisma.product.create({
            data: {
                sellerId: req.user.userId,
                title,
                description,
                category: category || 'FERTILIZERS',
                images,
                publicPrice,
                autoAcceptFloorPrice,
                autoCounterFloorPrice,
                inventoryCount: inventoryCount || 1,
            }
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
