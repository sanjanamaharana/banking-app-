const router = require('express').Router();
const { getMyAccounts, getAccount, createAccount, getStatement } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getMyAccounts);
router.post('/', createAccount);
router.get('/:id', getAccount);
router.get('/:id/statement', getStatement);

module.exports = router;
