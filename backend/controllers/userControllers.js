const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search //user 찾기
    ? {
      $or: [ //mongodb 연산자
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("모든 항목을 다 입력해주세요.");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("사용자가 이미 존재합니다.");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({ // 성공
      _id: user._id,
      name: user.name,
      email: user.email,
      // isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id), //jwt 토큰
    });
  } else {
    res.status(400);
    throw new Error("사용자 생성 오류");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // console.log(email)
  // console.log(password)
  const user = await User.findOne({ email });
  // console.log(user)

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      // isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("이메일이나 비밀번호가 틀렸습니다.");
  }
});

module.exports = { allUsers, registerUser, authUser };//allUsers, registerUser, authUser };
