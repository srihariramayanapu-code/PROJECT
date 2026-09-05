# Student Management System

A full-stack Student Management System built using **Java Spring Boot, MySQL, HTML, CSS, and JavaScript**.

The application provides an admin-based interface for managing student records with CRUD operations, validation, search, filtering, sorting, statistics, CSV import/export, PDF reports, and authentication.

---

## 📌 Project Overview

The Student Management System is designed to simplify the process of storing, managing, searching, and analyzing student information.

The system consists of two major parts:

- **Frontend** – Provides an interactive web interface for administrators.
- **Backend** – Provides REST APIs and handles business logic, validation, authentication, and database operations.

Student data is stored securely in a **MySQL database**, while the backend is developed using **Spring Boot and Spring Data JPA**.

---

## ✨ Features

### 🔐 Admin Authentication

- Admin login system
- Username and password authentication
- BCrypt password encryption
- Login protection using session storage
- Logout functionality
- Unauthorized users are redirected to the login page

### 👨‍🎓 Student Management

- Add new students
- View all students
- View individual student details
- Edit student information
- Delete student records
- Cancel editing
- Student details popup

### 🔎 Search and Filtering

- Search students by name, email, course, etc.
- Filter students by course
- Clear filters
- Sort student records
- Pagination for student records

### 📊 Statistics

The dashboard provides useful student statistics such as:

- Total number of students
- Course-wise student distribution
- Student count indicators
- Course distribution chart

### 📁 CSV Support

- Import student records from CSV
- Export student records to CSV
- CSV validation
- Success and failure notifications

### 📄 PDF Reports

- Generate student reports in PDF format
- Generate reports containing student information
- Useful for maintaining downloadable records

### ✅ Validation

#### Frontend Validation

The application validates student input before sending data to the backend.

Examples:

- Name is required
- Email must be valid
- Course is required
- Age must be within the allowed range

#### Backend Validation

Spring Boot Bean Validation is used to validate incoming API requests.

Examples:

- Name: 2–100 characters
- Valid email address
- Course: 2–100 characters
- Age: 1–100

Validation errors are returned as meaningful messages through a global exception handler.

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript
- Chart.js
- jsPDF

### Backend

- Java
- Spring Boot
- Spring MVC
- Spring Data JPA
- Jakarta Bean Validation
- BCrypt Password Encoder
- Maven

### Database

- MySQL

### Development Tools

- Visual Studio Code
- MySQL
- Git
- GitHub
- Postman

---

## 🏗️ Project Architecture

The project follows a layered backend architecture.

```text
                    Student Management System
                              |
              +---------------+---------------+
              |                               |
           Frontend                         Backend
              |                               |
      HTML / CSS / JS                 Spring Boot REST API
                                              |
                              +---------------+---------------+
                              |               |               |
                         Controller        Service       Repository
                              |               |               |
                              +---------------+---------------+
                                              |
                                           Entity
                                              |
                                           MySQL

📂 Project Structure
PROJECT-main/
│
├── backend/
│   │
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── example/
│   │       │           └── studentmanagement/
│   │       │               │
│   │       │               ├── controller/
│   │       │               │   ├── StudentController.java
│   │       │               │   └── AdminController.java
│   │       │               │
│   │       │               ├── service/
│   │       │               │   ├── StudentService.java
│   │       │               │   └── AdminService.java
│   │       │               │
│   │       │               ├── repository/
│   │       │               │   ├── StudentRepository.java
│   │       │               │   └── AdminRepository.java
│   │       │               │
│   │       │               ├── entity/
│   │       │               │   ├── Student.java
│   │       │               │   └── Admin.java
│   │       │               │
│   │       │               ├── exception/
│   │       │               │   └── GlobalExceptionHandler.java
│   │       │               │
│   │       │               └── StudentManagementApplication.java
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   └── pom.xml
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── script.js
│   └── style.css
│
└── README.md
🗄️ Database

The application uses MySQL.

Database Name
student_db

The application contains two main tables:

Student Table

Stores:

id
name
email
course
age
Admin Table

Stores:

id
username
password

Admin passwords are stored using BCrypt hashing.

⚙️ Backend Configuration

The database connection is configured in:

backend/src/main/resources/application.properties

Example:

spring.datasource.url=jdbc:mysql://localhost:3306/student_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

server.port=8080

Replace YOUR_PASSWORD with your local MySQL password.

Do not commit real database passwords or other secrets to GitHub.

🚀 How to Run the Project
1. Clone the Repository
git clone https://github.com/srihariramayanapu-code/PROJECT.git

Move into the project:

cd PROJECT
2. Configure MySQL

Start MySQL Server and create the database:

CREATE DATABASE student_db;

Update the MySQL username and password in:

backend/src/main/resources/application.properties
3. Start the Backend

Open a terminal inside the backend directory:

cd backend

Run the Spring Boot application:

mvn spring-boot:run

The backend will start at:

http://localhost:8080
4. Run the Frontend

Open:

frontend/login.html

in a web browser.

The login page will be displayed first.

After successful authentication, the administrator can access the Student Management System dashboard.

🔗 REST API Endpoints
Student APIs
Method	Endpoint	Description
POST	/students	Add a student
GET	/students	Get all students
GET	/students/{id}	Get student by ID
PUT	/students/{id}	Update student
DELETE	/students/{id}	Delete student
Admin APIs
Method	Endpoint	Description
POST	/admin/login	Admin login
POST	/admin/create	Create admin
🔄 Application Flow
Admin
  |
  v
Login Page
  |
  v
Authentication
  |
  +---- Invalid ----> Login Error
  |
  +---- Valid
          |
          v
     Dashboard
          |
          +---- Add Student
          |
          +---- View Students
          |
          +---- Edit Student
          |
          +---- Delete Student
          |
          +---- Search / Filter
          |
          +---- Statistics
          |
          +---- Import CSV
          |
          +---- Export CSV
          |
          +---- Generate PDF
          |
          v
       Logout
🧪 Validation and Error Handling

The backend uses a global exception handler to process validation errors.

For example, an invalid request may return:

{
    "name": "Name is required",
    "email": "Please enter a valid email address",
    "course": "Course is required"
}

The frontend displays these errors to the administrator through notifications.

🔒 Security

The application implements basic admin authentication.

Security-related features include:

BCrypt password hashing
Login validation
Protected dashboard
Session-based login state
Logout functionality

This project uses application-level authentication for demonstration and educational purposes. For production deployment, additional security measures such as Spring Security, JWT/session management, HTTPS, CSRF protection, and secure secret management should be considered.

📊 Dashboard

The dashboard provides:

Student statistics
Course distribution
Student records
Search and filtering
Sorting
Pagination
Student management controls

The course distribution is visualized using Chart.js.

📥 CSV Import

The application allows administrators to import student records using a CSV file.

A CSV file can contain:

name,email,course,age
John,john@example.com,Computer Science,20
Priya,priya@example.com,Information Technology,21

The application validates the imported records before adding them.

📤 CSV Export

Student records can be exported from the dashboard as a CSV file.

This allows administrators to:

Backup student information
Analyze records externally
Share student data
Maintain offline records
📄 PDF Report

The application can generate a PDF report containing student records.

This can be used for:

Documentation
Printing
Submission
Record keeping
🎯 Objectives

The main objectives of the project are:

To provide an easy-to-use student management interface.
To implement CRUD operations using Spring Boot REST APIs.
To store student information using MySQL.
To implement admin authentication.
To validate student information.
To provide search, filtering, sorting, and pagination.
To provide statistical information about students.
To support CSV import and export.
To generate PDF student reports.
To demonstrate full-stack application development.
🔮 Future Enhancements

Possible future improvements include:

Role-based authentication
Spring Security integration
JWT authentication
Password reset functionality
Student profile photos
Advanced dashboard analytics
Email notifications
Deployment to cloud platforms
Responsive mobile application
Automated testing
Docker support
👥 Contributors
Student Management System Team

This project was developed as a collaborative project.

Contributors can be added here:

1. Sri Hari
2. Team Member
3. Team Member
4. Team Member
📜 License

This project is developed for educational and project purposes.

⭐ Acknowledgement

This project demonstrates the integration of frontend web technologies with a Java Spring Boot backend and MySQL database to create a complete full-stack Student Management System.


### Add it to your project

Your current location is already:

```text
C:\Users\SRIHARI\Downloads\PROJECT-main\PROJECT-main
