<h1 align="center"><b>📧 Mail Sending System (Backend Service)</b></h1>

<p align="center">
A robust, production-ready backend service for automated email delivery and tracking.  
It securely manages email sending, logging, and background processing to ensure reliability and performance.
</p>

---
<h2 align="center"><b>🚀 Steps to Run the NestJS Project</b></h2>

Follow these steps to set up and run the project locally:

### **1️⃣ Clone the Repository**
```bash
git clone <your-repository-url>
cd <project-folder>
```

### **2️⃣ Install Dependencies**
Make sure you have Node.js (>=20) and npm installed.
```bash
npm install
```

### **3️⃣ Configure Environment Variables**
Create a .env file in the project root and add your environment configurations:
```env
PORT=3000
APP_NAME=mailer-service
MONGO_URI=mongodb+srv://sandeep:sandeep@cluster0.tkeedvw.mongodb.net/mailer-service
MONGO_POOL_SIZE=10
MONGO_TIMEOUT_MS=30000
NODE_ENV=development
MAIL_PASSWORD=gwha aefj vmmz bcmr
MAIL_USER=sandeep.16murmu@gmail.com
```

### **4️⃣ Start the Application**
Run in development mode:
```bash
npm run start:dev
```

<h2 align="center"><b>🎉 Congratulations! Your app is running successfully 🎉</b></h2>


---


<div align="center">

## 🛠️ **Technologies Used**

| Category | Tools |
|-----------|--------|
| **Backend** | NestJS (TypeScript), Node.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Mail Service** | Nodemailer (SMTP - Gmail Integration) |
| **File Handling** | Multer (Local File Upload Management) |
| **Configuration** | dotenv |
| **Utilities** | Nest Logger, Postman (API Testing) |

</div>

---

<div align="center">

## 📦 **Major Modules**

</div>


### 📧 Email Logs Module
- Handles sending, storing, and retrieving email logs.
- Tracks status — **Pending**, **Sent**, or **Failed**.
- Records message IDs and timestamps automatically.

### 📎 File Upload Module
- Supports **email attachments**.
- Automatically deletes uploaded files post email dispatch.

### ⚙️ Background Task Handler
- Sends emails **asynchronously** to prevent request blocking.
- Enables smooth user experience and high throughput.

### 🚨 Error & Retry Handling
- Catches and logs all failed deliveries.

---

<div align="center">

## 🚀 **Key Functionalities**

</div>

✅ SMTP email sending with dynamic recipients (**To**, **CC**, **BCC**)  
✅ HTML and plain text content support  
✅ File attachments with auto-cleanup  
✅ Paginated and filtered email log retrieval  
✅ Asynchronous mail delivery for high performance  
✅ Centralized logging and structured error tracking  

---


<h1 align="center"><b>📘 API Documentation (Backend Service)</b></h1>

## 📤 **Upload Single Document API**

### **Endpoint**
POST {host}/api/upload/single


### **Description**
This API allows you to upload a **single document** (e.g., PDF, image, or text file) to the server.  
The uploaded file is temporarily stored for email attachment or other processing tasks.

### **cURL**
```
curl --location 'http://localhost:3000/api/upload/single' \
--form 'file=@"/Users/snadeep.murmu/Downloads/AD_Acknowledgement_1009363489 (2).pdf"'
```

### **Sample Response**
```
{
    "success": true,
    "message": "File uploaded successfully",
    "relativePath": "/uploads/file-1763026588698-404828857.pdf",
    "absolutePath": "/Users/snadeep.murmu/Repos/Test/mailer-service/uploads/file-1763026588698-404828857.pdf"
}
```

## 🚀 Send Email API

### **Endpoint**  
POST {host}/api/email


### **Description**
This API allows you to send emails using **NodeMailer** via the backend service.  
It supports **To**, **CC**, **BCC**, **HTML**, **text**, and **attachments** fields,  
and logs each mail request in the database with status tracking (`pending`, `sent`, `failed`).
The file path will be the **absolutePath** received from the **Upload Single Document API**.

### **cURL**
```curl --location 'http://localhost:3000/api/email' \
--header 'Content-Type: application/json' \
--data-raw '{
    "to": "sandeep.16murmu@gmail.com",
    "subject": "Welcome to Our Platform!",
    "text": "Hello John, welcome aboard! We’re excited to have you.",
    "html": "<h2>Welcome, John!</h2><p>We’re excited to have you on board. 🎉</p>",
    "cc": "teamlead@example.com",
    "bcc": "audit@example.com",
    "attachments": [
        {
            "filename": "file-1763026588698-404828857.pdf",
            "path": "/Users/snadeep.murmu/Repos/Test/mailer-service/uploads/file-1763026588698-404828857.pdf"
        }
    ]
}'
```

### **Sample Response**
```
{
    "success": true,
    "message": "Email queued successfully",
    "logId": "6915a6b880e51d0cf74bc390"
}
```


## 📄 **Get Email Logs API**

### **Endpoint**
GET {host}/api/email/logs


### **Description**
This API retrieves a paginated list of sent emails from the mail log database.  
You can filter results by **status**, **sender**, **recipient**, or perform a **text search** across email subjects and addresses.


### **🔍 Query Parameters**
| Parameter | Type | Required | Default | Description |
|------------|------|-----------|----------|--------------|
| **status** | `string` | ❌ Optional | — | Filter emails by status (`pending`, `sent`, `failed`). |
| **search** | `string` | ❌ Optional | — | Text search across `subject`, `from`, and `to` fields. |
| **from** | `string` | ❌ Optional | — | Filter by sender email address. |
| **to** | `string` | ❌ Optional | — | Filter by recipient email address. |
| **page** | `number` | ❌ Optional | `1` | Page number for pagination. |
| **limit** | `number` | ❌ Optional | `10` | Number of records per page. |


### **🧾 Example Request**
```
curl --location 'http://localhost:3000/api/email/logs?status=sent&page=1&limit=5'
```

### **Sample Response**
```
{
    "success": true,
    "message": "Email logs fetched successfully",
    "data": [
        {
            "_id": "69157f7912a90acabbb36902",
            "to": "sandeep.16murmu@gmail.com",
            "from": "sandeep.16murmu@gmail.com",
            "subject": "Welcome to Our Platform!",
            "cc": "teamlead@example.com",
            "bcc": "audit@example.com",
            "html": "<h2>Welcome, John!</h2><p>We’re excited to have you on board. 🎉</p>",
            "text": "Hello John, welcome aboard! We’re excited to have you.",
            "status": "sent",
            "createdAt": "13-11-2025 12:19PM",
            "updatedAt": "13-11-2025 12:19PM",
            "messageId": "<d287add2-c1ae-b42a-9849-f093e106b2a0@gmail.com>"
        }
    ],
    "meta": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1
    }
}
```

---
<h3 align="center"><b>📘 End of Documentation</b></h3>
<p align="center">Thank you for reading. For any issues or improvements, feel free to contribute or raise an issue in the repository.</p>


