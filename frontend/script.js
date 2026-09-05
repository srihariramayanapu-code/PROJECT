// ===============================
// LOGIN PROTECTION
// ===============================

if (sessionStorage.getItem("adminLoggedIn") !== "true") {
    window.location.href = "login.html";
}

// Spring Boot backend URL
const API_URL = "http://localhost:8080/students";

// Form
const studentForm = document.getElementById("studentForm");

// Table body
const studentTableBody = document.getElementById("studentTableBody");

// Keep track of which student is being edited
let editingStudentId = null;
let allStudents = [];

// Pagination
let currentPage = 1;
const studentsPerPage = 10;
let currentFilteredStudents = [];


// ===============================
// ADD / UPDATE STUDENT
// ===============================

studentForm.addEventListener("submit", async function (event) {

    event.preventDefault();
    const submitButton = document.querySelector(
    "#studentForm button[type='submit']"
);

submitButton.disabled = true;
submitButton.textContent =
    editingStudentId !== null ? "Updating..." : "Adding...";

    const name = document.getElementById("name").value.trim();
const email = document.getElementById("email").value.trim();
const course = document.getElementById("course").value.trim();
const age = Number(document.getElementById("age").value);


// ===============================
// FORM VALIDATION
// ===============================

if (name.length < 2) {
    showToast("Name must contain at least 2 characters.", "error");
    return;
}

if (!email.includes("@") || !email.includes(".")) {
    showToast("Please enter a valid email address.", "error");
    return;
}

if (course.length < 2) {
    showToast("Course must contain at least 2 characters.", "error");
    return;
}

if (age < 1 || age > 100) {
    showToast("Age must be between 1 and 100.", "error");
    return;
}


// Student object
const student = {
    name: name,
    email: email,
    course: course,
    age: age
};

    try {

        // ===============================
        // UPDATE STUDENT
        // ===============================

        if (editingStudentId !== null) {

            const response = await fetch(
                `${API_URL}/${editingStudentId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(student)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = Object.values(errorData).join(" • ");
                throw new Error(errorMessage || "Failed to update student");
            }

            showToast("Student updated successfully!", "success");

            // Exit edit mode
           editingStudentId = null;

            document.querySelector("#studentForm button[type='submit']").textContent =
                "Add Student";

            document.getElementById("formTitle").textContent =
                "Add Student";

            document.getElementById("editModeBadge").style.display =
                "none";

            document.getElementById("cancelEditBtn").style.display =
                "none";

            studentForm.reset();

            loadStudents();

        }

        // ===============================
        // ADD STUDENT
        // ===============================

        else {

            const response = await fetch(API_URL, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(student)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = Object.values(errorData).join(" • ");
                throw new Error(errorMessage || "Failed to add student");
            }

            showToast("Student added successfully!", "success");

            studentForm.reset();
            
            loadStudents();
        }

    } 
    catch (error) {

    console.error("Student operation failed:", error);

    showToast(error.message, "error");
}

});


// ===============================
// GET ALL STUDENTS
// ===============================

async function loadStudents() {

    studentTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty">
                Loading students...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        const students = await response.json();

        allStudents = students;
        updateCourseFilter(students);
        updateStatistics(students);
        filterAndSearchStudents();

        

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

function refreshStudents() {
    loadStudents();
    showToast("Student records refreshed.", "success");
}


// ===============================
// DISPLAY STUDENTS
// ===============================

function displayStudents(students) {

    studentTableBody.innerHTML = "";

    const countText = document.getElementById("studentCountText");

    const totalStudents = currentFilteredStudents.length;

    const startIndex = totalStudents === 0
        ? 0
        : (currentPage - 1) * studentsPerPage + 1;

    const endIndex = Math.min(
        currentPage * studentsPerPage,
        totalStudents
    );

    countText.textContent =
        totalStudents === 0
            ? "Showing 0 students"
            : `Showing ${startIndex}–${endIndex} of ${totalStudents} students`;

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

    // Keep the rest of your existing displayStudents code here

    students.forEach(student => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.id}</td>
            <td>
                <button
                    class="student-name-btn"
                    onclick="viewStudent(${student.id})">
                    ${student.name}
                </button>
            </td>
            <td>${student.email}</td>
            <td>${student.course}</td>
            <td>${student.age}</td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editStudent(${student.id})">
                    Edit
                </button>

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
// UPDATE STATISTICS
// ===============================

function updateStatistics(students) {

    // Total students
    document.getElementById("totalStudents").textContent =
        students.length;

    // Total unique courses
    const courses = new Set(
        students.map(student => student.course)
    );

    document.getElementById("totalCourses").textContent =
        courses.size;

    // Average age
    if (students.length === 0) {

        document.getElementById("averageAge").textContent = "0";

    } else {

        const totalAge = students.reduce(
            (sum, student) => sum + Number(student.age),
            0
        );

        const averageAge = totalAge / students.length;

        document.getElementById("averageAge").textContent =
            averageAge.toFixed(1);
    }
        updateCourseDistribution(students);
        updateCourseChart(students);
}
// ===============================
// COURSE DISTRIBUTION
// ===============================

function updateCourseDistribution(students) {

    const container =
        document.getElementById("courseDistribution");

    if (students.length === 0) {
        container.innerHTML = "No course data available";
        return;
    }

    const courseCounts = {};

    students.forEach(student => {

        if (courseCounts[student.course]) {
            courseCounts[student.course]++;
        } else {
            courseCounts[student.course] = 1;
        }

    });

    container.innerHTML = "";

    Object.entries(courseCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([course, count]) => {

            const row = document.createElement("div");

            row.className = "course-row";

            row.innerHTML = `
                <div class="course-info">
                    <span>${course}</span>
                    <strong>${count}</strong>
                </div>

                <div class="course-bar">
                    <div
                        class="course-bar-fill"
                        style="width: ${
                            (count / students.length) * 100
                        }%;">
                    </div>
                </div>
            `;

            container.appendChild(row);
        });
}


// ===============================
// SEARCH + COURSE FILTER + SORT
// ===============================

function filterAndSearchStudents() {

    const searchText = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const selectedCourse = document
        .getElementById("courseFilter")
        .value;

    const sortOption = document
        .getElementById("sortOption")
        .value;

    let filteredStudents = allStudents.filter(student => {

        const matchesSearch =
            String(student.id).includes(searchText) ||
            student.name.toLowerCase().includes(searchText) ||
            student.email.toLowerCase().includes(searchText) ||
            student.course.toLowerCase().includes(searchText) ||
            String(student.age).includes(searchText);

        const matchesCourse =
            selectedCourse === "" ||
            student.course === selectedCourse;

        return matchesSearch && matchesCourse;
    });


    // ===============================
    // SORT STUDENTS
    // ===============================

    filteredStudents.sort((a, b) => {

        switch (sortOption) {

            case "id-asc":
                return a.id - b.id;

            case "id-desc":
                return b.id - a.id;

            case "name-asc":
                return a.name.localeCompare(b.name);

            case "name-desc":
                return b.name.localeCompare(a.name);

            case "age-asc":
                return a.age - b.age;

            case "age-desc":
                return b.age - a.age;

            case "course-asc":
                return a.course.localeCompare(b.course);

            case "course-desc":
                return b.course.localeCompare(a.course);

            default:
                return 0;
        }

    });

    currentFilteredStudents = filteredStudents;
currentPage = 1;

displayPaginatedStudents();
}


// ===============================
// PAGINATION
// ===============================

function displayPaginatedStudents() {

    const totalStudents = currentFilteredStudents.length;

    const totalPages =
        Math.ceil(totalStudents / studentsPerPage);

    // Make sure current page is valid
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }

    if (totalPages === 0) {
        currentPage = 1;
    }

    const startIndex =
        (currentPage - 1) * studentsPerPage;

    const endIndex =
        startIndex + studentsPerPage;

    const studentsForPage =
        currentFilteredStudents.slice(startIndex, endIndex);

    displayStudents(studentsForPage);

    updatePaginationControls(totalPages);
}

function updatePaginationControls(totalPages) {

    const paginationContainer =
        document.getElementById("paginationContainer");

    if (!paginationContainer) {
        return;
    }

    if (totalPages <= 1) {
        paginationContainer.innerHTML = "";
        return;
    }

    paginationContainer.innerHTML = `
        <button
            class="pagination-btn"
            onclick="changePage(-1)"
            ${currentPage === 1 ? "disabled" : ""}>
            ← Previous
        </button>

        <span class="page-info">
            Page ${currentPage} of ${totalPages}
        </span>

        <button
            class="pagination-btn"
            onclick="changePage(1)"
            ${currentPage === totalPages ? "disabled" : ""}>
            Next →
        </button>
    `;
}
function changePage(direction) {

    const totalPages =
        Math.ceil(
            currentFilteredStudents.length / studentsPerPage
        );

    const newPage = currentPage + direction;

    if (newPage < 1 || newPage > totalPages) {
        return;
    }

    currentPage = newPage;

    displayPaginatedStudents();
}


// ===============================
// LOAD COURSE FILTER
// ===============================

function updateCourseFilter(students) {

    const courseFilter = document.getElementById("courseFilter");

    const currentCourse = courseFilter.value;

    const courses = [
        ...new Set(students.map(student => student.course))
    ].sort();

    courseFilter.innerHTML = `
        <option value="">All Courses</option>
    `;

    courses.forEach(course => {

        const option = document.createElement("option");

        option.value = course;
        option.textContent = course;

        courseFilter.appendChild(option);
    });

    // Keep previous selection if it still exists
    if (courses.includes(currentCourse)) {
        courseFilter.value = currentCourse;
    }
}

// ===============================
// EDIT STUDENT
// ===============================

async function editStudent(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error("Failed to fetch student");
        }

        const student = await response.json();

        // Put student data into form
        document.getElementById("name").value = student.name;
        document.getElementById("email").value = student.email;
        document.getElementById("course").value = student.course;
        document.getElementById("age").value = student.age;

        // Store ID
        editingStudentId = id;

        // Change button text
                document.querySelector("#studentForm button[type='submit']").textContent =
            "Update Student";
            document.getElementById("formTitle").textContent =
    "Edit Student";
            
            document.getElementById("editModeBadge").style.display =
    "inline-block";

        document.getElementById("cancelEditBtn").style.display =
            "inline-block";

        // Scroll to form
        studentForm.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(error);

        showToast("Unable to load student details.", "error");
    }
}


// ===============================
// VIEW STUDENT DETAILS
// ===============================

async function viewStudent(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error("Failed to fetch student");
        }

        const student = await response.json();

        const details = `
            <div class="student-details">

                <div class="details-header">
                    <h2>Student Details</h2>

                    <button
                        class="close-details"
                        onclick="closeStudentDetails()">
                        ×
                    </button>
                </div>

                <div class="details-content">

                    <p>
                        <strong>ID:</strong>
                        ${student.id}
                    </p>

                    <p>
                        <strong>Name:</strong>
                        ${student.name}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${student.email}
                    </p>

                    <p>
                        <strong>Course:</strong>
                        ${student.course}
                    </p>

                    <p>
                        <strong>Age:</strong>
                        ${student.age}
                    </p>

                </div>

            </div>
        `;

        let detailsContainer =
            document.getElementById("studentDetailsContainer");

        if (!detailsContainer) {

            detailsContainer = document.createElement("div");

            detailsContainer.id = "studentDetailsContainer";

            document.body.appendChild(detailsContainer);
        }
        detailsContainer.innerHTML = details;

        detailsContainer.addEventListener("click", function (event) {

    if (event.target === detailsContainer) {
        closeStudentDetails();
    }

});

// ===============================
// CLOSE DETAILS WITH ESCAPE
// ===============================

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeStudentDetails();
    }

});

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load student details.",
            "error"
        );
    }
}


// ===============================
// CLOSE STUDENT DETAILS
// ===============================

function closeStudentDetails() {

    const detailsContainer =
        document.getElementById("studentDetailsContainer");

    if (detailsContainer) {
        detailsContainer.remove();
    }
}

// ===============================
// CANCEL EDIT
// ===============================

function cancelEdit() {

    editingStudentId = null;

    studentForm.reset();

    document.getElementById("formTitle").textContent =
        "Add Student";
    document.getElementById("editModeBadge").style.display =
    "none";

    document.querySelector("#studentForm button[type='submit']").textContent =
        "Add Student";

    document.getElementById("cancelEditBtn").style.display =
        "none";
}


// ===============================
// DELETE STUDENT
// ===============================

async function deleteStudent(id) {

    const student = allStudents.find(student => student.id === id);

    if (!student) {
        showToast("Student not found.", "error");
        return;
    }

    const existingPopup =
        document.getElementById("deleteConfirmContainer");

    if (existingPopup) {
        existingPopup.remove();
    }

    const deleteContainer = document.createElement("div");

    deleteContainer.id = "deleteConfirmContainer";

    deleteContainer.innerHTML = `
        <div class="delete-confirm-box">

            <div class="delete-icon">
                !
            </div>

            <h2>Delete Student?</h2>

            <p>
                Are you sure you want to delete
                <strong>${student.name}</strong>?
            </p>

            <p class="delete-warning">
                This action cannot be undone.
            </p>

            <div class="delete-buttons">

                <button
                    class="cancel-delete-btn"
                    onclick="closeDeleteConfirmation()">
                    Cancel
                </button>

                <button
                    class="confirm-delete-btn"
                    onclick="confirmDeleteStudent(${id})">
                    Delete
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(deleteContainer);

    deleteContainer.addEventListener("click", function(event) {
        if (event.target === deleteContainer) {
            closeDeleteConfirmation();
        }
    });
}

async function confirmDeleteStudent(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete student");
        }

        closeDeleteConfirmation();

        showToast("Student deleted successfully!", "success");

        loadStudents();

    } catch (error) {

    console.error("Delete operation failed:", error);

    closeDeleteConfirmation();

    showToast(
        "Unable to delete student. Please try again.",
        "error"
    );
}
}

function closeDeleteConfirmation() {

    const deleteContainer =
        document.getElementById("deleteConfirmContainer");

    if (deleteContainer) {
        deleteContainer.remove();
    }
}

// ===============================
// TOAST NOTIFICATION
// ===============================

function showToast(message, type = "success") {

    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


// ===============================
// CLEAR FILTERS
// ===============================

function clearFilters() {

    document.getElementById("searchInput").value = "";
    document.getElementById("courseFilter").value = "";
    document.getElementById("sortOption").value = "";

    currentPage = 1;

    filterAndSearchStudents();

    showToast("Filters cleared.", "success");
}

// ===============================
// EXPORT MATCHING STUDENTS TO CSV
// ===============================

function exportStudents() {

    const searchText = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const selectedCourse =
        document.getElementById("courseFilter").value;

    const sortOption =
        document.getElementById("sortOption").value;

    // Get matching students
    let studentsToExport = allStudents.filter(student => {

        const matchesSearch =
            String(student.id).includes(searchText) ||
            student.name.toLowerCase().includes(searchText) ||
            student.email.toLowerCase().includes(searchText) ||
            student.course.toLowerCase().includes(searchText) ||
            String(student.age).includes(searchText);

        const matchesCourse =
            selectedCourse === "" ||
            student.course === selectedCourse;

        return matchesSearch && matchesCourse;
    });

    // Apply same sorting
    studentsToExport.sort((a, b) => {

        switch (sortOption) {

            case "id-asc":
                return a.id - b.id;

            case "id-desc":
                return b.id - a.id;

            case "name-asc":
                return a.name.localeCompare(b.name);

            case "name-desc":
                return b.name.localeCompare(a.name);

            case "age-asc":
                return a.age - b.age;

            case "age-desc":
                return b.age - a.age;

            case "course-asc":
                return a.course.localeCompare(b.course);

            case "course-desc":
                return b.course.localeCompare(a.course);

            default:
                return 0;
        }
    });

    // Nothing matched
    if (studentsToExport.length === 0) {
        showToast("No matching students to export.", "error");
        return;
    }

    // Create CSV
    let csv = "ID,Name,Email,Course,Age\r\n";

    studentsToExport.forEach(student => {

        csv += `"${student.id}","${student.name}","${student.email}","${student.course}","${student.age}"\r\n`;

    });

    // Create download file
    const blob = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "students.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast(
        `${studentsToExport.length} student(s) exported successfully!`,
        "success"
    );
}
// ===============================
// IMPORT STUDENTS FROM CSV
// ===============================

async function importStudentsFromCSV(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {

        showToast(
            "Please select a CSV file.",
            "error"
        );

        event.target.value = "";
        return;
    }

    try {

        const text = await file.text();

        const lines = text
            .split(/\r?\n/)
            .filter(line => line.trim() !== "");

        if (lines.length < 2) {

            showToast(
                "CSV file contains no student records.",
                "error"
            );

            event.target.value = "";
            return;
        }

        // Remove header row
        const dataLines = lines.slice(1);

        let importedCount = 0;
        let failedCount = 0;

        for (const line of dataLines) {

            const values = parseCSVLine(line);

            if (values.length !== 4) {

                failedCount++;
                continue;
            }

            const name = values[0].trim();
            const email = values[1].trim();
            const course = values[2].trim();
            const age = Number(values[3].trim());

            // Validate data
            if (
                name.length < 2 ||
                !email.includes("@") ||
                !email.includes(".") ||
                course.length < 2 ||
                age < 1 ||
                age > 100
            ) {

                failedCount++;
                continue;
            }

            const student = {
                name: name,
                email: email,
                course: course,
                age: age
            };

            try {

                const response = await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(student)

                });

                if (response.ok) {

                    importedCount++;

                } else {

                    const errorData = await response.json();

                    console.error(
                        "Backend validation failed:",
                        errorData
                    );

                    failedCount++;
                }

            } catch (error) {

                console.error(
                    "Failed to import student:",
                    error
                );

                failedCount++;
            }
        }

        // Refresh student records
        await loadStudents();

        if (importedCount > 0 && failedCount === 0) {

            showToast(
                `${importedCount} student(s) imported successfully!`,
                "success"
            );

        } else if (importedCount > 0 && failedCount > 0) {

            showToast(
                `${importedCount} imported, ${failedCount} failed.`,
                "error"
            );

        } else {

            showToast(
                "No students were imported.",
                "error"
            );
        }

    } catch (error) {

        console.error(
            "CSV import failed:",
            error
        );

        showToast(
            "Unable to read the CSV file.",
            "error"
        );

    } finally {

        // Allow selecting the same file again
        event.target.value = "";
    }
}
// ===============================
// CSV LINE PARSER
// ===============================

function parseCSVLine(line) {

    const values = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {

        const character = line[i];

        if (character === '"') {

            if (
                insideQuotes &&
                line[i + 1] === '"'
            ) {

                currentValue += '"';
                i++;

            } else {

                insideQuotes = !insideQuotes;
            }

        } else if (
            character === "," &&
            !insideQuotes
        ) {

            values.push(currentValue);
            currentValue = "";

        } else {

            currentValue += character;
        }
    }

    values.push(currentValue);

    return values;
}

// ===============================
// LOAD STUDENTS WHEN PAGE OPENS
// ===============================

loadStudents();

// ===============================
// LOGOUT
// ===============================

function logout() {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminUsername");

    window.location.href = "login.html";
}

// ===============================
// COURSE DISTRIBUTION CHART
// ===============================

let courseChart = null;

function updateCourseChart(students) {

    const chartCanvas = document.getElementById("courseChart");

    if (!chartCanvas) return;

    const courseCounts = {};

    students.forEach(student => {

        const course = student.course;

        if (course) {
            courseCounts[course] =
                (courseCounts[course] || 0) + 1;
        }

    });

    const labels = Object.keys(courseCounts);
    const data = Object.values(courseCounts);

    if (courseChart) {
        courseChart.destroy();
    }

    courseChart = new Chart(chartCanvas, {
        type: "bar",

        data: {
            labels: labels,

            datasets: [{
                label: "Number of Students",
                data: data
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    display: true
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ===============================
// GENERATE STUDENT PDF REPORT
// ===============================

function generateStudentReport() {

    const searchText = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const selectedCourse =
        document.getElementById("courseFilter").value;

    const sortOption =
        document.getElementById("sortOption").value;


    // Get matching students
    let studentsToExport = allStudents.filter(student => {

        const matchesSearch =
            String(student.id).includes(searchText) ||
            student.name.toLowerCase().includes(searchText) ||
            student.email.toLowerCase().includes(searchText) ||
            student.course.toLowerCase().includes(searchText) ||
            String(student.age).includes(searchText);

        const matchesCourse =
            selectedCourse === "" ||
            student.course === selectedCourse;

        return matchesSearch && matchesCourse;
    });


    // Apply same sorting
    studentsToExport.sort((a, b) => {

        switch (sortOption) {

            case "id-asc":
                return a.id - b.id;

            case "id-desc":
                return b.id - a.id;

            case "name-asc":
                return a.name.localeCompare(b.name);

            case "name-desc":
                return b.name.localeCompare(a.name);

            case "age-asc":
                return a.age - b.age;

            case "age-desc":
                return b.age - a.age;

            case "course-asc":
                return a.course.localeCompare(b.course);

            case "course-desc":
                return b.course.localeCompare(a.course);

            default:
                return 0;
        }
    });


    // No matching students
    if (studentsToExport.length === 0) {

        showToast(
            "No matching students to generate report.",
            "error"
        );

        return;
    }


    // Check jsPDF
    if (!window.jspdf) {

        showToast(
            "PDF library could not be loaded.",
            "error"
        );

        return;
    }


    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();


    // ===============================
    // REPORT HEADER
    // ===============================

    doc.setFontSize(20);

    doc.setFont("helvetica", "bold");

    doc.text(
        "Student Management System",
        105,
        20,
        { align: "center" }
    );


    doc.setFontSize(15);

    doc.setFont("helvetica", "normal");

    doc.text(
        "Student Report",
        105,
        30,
        { align: "center" }
    );


    // Report information

    doc.setFontSize(10);

    doc.text(
        `Total Students: ${studentsToExport.length}`,
        15,
        42
    );

    doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        15,
        49
    );


    // ===============================
    // TABLE HEADER
    // ===============================

    let y = 62;

    doc.setFontSize(10);

    doc.setFont("helvetica", "bold");

    doc.text("ID", 15, y);
    doc.text("Name", 30, y);
    doc.text("Email", 70, y);
    doc.text("Course", 130, y);
    doc.text("Age", 190, y);


    // Header line

    doc.line(
        15,
        y + 3,
        200,
        y + 3
    );


    // ===============================
    // STUDENT DATA
    // ===============================

    doc.setFont("helvetica", "normal");

    y += 12;


    studentsToExport.forEach((student, index) => {

        // New page
        if (y > 275) {

            doc.addPage();

            y = 20;

            doc.setFont("helvetica", "bold");

            doc.text(
                "Student Report - Continued",
                105,
                y,
                { align: "center" }
            );

            y += 15;

            doc.text("ID", 15, y);
            doc.text("Name", 30, y);
            doc.text("Email", 70, y);
            doc.text("Course", 130, y);
            doc.text("Age", 190, y);

            doc.line(
                15,
                y + 3,
                200,
                y + 3
            );

            y += 12;

            doc.setFont("helvetica", "normal");
        }


        const name =
            String(student.name).substring(0, 22);

        const email =
            String(student.email).substring(0, 32);

        const course =
            String(student.course).substring(0, 25);


        doc.text(
            String(student.id),
            15,
            y
        );

        doc.text(
            name,
            30,
            y
        );

        doc.text(
            email,
            70,
            y
        );

        doc.text(
            course,
            130,
            y
        );

        doc.text(
            String(student.age),
            190,
            y
        );


        y += 9;
    });


    // ===============================
    // FOOTER
    // ===============================

    const pageCount =
        doc.internal.getNumberOfPages();

    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {

        doc.setPage(page);

        doc.setFontSize(9);

        doc.text(
            `Page ${page} of ${pageCount}`,
            105,
            290,
            { align: "center" }
        );
    }


    // ===============================
    // DOWNLOAD
    // ===============================

    doc.save("student-report.pdf");


    showToast(
        `${studentsToExport.length} student(s) included in PDF report.`,
        "success"
    );
}