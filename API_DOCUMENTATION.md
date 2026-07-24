# Smart Campus Enterprise ERP - REST API Reference

Base URL: `/api`  
Authentication: Bearer JWT Token in `Authorization` header (`Bearer <token>`)

---

## 🔐 1. Authentication & User Profile (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account (student, faculty, admin) | No |
| `POST` | `/api/auth/login` | Authenticate user credentials and return JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user session profile | Yes |
| `POST` | `/api/auth/forgot-password` | Initiate password recovery & generate OTP code | No |
| `POST` | `/api/auth/reset-password` | Complete password reset using OTP code | No |

---

## 📚 2. Academic Courses (`/api/courses`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/courses` | List all registered university courses | Yes |
| `POST` | `/api/courses` | Create a new academic course (Admin/Faculty) | Yes (Admin/Faculty) |
| `PUT` | `/api/courses/:id` | Update course syllabus, credits or instructor | Yes (Admin/Faculty) |
| `DELETE` | `/api/courses/:id` | Archive or delete a course entry | Yes (Admin) |

---

## 🎓 3. Student Information System (`/api/students`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/students` | List all enrolled students with CGPA & attendance | Yes |
| `POST` | `/api/students` | Enroll a new student record | Yes (Admin) |
| `PUT` | `/api/students/:id` | Update student profile, grades, or department | Yes (Admin) |
| `DELETE` | `/api/students/:id` | Remove or graduate a student | Yes (Admin) |

---

## 👨‍🏫 4. Faculty Directory (`/api/faculty`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/faculty` | Fetch faculty directory & department leads | Yes |
| `POST` | `/api/faculty` | Register a new faculty member | Yes (Admin) |
| `PUT` | `/api/faculty/:id` | Modify designation or assigned workload | Yes (Admin) |

---

## 💰 5. Fee Gateways & Billing (`/api/fees`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/fees` | Retrieve fee invoices for student or department | Yes |
| `POST` | `/api/fees/pay` | Process online tuition fee payment simulation | Yes (Student/Admin) |

---

## 📢 6. Campus Announcements (`/api/notices`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/notices` | Fetch active campus notices and circulars | Yes |
| `POST` | `/api/notices` | Broadcast new announcement | Yes (Admin/Faculty) |
| `DELETE` | `/api/notices/:id` | Delete expired circular | Yes (Admin/Faculty) |

---

## 🤖 7. Gemini AI Assistant (`/api/ai/chat`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/chat` | Send prompt to Nova AI Assistant (Gemini 2.5) | Yes |

---

## 🛡️ Response Formats & Error Handling

All endpoints return JSON responses formatted as follow:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

In case of errors:
```json
{
  "success": false,
  "error": "Unauthorized Access",
  "statusCode": 401
}
```
