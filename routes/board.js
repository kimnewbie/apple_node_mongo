var router = require('express').Router();

/*
 * router.get('/sports', [개별 URL 미들웨어 적용], function (요청, 응답) {}
 */

/* server.js에서 미들 웨어 가지고 옴 */
function 로그인했니(요청, 응답, next) {
  if (요청.user) {
    /* 로그인 후 세션이 있으면 요청.user가 항상 있음 */
    next();
  } else {
    응답.send('로그인해주세요');
  }
}

router.get('/sports', 로그인했니, function (요청, 응답) {
  응답.send('스포츠 게시판');
});

router.get('/game', 로그인했니, function (요청, 응답) {
  응답.send('게임 게시판');
});

/* 
  일단 Node.js 환경에서 JS파일들을 불러와서 쓸 수 있는데 
  그 문법이 바로 require() 이것과 module.exports
 */
module.exports = router;