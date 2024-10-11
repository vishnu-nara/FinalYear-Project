const express = require('express');
const router = express.Router();
const multer = require('multer');
const sellerController = require('../controllers/SellerController');

const storage = multer.memoryStorage();
const limits = {
    fileSize: 50 * 1024 * 1024,
};
const upload = multer({ storage: storage, limits: limits });

router.post('/signin', sellerController.getSellersByEmail);
router.get('/get/:id', sellerController.getSellerById);
router.post('/add', sellerController.addSeller);
router.post('/edit/details/:id', upload.single('sellerAvatar'), sellerController.editSeller);
router.get('/signout', sellerController.signOutSeller);
router.get('/loc/get', sellerController.getSellersForMap)

module.exports = router;
