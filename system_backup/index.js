const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));

// Basic file check - no automatic systems
function ensureDataFiles() {
    const files = [
        { name: 'users.json', default: [] },
        { name: 'videos.json', default: [] },
        { name: 'categories.json', default: [
            { id: 1, name: "Entertainment", icon: "fas fa-tv" },
            { id: 2, name: "Education", icon: "fas fa-graduation-cap" }
        ] },
        { name: 'ads.json', default: [] },
        { name: 'earnings.json', default: { totalEarnings: 0, adViews: 0, balance: 0, transactions: [] } }
    ];

    files.forEach(file => {
        if (!fs.existsSync(file.name)) {
            fs.writeFileSync(file.name, JSON.stringify(file.default, null, 2));
        }
    });
}

// Initialize data files
ensureDataFiles();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Video APIs
app.get('/api/videos', (req, res) => {
    try {
        const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
        res.json(videos);
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/videos/upload', upload.single('video'), (req, res) => {
    try {
        const { title, description, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No video file uploaded' });
        }

        const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8') || '[]');

        const newVideo = {
            id: Date.now(),
            title: title || 'Untitled Video',
            description: description || '',
            category: category || 'Uncategorized',
            filename: req.file.filename,
            path: req.file.path,
            uploadDate: new Date().toISOString(),
            views: 0,
            likes: 0,
            dislikes: 0
        };

        videos.push(newVideo);
        fs.writeFileSync('videos.json', JSON.stringify(videos, null, 2));

        res.json({ success: true, video: newVideo });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Upload failed' });
    }
});

// Categories API
app.get('/api/categories', (req, res) => {
    try {
        const categories = JSON.parse(fs.readFileSync('categories.json', 'utf8'));
        res.json(categories);
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/categories', (req, res) => {
    try {
        const { name, icon } = req.body;
        const categories = JSON.parse(fs.readFileSync('categories.json', 'utf8') || '[]');

        const newCategory = {
            id: Date.now(),
            name: name,
            icon: icon || 'fas fa-folder'
        };

        categories.push(newCategory);
        fs.writeFileSync('categories.json', JSON.stringify(categories, null, 2));

        res.json({ success: true, category: newCategory });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to add category' });
    }
});

// Ads API
app.get('/api/ads', (req, res) => {
    try {
        const ads = JSON.parse(fs.readFileSync('ads.json', 'utf8'));
        res.json(ads);
    } catch (error) {
        res.json([]);
    }
});

// Earnings API
app.get('/api/earnings', (req, res) => {
    try {
        const earnings = JSON.parse(fs.readFileSync('earnings.json', 'utf8'));
        res.json(earnings);
    } catch (error) {
        res.json({ totalEarnings: 0, adViews: 0, balance: 0, transactions: [] });
    }
});

// Analytics API
app.get('/api/analytics/overview', (req, res) => {
    try {
        const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8') || '[]');
        const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
        const totalVideos = videos.length;

        res.json({
            totalVideos,
            totalViews,
            totalEarnings: 10000,
            averageViews: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

// SEO API
app.get('/api/seo/analysis', (req, res) => {
    res.json({
        score: 85,
        suggestions: [
            'Add meta descriptions to all pages',
            'Optimize images with alt tags',
            'Improve page loading speed'
        ],
        keywords: ['video platform', 'entertainment', 'streaming']
    });
});

// Storage API
app.get('/api/storage/status', (req, res) => {
    res.json({
        used: '75MB',
        available: '925MB',
        total: '1GB',
        percentage: 7.5
    });
});

// Algorithm API
app.get('/api/algorithm/status', (req, res) => {
    res.json({
        active: true,
        optimization: 'Standard',
        recommendations: 'Active',
        performance: 'Good'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('==========================================');
    console.log('🎬 TubeClone Server Started');
    console.log(`🌐 Server running on port ${PORT}`);
    console.log('📺 Video platform ready');
    console.log('👑 Admin available at /admin');
    console.log('🔧 Basic systems only - No automatic AI');
    console.log('==========================================');
});