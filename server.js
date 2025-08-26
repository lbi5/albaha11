// بيانات المسؤولين
const admins = [
  { email: "admin@example.com", password: "1234", role: "admin" }
];

// Body parser لتفهم JSON
app.use(express.json());

// تسجيل الدخول للإدارة
app.post('/api/admin-login', (req, res) => {
  const { email, password } = req.body;
  const admin = admins.find(u => u.email === email && u.password === password);

  if(admin){
    res.json({ success: true, message: "تم تسجيل الدخول بنجاح!", role: admin.role });
  } else {
    res.json({ success: false, message: "البريد أو كلمة المرور خاطئة!" });
  }
});