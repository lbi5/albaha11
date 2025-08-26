const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

// middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ملفات التخزين
const carsFile = path.join(__dirname, "data", "cars.json");
const logsFile = path.join(__dirname, "data", "logs.json");

// إدارة المستخدمين (إضافة ايميلاتك هنا)
const admins = [
  { email: "bn.rr332299@gmail.com", password: "1234", name: "عيسى السعد" },
  { email: "issa@server.com", password: "1234", name: "تركي الشهري" },
  { email: "ahmed@server.com", password: "1234", name: "أحمد الزهراني" },
  { email: "turki@server.com", password: "1234", name: "طلال القحطاني" }
];

// تحميل/حفظ بيانات السيارات
function loadCars() {
  if (!fs.existsSync(carsFile)) return [];
  return JSON.parse(fs.readFileSync(carsFile));
}
function saveCars(cars) {
  fs.writeFileSync(carsFile, JSON.stringify(cars, null, 2));
}

// تحميل/حفظ السجلات
function loadLogs() {
  if (!fs.existsSync(logsFile)) return [];
  return JSON.parse(fs.readFileSync(logsFile));
}
function saveLogs(logs) {
  fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
}
function addLog(action, adminName, details = "") {
  const logs = loadLogs();
  logs.push({
    id: uuidv4(),
    action,
    admin: adminName,
    details,
    time: new Date().toLocaleString("ar-SA")
  });
  saveLogs(logs);
}

// نظام رفع الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ تسجيل دخول الإداري
app.post("/api/admin-login", (req, res) => {
  const { email, password } = req.body;
  const admin = admins.find(a => a.email === email && a.password === password);
  if (admin) {
    addLog("تسجيل دخول", admin.name, `الإيميل: ${email}`);
    res.json({ success: true, message: "تم تسجيل الدخول", adminName: admin.name });
  } else {
    res.json({ success: false, message: "البريد أو كلمة المرور غير صحيحة" });
  }
});

// ✅ إحضار السيارات
app.get("/api/cars", (req, res) => {
  res.json(loadCars());
});

// ✅ إضافة سيارة
app.post("/api/cars", upload.single("image"), (req, res) => {
  const cars = loadCars();
  const car = {
    id: uuidv4(),
    title: req.body.title,
    description: req.body.description,
    specs: req.body.specs,
    image: "/uploads/" + req.file.filename
  };
  cars.push(car);
  saveCars(cars);

  const adminName = req.headers["x-admin-name"] || "غير معروف";
  addLog("إضافة سيارة", adminName, `السيارة: ${car.title}`);

  res.json({ success: true, car });
});

// ✅ حذف سيارة
app.delete("/api/cars/:id", (req, res) => {
  let cars = loadCars();
  const car = cars.find(c => c.id === req.params.id);
  if (!car) return res.status(404).json({ success: false, message: "لم يتم العثور على السيارة" });

  cars = cars.filter(c => c.id !== req.params.id);
  saveCars(cars);

  const adminName = req.headers["x-admin-name"] || "غير معروف";
  addLog("حذف سيارة", adminName, `السيارة: ${car.title}`);

  res.json({ success: true });
});

// ✅ إحضار السجلات
app.get("/api/logs", (req, res) => {
  res.json(loadLogs());
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});