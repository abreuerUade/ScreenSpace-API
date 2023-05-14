const router = require('express').Router();

router.get('/welcome', (req, res) => {
    res.status(200).render('accountCreated');
});

module.exports = router;
