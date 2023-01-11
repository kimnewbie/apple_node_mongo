// const MONGO_CLIENT_CONNECTOR = process.env.MONGO_CLIENT_CONNECTOR;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
/* css 파일 사용 (나는 static 파일을 보관하기 위해 public 폴더를 쓸거다) */
app.use('/public', express.static('public'));

var db; // db  변수 지정 필수(어떤 db에 저장할 것인지)
/* MongoDB@3.6.4 연결 */
const MongoClient = require("mongodb").MongoClient;
MongoClient.connect('mongodb+srv://admin:Cancho429^^@cluster0.9bab5uw.mongodb.net/?retryWrites=true&w=majority', (에러, client) => {
  // 에러 처리
  if (에러) return console.log(에러);

  // todoapp 이라는 database(폴더)에 연결
  db = client.db('todoapp');

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
    app.get("/", (요청, 응답) => {
      응답.sendFile(__dirname + "/index.html");
    });
    app.get("/write", (요청, 응답) => {
      응답.sendFile(__dirname + "/write.html");
    });
*/

/* html 에서 ejs 파일로 변경 */
app.get("/", (요청, 응답) => {

})
app.get("/write", (요청, 응답) => {

})
/*
  어떤 사람이 /add 경로로 post 요청을하면 ~해주세요
*/
app.post("/add", (요청, 응답) => {
  응답.send("전송 완료");
  // 보내면 요청이라는 파라미터에 숨어있음. body parser 다운 받아야 보임
  // 콘솔창에서 확인 가능
  console.log(요청.body);

  // /add 라는 경로로 post 요청을 하면 데이터 2개(제목, 날짜데이터)를 보내주는데
  // 이 때, post라는 이름을 가진 collection에 두개 데이터 저장하기

  // 글 번호 달아서 저장하기
  // _id : 총 게시글 개수 + 1 (mongo db에는 auto increment가 없어서 직접 만들어야함)
  // todoapp > Create Database > counter > insert document > 
  // totalPost: 0 (int32), name: '게시물개수'
  // 1개만 필요해서 findOne
  db.collection('counter').findOne({ name: '게시물개수' }, (에러, 결과) => {
    var 총게시물개수 = 결과.totalPost;
    db.collection('post').insertOne({ _id: 결과.totalPost + 1, todo: 요청.body.todo, date: 요청.body.date }, (에러, 결과) => {
      console.log('저장완료');
      // counter라는 collection에 있는 totalPost라는 항목도 1 증가시켜야함(Update)
      db.collection('counter').updateOne({ name: '게시물개수' }, { $inc: { totalPost: 1 } }, (에러, 결과) => {
        if (에러) return console.log(에러);
      });
    });
  });
});

/*
  /list로 GET요청으로 접속하면
  실제 DB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여줌
  **ejs 파일 보여주기
 */
app.get('/list', (요청, 응답) => {
  // 1. 데이터 꺼내기
  // ejs error 화면이 뜬다면 위치는 views 폴더 안에 생성
  // post에 저장된 모든 데이터 가져오기(find().toArray())
  db.collection('post').find().toArray((에러, 결과) => {
    // 2. 찾은걸 ejs파일에 집어넣어주세요
    응답.render('list.ejs', { posts: 결과 });
    console.log(결과)
  });
});

/* DELETE */
app.delete('/delete', (요청, 응답) => {
  console.log(요청.body); // delete 요청할 경우 출력 가능 
  // 요청.body에 담겨운 게시물 번호를 가진 글을 db에서 찾아서 삭제해주세요.
  요청.body._id = parseInt(요청.body._id); // 숫자로 변환
  db.collection('post').deleteOne(요청.body, (에러, 결과) => {
    console.log('삭제 완료');
    /* 서버는 꼭 뭔가 응답해줘야 함 */
    응답.status(200).send({ message: '성공했습니다' }); // 응답코드 200(성공)으로 보내주세요~
    // 응답.status(400).send({ message: '실패했습니다' }); // 응답코드 400(고객 잘못 실패)으로 보내주세요~
  });
  // 응답.send('삭제 완료')
});

/* DETAIL */
app.get('/detail/:id', (요청, 응답) => {
  db.collection('post').findOne({ _id: parseInt(요청.params.id) }, (에러, 결과) => {
    console.log(결과)
    응답.render('detail.ejs', { data: 결과 });
  });
});