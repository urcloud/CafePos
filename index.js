import express from "express";
import path from "path";
import fs from "fs";
import { findUserByEmail, insertUser, insertMenuItem, findMenuItemByName, getMenuItemsFromDatabase, deleteMenuItemFromDatabase } from "./database/db.js";
import formidable from "formidable";
import { existsSync, mkdirSync } from "fs";
import cookieParser from "cookie-parser";

const uploadDir = "uploads";
if (!existsSync(uploadDir)) {
  console.log( `making upload directory ${uploadDir}...`);
  mkdirSync(uploadDir, { recursive: true });
}

const app = express();

app.use(express.json());
app.use(express.static(path.resolve("public"), { extensions: ["html"] }));
app.use('/uploads', express.static(path.join(uploadDir)));
app.use(cookieParser());

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    console.log("로그인 실패");
    res.status(401).json({ error: "로그인에 실패하였습니다." });
    return;
  }

  console.log("로그인 성공");
  res.cookie("cafe-cookie", "token-secret");
  res.json({ email });
});

app.post("/logout", (req, res) => { 
  console.log("로그아웃 성공");
  res.clearCookie("cafe-cookie");
  res.json({ message: "로그아웃 성공" });
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  console.log("email", email, "pass", password);

  if (!emailRegex.test(email)) {
    console.log("이메일 형식이 올바르지 않습니다.");
    res.status(400).json({ error: "이메일 형식이 올바르지 않습니다." });
    return;
  }

  if (!passwordRegex.test(password)) {
    console.log("비밀번호 형식이 올바르지 않습니다.");
    res.status(400).json({
      error:
        "비밀번호 형식이 올바르지 않습니다. 최소 6자 이상, 최소 1개 이상의 숫자, 소문자, 대문자, 특수문자가 들어갈 수 있게 해주세요.",
    });
    return;
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    console.log("이미 가입된 이메일입니다.");
    res.status(400).json({ error: "이미 가입된 이메일입니다." });
    return;
  }

  const result = insertUser(email, password);
  console.log("result insert:", result);
  res.json(result);
});

app.get("/cookie", (req, res) =>{
  const cookies = req.cookies;
  console.log("cookies", cookies);
  const cookieValue = cookies["cafe-cookie"];
  console.log("cookie value", cookieValue);
  res.send(`cafe-cookie value = ${cookieValue}`);
});

const requireLogin = (req, res, next) => {
  const cookies = req.cookies;
  const cookieValue = cookies["cafe-cookie"];

  if (!cookieValue) {
    res.status(401).json({ error: "로그인이 필요합니다." });
    return;
  }

  next();
};


app.post("/admin", requireLogin, async (req, res) => {
  try {
    const form = formidable({ uploadDir: uploadDir, keepExtensions: true });
    const [fields, files] = await form.parse(req);
    console.log(fields, files);

    const existingMenuItem = findMenuItemByName(fields.name[0]);
    
    if (existingMenuItem) {
      throw new Error('이미 존재하는 메뉴명입니다.');
    }

    const imageFileName = files.image[0].newFilename;
    const result = insertMenuItem(fields.name[0], fields.price[0], imageFileName);

    res.json({ result });

    console.log(
      "files data",
      files.image[0].newFilename,
      files.image[0].originalFilename
    );
  } catch (error) {
    console.log(error);

    res.status(400).json({ error: error.message });
  }
});

app.get("/menuitems", async (req, res) => {
  try {
    const menuItems = await getMenuItemsFromDatabase();

    const menuItemsWithImagePath = menuItems.map((menuItem) => ({
      name: menuItem.name,
      price: menuItem.price,
      imagePath: `/uploads/${menuItem.imageFileName}`
    }));

    res.json({ menuItems: menuItemsWithImagePath });
  } catch (error) {
    console.error("메뉴 항목을 가져오는 동안 오류 발생:", error.message);
    res.status(500).json({ error: "서버 오류로 메뉴 항목을 가져올 수 없습니다." });
  }
});

app.post("/order", (req, res) => {
  try {
    const orderData = req.body;

    console.log("주문이 들어왔습니다. 주문 내역:", orderData);

    res.json({ success: true, message: "주문이 완료되었습니다." });
  } catch (error) {
    console.error("주문 처리 중 오류 발생:", error);
    res.status(500).json({ success: false, error: "주문 처리 중 오류가 발생했습니다." });
  }
});

const deleteImageFile = async (imageFileName) => {
  try {
    const imagePath = path.join("uploads", imageFileName);
    fs.unlinkSync(imagePath);
    console.log(`이미지 파일 '${imageFileName}'이(가) 삭제되었습니다.`);
  } catch (error) {
    console.error(`이미지 파일 삭제 중 오류 발생:`, error.message);
  }
};

app.post("/delete", requireLogin, async (req, res) => {
  try {
    const { name } = req.body;

    const existingMenuItem = findMenuItemByName(name);

    if (!existingMenuItem) {
      res.status(404).json({ error: `메뉴 아이템 '${name}'을 찾을 수 없습니다.` });
      return;
    }

    deleteImageFile(existingMenuItem.imageFileName);

    const result = deleteMenuItemFromDatabase(name);

    res.json({ success: true, message: `메뉴 아이템 '${name}'이(가) 삭제되었습니다.` });
  } catch (error) {
    console.error("메뉴 삭제 중 오류 발생:", error);
    res.status(500).json({ success: false, error: "메뉴 삭제 중 오류가 발생했습니다." });
  }
});

app.listen(3000, () => console.log("app server is running on port 3000"));