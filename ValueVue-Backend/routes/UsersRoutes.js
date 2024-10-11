const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/UserController');

const storage = multer.memoryStorage();
const limits = {
    fileSize: 50 * 1024 * 1024,
};
const upload = multer({ storage: storage, limits: limits });

router.get('/getUser', userController.getUsers);
router.post('/get', userController.getUsersByEmail);
router.post('/add', userController.addUser);
router.post('/edit/details/:id', upload.single('userAvatar'), userController.editUser);
router.get('/signout', userController.signOutUser);

module.exports = router;
