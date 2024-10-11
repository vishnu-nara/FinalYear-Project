const express = require('express');
const router = express.Router();
const multer = require('multer');
const product = require('../controllers/ProductController');

const storage = multer.memoryStorage();
const limits = {
    fileSize: 50 * 1024 * 1024,
};
const upload = multer({ storage: storage, limits: limits });

router.get('/get', product.getProducts);
router.get('/get/:id', product.getProductById);
router.post('/add', upload.single('productImage'), product.addProducts);
router.post('/edit/:id', upload.single('productImage'), product.editProductById);
router.delete('/delete/:id', product.deleteProductById);
router.get('/user/get', product.getUserProducts);
router.get('/seller/:sellerId', product.getProductsBySeller);
router.get('/category/:productCategory', product.getProductsByCategory);
/* router.get('/user/category/:productCategory', product.getUserProductsByCategory); */


module.exports = router;