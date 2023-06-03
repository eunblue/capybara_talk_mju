const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Message = require("../models/messageModel");
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
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const notifications = await Message.find({
      '_id': { $in: user.notification }
    }).populate([
      'sender',
      'chat',
      { path: 'chat.users', select: 'name email pic', model: 'User' }  // users 필드를 populate하면서 name, email, pic 필드만 선택
    ]);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      // isAdmin: user.isAdmin,
      pic: user.pic,
      notification: notifications,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("이메일이나 비밀번호가 틀렸습니다.");
  }
});


const handleNotif = asyncHandler(async (req, res) => {

  console.log("---------------------------------------------------")
  console.log("Hello")
  const { userID, notif_list } = req.body;
  console.log("userID")
  console.log(userID)
  console.log("notif_list")
  console.log(notif_list)

  if (notif_list) {
    console.log("1")
    const notifIds = notif_list.map(notif => notif._id);
    console.log("2")

    const updatedNotif = await User.findByIdAndUpdate(
      userID,
      {
        notification: notifIds,
      },
      {
        new: true,
      }
    )
    console.log("3")
    console.log("updatedNotif")
    console.log(updatedNotif)


    if (!updatedNotif) {
      res.status(404);
      throw new Error("Notification Not Found");
    } else {
      const notificationDetail = await Message.find({
        '_id': { $in: updatedNotif.notification }
      }).populate([
        'sender',
        'chat',
        { path: 'chat.users', select: 'name email pic', model: 'User' }  // users 필드를 populate하면서 name, email, pic 필드만 선택
      ]);

      res.json(notificationDetail);
    }
    console.log("3")
  } else {
    const user = await User.findById(userID);

    if (!user) {
      res.status(404);
      throw new Error("User Not Found");
    } else {
      const notificationDetail = await Message.find({
        '_id': { $in: user.notification }
      }).populate([
        'sender',
        'chat',
        { path: 'chat.users', select: 'name email pic', model: 'User' }  // users 필드를 populate하면서 name, email, pic 필드만 선택
      ]);

      res.json(notificationDetail);
    }
  }
});





module.exports = { allUsers, registerUser, authUser, handleNotif };
