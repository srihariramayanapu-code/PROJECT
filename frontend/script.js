
// Spring Boot backend URL
const API_URL = "http://localhost:8080/students";

// Form
const studentForm = document.getElementById("studentForm");

// Table body
const studentTableBody = document.getElementById("studentTableBody");


// ===============================
// ADD STUDENT
// ===============================

studentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const student = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        course: document.getElementById("course").value,
        age: Number(document.getElementById("age").value)
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(student)
        });

        if (!response.ok) {
            throw new Error("Failed to add student");
        }

        alert("Student added successfully!");

        studentForm.reset();

        loadStudents();

    } catch (error) {

        console.error(error);

        alert("Unable to add student. Make sure the backend is running.");

    }

});


// ===============================
// GET ALL STUDENTS
// ===============================

async function loadStudents() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        const students = await response.json();

        displayStudents(students);

    } catch (error) {

        console.error(error);

        studentTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Backend is not connected
                </td>
            </tr>
        `;
    }
}


// ===============================
// DISPLAY STUDENTS
// ===============================

function displayStudents(students) {

    studentTableBody.innerHTML = "";

    if (students.length === 0) {

        studentTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    No students found
                </td>
            </tr>
        `;

        return;
    }

    students.forEach(student => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>${student.age}</td>
            <td>
                <button
                    class="delete-btn"
                    onclick="deleteStudent(${student.id})">
                    Delete
                </button>
            </td>
        `;

        studentTableBody.appendChild(row);

    });
}


// ===============================
// DELETE STUDENT
// ===============================

async function deleteStudent(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete student");
        }

        alert("Student deleted successfully!");

        loadStudents();

    } catch (error) {

        console.error(error);

        alert("Unable to delete student.");

    }
}


// ===============================
// LOAD STUDENTS WHEN PAGE OPENS
// ===============================

loadStudents();

