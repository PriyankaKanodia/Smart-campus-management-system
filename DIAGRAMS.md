# Smart Campus ERP - Enterprise Architecture & Data Models

This file contains Mermaid diagrams illustrating system architecture, database schema, entity relationships, use cases, and request sequence flows.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    User([User / Browser / Mobile App]) <--> CDN[Cloudflare / Nginx Reverse Proxy]
    CDN <--> AppServer[Express.js App Gateway :3000]

    subgraph Frontend Bundle
        AppServer --> ReactSPA[React 18 SPA Frontend]
        ReactSPA --> PWA[PWA Service Worker / Cache]
    end

    subgraph Backend Micro-Services
        AppServer --> AuthModule[Auth & Security Gateway JWT]
        AppServer --> SISModule[Student & Course Engine]
        AppServer --> BiometricModule[Biometric & Smart Attendance]
        AppServer --> ChatModule[Real-Time Socket Chat]
        AppServer --> AnalyticsModule[Analytics & Audit Engine]
    end

    subgraph External Infrastructure
        SISModule <--> MongoDB[(MongoDB Atlas Cluster)]
        BiometricModule <--> S3[AWS S3 File Storage]
        AppServer <--> Cloudinary[Cloudinary Media CDN]
        AppServer <--> GeminiAI[Google Gemini 2.5 API]
    end
```

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ STUDENT : "is profile of"
    USER ||--o{ FACULTY : "is profile of"
    DEPARTMENT ||--|{ COURSE : "offers"
    FACULTY ||--o{ COURSE : "teaches"
    STUDENT }|--|{ COURSE : "enrolls in"
    STUDENT ||--o{ ATTENDANCE : "has"
    COURSE ||--o{ ATTENDANCE : "records"
    STUDENT ||--o{ FEE_INVOICE : "incurred by"
    USER ||--o{ AUDIT_LOG : "triggers"

    USER {
        string id PK
        string email UK
        string passwordHash
        string role
        string name
        datetime createdAt
    }

    STUDENT {
        string id PK
        string studentId UK
        string name
        string department
        number cgpa
        number attendanceRate
    }

    FACULTY {
        string id PK
        string facultyId UK
        string name
        string department
        string designation
    }

    COURSE {
        string id PK
        string code UK
        string name
        number credits
        string instructorId FK
    }

    ATTENDANCE {
        string id PK
        string studentId FK
        string courseId FK
        string method
        string status
        datetime timestamp
    }

    FEE_INVOICE {
        string id PK
        string studentId FK
        number amount
        string status
        datetime dueDate
    }
```

---

## 3. Database Schema Diagram

```mermaid
classDiagram
    class UserSchema {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role
        +String phone
        +Date createdAt
    }

    class CourseSchema {
        +ObjectId _id
        +String code
        +String name
        +Number durationYears
        +String description
        +ObjectId instructor
    }

    class AttendanceSchema {
        +ObjectId _id
        +ObjectId studentId
        +ObjectId courseId
        +String verificationMethod
        +String status
        +String confidenceScore
        +Date timestamp
    }

    UserSchema "1" -- "0..1" StudentSchema
    UserSchema "1" -- "0..1" FacultySchema
    CourseSchema "1" -- "*" AttendanceSchema
```

---

## 4. Use Case Diagram

```mermaid
usecaseDiagram
```

```mermaid
graph LR
    subgraph Actors
        Student((Student))
        Faculty((Faculty))
        Admin((Administrator))
    end

    subgraph System Features
        UC1[View Grades & Timetable]
        UC2[Pay Tuition Fees]
        UC3[Scan Biometric Attendance]
        UC4[Mark Student Attendance]
        UC5[Upload Course Syllabi]
        UC6[Manage Student Records]
        UC7[Configure Security & Audit]
        UC8[Query Nova AI Assistant]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC8

    Faculty --> UC4
    Faculty --> UC5
    Faculty --> UC8

    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
```

---

## 5. Sequence Diagram: Biometric Attendance Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant Camera as Webcam/Camera
    participant Frontend as React Client
    participant API as Express Gateway
    participant AI as Face AI Engine
    participant DB as MongoDB Atlas

    Student->>Frontend: Select "Scan Face Attendance"
    Frontend->>Camera: Request Stream Access
    Camera-->>Frontend: Video Frames Received
    Frontend->>Frontend: Render Neural Mesh Overlay
    Frontend->>API: POST /api/attendance/verify (Frame Data)
    API->>AI: Extract 468 Facial Landmarks
    AI-->>API: Match Confirmed (98.7% Confidence)
    API->>DB: Save Attendance Record (Present, Verified)
    DB-->>API: Document Saved
    API-->>Frontend: HTTP 200 OK (Attendance Recorded)
    Frontend-->>Student: Display "Verified & Present" Notification
```
