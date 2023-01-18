var router = require('express').Router();

router.get('/shirts', function (요청, 응답) {
  응답.send('셔츠 파는 페이지입니다.');
});

router.get('/pants', function (요청, 응답) {
  응답.send('바지 파는 페이지입니다.');
});

/* 
  일단 Node.js 환경에서 JS파일들을 불러와서 쓸 수 있는데 
  그 문법이 바로 require() 이것과 module.exports
 */
module.exports = router;