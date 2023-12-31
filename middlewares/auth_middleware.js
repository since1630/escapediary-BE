const jwt = require('jsonwebtoken');
const { Users } = require('../models');

// 사용자 인증 미들웨어
const verifyToken = async (req, res, next) => {
  // console.log(req.cookies);

  if (!req.cookies || typeof req.cookies !== 'object') {
    console.error('No cookies found.');
    res.status(401).send({ errorMessage: 'No cookies found.' });
    return;
  }

  const { Authorization } = req.cookies;
  // console.log(Authorization);
  const [authType, authToken] = (Authorization ?? '').split(' ');
  // console.log('authType:', authType);
  // console.log('authToken:', authToken);
  try {
    if (!authToken) {
      res.status(401).send({
        errorMessage: '옳바르지 않은 토큰입니다.',
      });
      return;
    }
    if (authType !== 'Bearer') {
      res.status(402).send({
        errorMessage: '쿠키를 불러오는데 실패하였습니다.',
      });
    }

    const { id } = jwt.verify(authToken, process.env.JWT_SECRET_KEY); // signature 토큰이 짤리는 바람에 수정 해야 했음. 이전 키는 my-secret-key

    console.log('/user_id:', id);

    const user = await Users.findOne({ where: { id } });

    console.log('user:', user);
    res.locals.user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).send({
      errorMessage: '권한 인증에 실패하였습니다.',
    });
  }
};

module.exports = verifyToken;
