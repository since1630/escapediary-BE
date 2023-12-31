const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');

const routes = require('./routes/index.js'); //! 여기 수정 해봄

const dotenv = require('dotenv');
dotenv.config();

// app.use(cors())
// post 됨 A-O 별표로 뜸
// 로그인 됬고 쿠키는 없고

app.use(
  cors({
    origin: [
      'https://escapediary-fe-snowy.vercel.app',
      'https://escapediary-fe.vercel.app',
    ],
    credentials: true,
  })
);
// 됨. 인증 써놓으니까 쿠키도 넘어감 보관도 되고

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api', routes);

//에러 핸들러
app.use((err, req, res, next) => {
  const errorMessage = err.stack;
  console.error('errorMessage:', errorMessage);
  return res.status(err.status).json({
    errorMessage: err.message,
  });
});

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log(`${process.env.PORT || 3000} 포트에 접속 되었습니다.`);
});
