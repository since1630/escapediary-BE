const express = require('express');
const router = express.Router();
const { Users, Posts } = require('../models');
const verifyToken = require('../middlewares/auth_middleware');
const postsSchema = require('../schemas/posts.schema.js');

// 게시글 전체 조회
router.get('/', async (req, res) => {
  // 직전 /users 에서 유저의 토큰 정보를 갖고 와야하는데 미들웨어가 없었음.
  try {
    const posts = await Posts.findAll({
      attributes: [
        'postId',
        'UserId',
        'title',
        'roomname',
        'content',
        'star',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: Users,
          attributes: ['id'],
        },
      ],
      order: [['createdAt', 'DESC']],
      raw: true,
    });
    const formattedPosts = posts.map((post) => {
      return {
        //* 포맷팅
        postId: post.postId,
        // UserId: post.UserId,
        title: post.title,
        roomname: post.roomname,
        id: post['User.id'],
        content: post.content,
        star: post.star,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });
    return res.status(200).json({ posts: formattedPosts });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ errorMessage: '게시글 조회에 실패하였습니다.' });
  }
});

// 게시글 작성
router.post('/', verifyToken, async (req, res) => {
  const { title, content, roomname, star } = req.body;
  const { userId } = res.locals.user;
  try {
    const postsData = { title, content, roomname, star };
    const { error } = postsSchema.validate(postsData);
    if (error) {
      return res.status(412).json({ message: error.details[0].message });
    }

    await Posts.create({ UserId: userId, title, content, roomname, star });

    return res.status(201).json({ message: '게시글 작성에 성공하였습니다' });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ errorMessage: '게시글 작성에 실패하였습니다.' });
  }
});

// 게시글 상세 조회
router.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Posts.findOne({
      attributes: [
        'postId',
        'UserId',
        'title',
        'roomname',
        'content',
        'star',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: Users,
          attributes: ['id'],
        },
      ],
      where: { postId: postId },
      order: [['createdAt', 'DESC']],
      raw: true,
    });
    const formattedPosts = {
      //* 포맷팅
      postId: post.postId,
      // UserId: post.UserId,
      title: post.title,
      roomname: post.roomname,
      id: post['User.id'],
      content: post.content,
      star: post.star,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    return res.status(200).json({ post: formattedPosts });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ errorMessage: '게시글 조회에 실패하였습니다.' });
  }
});

// 게시글 수정
router.put('/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, roomname, star } = req.body;
    const { userId } = res.locals.user;

    const postsData = { title, content, roomname, star };
    const { error } = postsSchema.validate(postsData);
    if (error) {
      return res.status(412).json({ message: error.details[0].message });
    }

    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (post.UserId !== userId) {
      return res
        .status(403)
        .json({ message: '게시글 수정의 권한이 존재하지 않습니다.' });
    }

    await Posts.update(
      { title, content, roomname, star },
      { where: { postId } }
    );
    return res.status(200).json({ message: '게시글을 수정하였습니다.' });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: '게시글 수정에 실패하였습니다' });
  }
});
// 게시글 삭제
router.delete('/:postId', verifyToken, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.params;

    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    if (userId !== post.UserId) {
      return res
        .status(403)
        .json({ errorMessage: '게시글의 삭제 권한이 존재하지 않습니다.' });
    }

    const deletePost = await Posts.destroy({ where: { postId } });
    if (deletePost) {
      return res.status(200).json({ Message: '게시글을 삭제하였습니다.' });
    } else {
      return res
        .status(401)
        .json({ errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.' });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ errorMessage: '게시글 작성에 실패하였습니다.' });
  }
});

module.exports = router;
