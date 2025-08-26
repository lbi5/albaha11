const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// مجلد رفع الصور
const upload = multer({ dest: 'uploads/' });

// بيانات المسؤولين
const admins = [
  { email: "admin@example.com", password: "1234", role: "admin" }
];

// ملف بيانات الموقع
const DATA_FILE = path.join(__dirname, 'data', 'siteData.json');

// إنشاء ملف البيانات إذا لم يوجد
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    products: [],
    exclusive: 'هنا نص الحصريات',
    rules: 'هنا نص القوانين',
    designers: 'عيسى السعد | أحمد الزهراني | تركي الشهري',
    discord: '',
    emails: ''
  }, null, 2));
}

// قراءة البيانات
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// حفظ البيانات
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// تسجيل دخول الإدارة
app.post('/api/admin-login', (req, res) => {
  const { email, password } = req.body;
  const admin = admins.find(a => a.email === email && a.password === password);
  if (admin) res.json({ success: true, message: "تم تسجيل الدخول بنجاح!" });
  else res.json({ success: false, message: "البريد أو كلمة المرور خاطئة!" });
});

// جلب السيارات
app.get('/api/products', (req, res) => {
  const data = readData();
  res.json(data.products);
});

// إضافة سيارة
app.post('/api/add-car', upload.single('image'), (req, res) => {
  const data = readData();
  const { title, description, specs } = req.body;
  let imageUrl = '';
  if (req.file) {
    // نقل الصورة لمجلد public/images
    const ext = path.extname(req.file.originalname);
    const newPath = path.join(__dirname, 'public', 'images', req.file.filename + ext);
    fs.renameSync(req.file.path, newPath);
    imageUrl = `/images/${req.file.filename}${ext}`;
  }
  data.products.push({ title, description, specs, imageUrl });
  saveData(data);
  res.json({ success:true, message:"تمت إضافة السيارة!" });
});

// حذف سيارة
app.delete('/api/delete-car/:index', (req,res)=>{
  const idx = parseInt(req.params.index);
  const data = readData();
  if(idx>=0 && idx<data.products.length){
    data.products.splice(idx,1);
    saveData(data);
    res.json({success:true,message:"تم حذف السيارة"});
  } else res.json({success:false,message:"الفهرس غير صحيح"});
});

// جلب بيانات الموقع الأخرى
app.get('/api/site-data', (req,res)=>{
  const data = readData();
  res.json({
    exclusive: data.exclusive,
    rules: data.rules,
    designers: data.designers,
    discord: data.discord,
    emails: data.emails
  });
});

// تحديث الحصريات
app.post('/api/update-exclusive', (req,res)=>{
  const { exclusive } = req.body;
  const data = readData();
  data.exclusive = exclusive;
  saveData(data);
  res.json({success:true});
});

// تحديث القوانين
app.post('/api/update-rules', (req,res)=>{
  const { rules } = req.body;
  const data = readData();
  data.rules = rules;
  saveData(data);
  res.json({success:true});
});

// تحديث المصممين
app.post('/api/update-designers', (req,res)=>{
  const { designers } = req.body;
  const data = readData();
  data.designers = designers;
  saveData(data);
  res.json({success:true});
});

// تحديث التواصل
app.post('/api/update-contact', (req,res)=>{
  const { discord, emails } = req.body;
  const data = readData();
  data.discord = discord;
  data.emails = emails;
  saveData(data);
  res.json({success:true});
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});