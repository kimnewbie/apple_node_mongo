const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
  "mongodb+srv://admin:Cancho429^^@cluster0.9bab5uw.mongodb.net/?retryWrites=true&w=majority",
  (에러, client) => {
    if (에러) return console.log(에러);
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
});
