const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
  rebusinessChat,
  addToCalendar,
  removeCalendar,
  refreshCalendar,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, accessChat); // 채팅 시작
router.route("/").get(protect, fetchChats); // 특정 유저 채팅 가져오기
router.route("/group").post(protect, createGroupChat); //그룹채팅 생성
router.route("/rename").put(protect, renameGroup); //그룹이름 바꾸기
router.route("/rebusinessChat").put(protect, rebusinessChat); //업무 개인 바꾸기
router.route("/groupremove").put(protect, removeFromGroup); // 그룹에 사람 강퇴
router.route("/groupadd").put(protect, addToGroup); // 그룹에 사람 추가
router.route("/calendaradd").put(protect, addToCalendar); //일정 추가
router.route("/calendarRemove").put(protect, removeCalendar);
router.route("/calendarRefresh/:chatId").get(protect, refreshCalendar);

module.exports = router;
