const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // console.log("시작1")
  // console.log(req.headers)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // console.log("시작2")
      console.log(req.headers.authorization.split(" ")[1])
      token = req.headers.authorization.split(" ")[1];

      //decodes token id
      // console.log(token)
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // 토큰 확인

      req.user = await User.findById(decoded.id).select("-password"); //데이터베이스에서 id 확인 후 비번 없이 반환

      // console.log(req.user)
      next();
    } catch (error) {
      res.status(401);

      // console.log("억까authMiddleware.js 1")
      throw new Error("회원가입 되어있지 않습니다. token failed");
    }
  }

  if (!token) {
    // console.log("억까authMiddleware.js 2")
    res.status(401);
    throw new Error("회원가입 되어있지 않습니다. no token");
  }
});

module.exports = { protect };
