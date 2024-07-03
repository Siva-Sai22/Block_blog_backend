const express = require('express');
require('dotenv').config();
const pinataSDK = require('@pinata/sdk');
const multer = require('multer');

const router = express.Router();
const pinata = new pinataSDK(process.env.API_KEY, process.env.API_SECRET);
const gateway = process.env.GATEWAY;

router.get('/blogs', async (req, res) => {
    const posts = [];
    for await (const item of pinata.getFilesByCount({ status: 'pinned' }, 10)) {
        if(!item) continue;
        try {
            const response = await fetch(
                `http://localhost:3000/api/blog/${item.ipfs_pin_hash}`,
            );
            if (response.ok) {
                const json = await response.json();
                posts.push({ title:json.title, thumbnail: json.thumbnail, ipfs_hash: item.ipfs_pin_hash});
            } else {
                console.error("error");
            }
        } catch (err) {
            console.error(err);
        }
    }
    res.send(posts);
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/blog', upload.single("thumbnail"), async (req, res) => {
    try {
        const thumbnail = req.file.buffer;
        const { content, title } = req.body;
        const result = await pinata.pinJSONToIPFS({ content, title, thumbnail });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/blog/:hash', async (req, res) => {
    const { hash } = req.params;
    const url = `${gateway}/${hash}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from IPFS gateway: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/blog/:hash', async (req, res) => {
    const { hash } = req.params;
    try {
        const result = await pinata.unpin(hash);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;