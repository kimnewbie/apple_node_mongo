const MONGO_CLIENT_CONNECTOR = process.env.MONGO_CLIENT_CONNECTOR;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var db; // db  변수 지정 필수(어떤 db에 저장할 것인지)
/* MongoDB@3.6.4 연결 */
const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(MONGO_CLIENT_CONNECTOR, (에러, client) => {
  // 에러 처리
  if (에러) return console.log(에러);

  // todoapp 이라는 database(폴더)에 연결
  db = client.db('todoapp');

  // 본격적으로 db에 저장
  // 내 이름과 나이를 db에 저장
  db.collection('post').insertOne({ 이름: '차니니', 나이: 42 }, (에러, 결과) => {
    console.log('저장완료');
  });

  //서버띄우는 코드 여기로 옮기기
  app.listen("3030", function () {
    console.log("listening on 3030");
  });
}
);

// 내 컴퓨터에서 8080은 이미 사용중이어서 3030으로 변경함
// app.listen(3030, function () {
//   console.log("listening on 3030.");
// });

/* 
    누군가 /pet 으로 방문을 하면
    pet 관련 된 안내문을 띄어주자
 */
app.get("/pet", function (요청, 응답) {
  응답.send("펫 용품 쇼핑 페이지입니다.");
});

/* 
    누군가 /beauty 으로 방문을 하면
    beauty 관련 된 안내문을 띄어주자
 */
app.get("/beauty", function (요청, 응답) {
  응답.send("뷰티 용품 쇼핑 페이지입니다.");
});

/* 
    html 보내주기
 */
app.get("/", (요청, 응답) => {
  응답.sendFile(__dirname + "/index.html");
});
app.get("/write", (요청, 응답) => {
  응답.sendFile(__dirname + "/write.html");
});

/*
  어떤 사람이 /add 경로로 post 요청을하면 ~해주세요
*/
app.post("/add", (요청, 응답) => {
  응답.send("전송 완료");
  // 보내면 요청이라는 파라미터에 숨어있음. body parser 다운 받아야 보임
  console.log(요청.body);
  // 콘솔창에서 확인 가능  
  // /add 라는 경로로 post 요청을 하면 데이터 2개(제목, 날짜데이터)를 보내주는데
  // 이 때, post라는 이름을 가진 collection에 두개 데이터 저장하기
  db.collection('post').insertOne({ 제목: 요청.body.title, 날짜데이터: 요청.body.date }, (에러, 결과) => {
    console.log('저장완료');
  });
});
