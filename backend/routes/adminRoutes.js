const router = require('express').Router();
const { getDashboard, getAllUsers, toggleUser, getAllTransactions } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/transactions', getAllTransactions);

module.exports = router;
