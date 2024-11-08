const express = require('express');
const homePages = require('../controller/homePage.js');

const router = express.Router();

router.get('/home',homePages.getHomePage);

router.post("/login",homePages.postLogin);

router.get('/profile/:id',homePages.getProfilePage);

router.post('/upload',homePages.postProfile);

router.post('/uploadFile',homePages.postFile);

router.post('/follows',homePages.addFollowers);

router.post('/comment',homePages.postComment);

router.get('/othersProfile/:id',homePages.getOthersProfile);

module.exports = router;