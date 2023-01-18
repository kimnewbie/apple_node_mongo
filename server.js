// const MONGO_CLIENT_CONNECTOR = process.env.MONGO_CLIENT_CONNECTOR;
require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
/* css 파일 사용 (나는 static 파일을 보관하기 위해 public 폴더를 쓸거다) */
app.use('/public', express.static('public'));
/* PUT/DELETE 사용 */
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

var db; // db  변수 지정 필수(어떤 db에 저장할 것인지)
/* MongoDB@3.6.4 연결 */
const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(process.env.MONGO_CLIENT_CONNECTOR, (에러, client) => {
  // 에러 처리
  if (에러) return console.log(에러);

  // todoapp 이라는 database(폴더)에 연결
  db = client.db('todoapp');

  //서버띄우는 코드 여기로 옮기기
  app.listen(process.env.PORT, function () {
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

// html 보내주기
// app.get("/", (요청, 응답) => {
//   응답.sendFile(__dirname + "/index.html");
// });
// app.get("/write", (요청, 응답) => {
//   응답.sendFile(__dirname + "/write.html");
// });

/* html 에서 ejs 파일로 변경 */
app.get("/", (요청, 응답) => {
  응답.render('index.ejs');
})
app.get("/write", (요청, 응답) => {
  응답.render('write.ejs');
});

/*
 * /list에서 query string 꺼내기 (검색 기능)
  Binaary Search 적용을 위한 indexing 방법
    - mongo db > indexes > create index >  
    {
      "todo": "text", 
    }
 */
app.get('/search', (요청, 응답) => {
  console.log(요청.query.value);
  /* 
    정규식 -> /요청.query.value/ -> but 자료 많을 때 오래걸림 
    todo: 요청.query.value  대신 text:{ $search: 요청.query.value }
    [2]
    db.collection('post').find({ $text: { $search: 요청.query.value } })
    대신

  */
  var 검색조건 = [
    {
      $search: {
        index: 'titleSearch', // '님이만든인덱스명'
        text: {
          query: 요청.query.value,
          path: 'todo' // 'todo'  // 제목날짜 둘다 찾고 싶으면 ['todo', 'date']
        }
      }
    },
    { $sort: { _id: 1 } },
    // { $limit: 10 },
    // { $project: { todo: 1, _id: 0, date: 1, score: { $meta: "searchScore" } } } // 1: 가져온다, 0: 안가져온다
  ]
  db.collection('post').aggregate(검색조건).toArray((에러, 결과) => {
    console.log(결과)
    응답.render('search.ejs', { posts: 결과 });
  });
});

/* DETAIL */
app.get('/detail/:id', (요청, 응답) => {
  db.collection('post').findOne({ _id: parseInt(요청.params.id) }, (에러, 결과) => {
    console.log(결과)
    응답.render('detail.ejs', { data: 결과 });
  });
});

/* EDIT */
app.get('/edit/:id', (요청, 응답) => {
  db.collection('post').findOne({ _id: parseInt(요청.params.id) }, (에러, 결과) => {
    console.log(결과)
    응답.render('edit.ejs', { post: 결과 })
  });
});

app.put('/edit', (요청, 응답) => {
  // 폼에 담긴 제목, 날짜 데이터를 가지고 db.collection에다가 업데이트 함
  // 요청.body.id => input id가 id인 것 찾아오기
  db.collection('post').updateOne({ _id: parseInt(요청.body.id) }, { $set: { todo: 요청.body.todo, date: 요청.body.date } }, (에러, 결과) => {
    console.log('수정 완료');
    응답.redirect('/list'); // 수정 완료 후 /list로 이동
  });
});

app.get('/fail', (요청, 응답) => {
  응답.render('fail.ejs');
});

/* Authentication by Session */
/* Authentication by Session */
/* Authentication by Session */
const passport = require('passport'); // 로그인 기능 쉽게 구현 도와줌
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// app.use(미들웨어) > 웹서버는 요청-응답해주는 머신
app.use(session({ secret: '비밀코드', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (요청, 응답) => {
  응답.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
  /* local 방식으로 인증 'local' */
  /* 로그인 실패하면 /fail로 이동 */
  failureRedirect: '/fail'
}), (요청, 응답) => {
  응답.redirect('/'); // 회원 인증 성공하고 그러면 redirect
});

app.get('/mypage', 로그인했니, (요청, 응답) => {
  /* 로그인 한 사람만 들어올 수 있도록 */
  응답.render('mypage.ejs', { 사용자: 요청.user });
});
/* 마이페이지 접속 전 실행할 미들웨어 */
function 로그인했니(요청, 응답, next) {
  if (요청.user) {
    /* 로그인 후 세션이 있으면 요청.user가 항상 있음 */
    next();
  } else {
    응답.send('로그인해주세요');
  }
}

/* 아이디 비번 인증하는 세부 코드 작성 */
passport.use(new LocalStrategy({
  usernameField: 'id', // (요기는 사용자가 제출한 아이디(input id)가 어디 적혔는지) 
  passwordField: 'password', // (요기는 사용자가 제출한 비번(input id)이 어디 적혔는지) 
  session: true, // (요기는 세션을 만들건지) 
  passReqToCallback: false, // (요기는 아이디/비번말고 다른 정보검사가 필요한지) 
}, (입력한아이디, 입력한비번, done) => {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)
    /* 일치하는 정보가 없다 */
    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.password) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));
/* id를 이용해서 세션을 저장시키는 코드(로그인 성공시 발동) */
/* 위에 보이는 return done(null, 결과)에서 결과값이 user로 들어감 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});
/* 이 세션 데이터를 가진 사람을 DB에서 찾아주세요(마이페이지 접속시 발동) */
/* 위 serializeUser의 user가 밑에 아이디와 같음 */
passport.deserializeUser((아이디, done) => {
  // 디비에서 위에있는 user.id로 유저를 찾은 뒤에 유저 정보를 넣음 done(null,{})
  db.collection('login').findOne({ id: 아이디 }, (에러, 결과) => {
    console.log(결과)
    done(null, 결과);
  })
});

/* ⭐ 회원기능이 필요하면 passport 세팅하는 부분이 위에 있어야 함 ⭐ */
app.post('/register', (요청, 응답) => {
  db.collection('login').insertOne({ id: 요청.body.id, password: 요청.body.password }, (에러, 결과) => {
    응답.redirect('/');
  });
});

/* ⭐ 위에 있으면 user._id를 찾을 수 없어서 밑으로 자리 이동 ⭐ */
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

    /* 🤠 register 만든 뒤, 글 쓸 때 글쓴이도 적어주는 기능 추가 */
    /* 요청.user : 현재 로그인한 사람의 정보가 들어있는 부분 */

    var 저장할거 = { _id: 결과.totalPost + 1, todo: 요청.body.todo, date: 요청.body.date, writerId: 요청.user._id };

    db.collection('post').insertOne(저장할거, (에러, 결과) => {
      console.log('저장완료');
      // counter라는 collection에 있는 totalPost라는 항목도 1 증가시켜야함(Update)
      db.collection('counter').updateOne({ name: '게시물개수' }, { $inc: { totalPost: 1 } }, (에러, 결과) => {
        if (에러) return console.log(에러);
      });
    });
  });
});

/* ⭐ 위에 있으면 user._id를 찾을 수 없어서 밑으로 자리 이동 ⭐ */
/* DELETE */
app.delete('/delete', (요청, 응답) => {
  // 요청.body에 담겨운 게시물 번호를 가진 글을 db에서 찾아서 삭제해주세요.
  요청.body._id = parseInt(요청.body._id); // 숫자로 변환

  /* 🤠 기능추가 :: 실제 로그인 중인 유저의_id와 글에 저장된 유저의_id가 일치하면 삭제  */
  var 삭제할데이터 = { _id: 요청.body._id, writerId: 요청.user._id }

  db.collection('post').deleteOne(삭제할데이터, (에러, 결과) => {
    /* 서버는 꼭 뭔가 응답해줘야 함 */
    console.log('로그인 아이디', 요청.user._id)
    console.log('삭제 완료')
    console.log('에러', 에러)
    응답.status(200).send({ message: '성공했습니다' }); // 응답코드 200(성공)으로 보내주세요~
    // 응답.status(400).send({ message: '실패했습니다' }); // 응답코드 400(고객 잘못 실패)으로 보내주세요~
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
  });
});





/* routes 적용 */
/* shop으로 시작하는 라우트 */
app.use('/shop', require('./routes/shop.js'));
/* board/sub으로 시작하는 라우트 */
app.use('/board/sub', require('./routes/board.js'));