"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const offers_1 = __importDefault(require("./routes/offers"));
const users_1 = __importDefault(require("./routes/users"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const support_1 = __importDefault(require("./routes/support"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Serve uploaded local images statically
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/offers', offers_1.default);
app.use('/api/users', users_1.default);
app.use('/api/uploads', uploads_1.default);
app.use('/api/support', support_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // We'll restrict this in prod
        methods: ['GET', 'POST']
    }
});
exports.io = io;
io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
