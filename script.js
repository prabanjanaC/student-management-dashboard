// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const studentForm = document.getElementById("studentForm");

const registrationBtn = document.getElementById("registrationBtn");
const listBtn = document.getElementById("listBtn");

const registrationSection = document.getElementById("registrationSection");
const listSection = document.getElementById("listSection");

const studentTableBody = document.getElementById("studentTableBody");

const searchInput = document.getElementById("searchInput");
const departmentFilter = document.getElementById("departmentFilter");

const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const studentCount = document.getElementById("studentCount");

const API_BASE_URL = "http://localhost:5000";

const verifyEmailBtn = document.getElementById("verifyEmailBtn");
const otpSection = document.getElementById("otpSection");
const otpInput = document.getElementById("otpInput");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const otpMessage = document.getElementById("otpMessage");

let verifiedEmail = "";

// ==========================================
// 2. GET FORM FIELDS
// ==========================================

const studentName = document.getElementById("studentName");
const registerNumber = document.getElementById("registerNumber");
const email = document.getElementById("email");
const department = document.getElementById("department");
const year = document.getElementById("year");
const phone = document.getElementById("phone");

// ==========================================
// 3. LOAD STUDENTS FROM LOCAL STORAGE
// ==========================================

let students = [];

try {
  students = JSON.parse(localStorage.getItem("students")) || [];

  if (!Array.isArray(students)) {
    students = [];
  }
} catch (error) {
  students = [];
}

// Editing variables

let isEditing = false;
let originalRegNo = "";

// ==========================================
// 4. SAVE STUDENTS TO LOCAL STORAGE
// ==========================================

function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students));
}

// ==========================================
// 5. SWITCH BETWEEN SECTIONS
// ==========================================

registrationBtn.addEventListener("click", () => {
  if (isEditing) {
    studentForm.reset();
    resetForm();
  }

  showSection("registration");
});

listBtn.addEventListener("click", () => {
  if (isEditing) {
    studentForm.reset();
    resetForm();
  }

  showSection("list");
});

function showSection(section) {
  if (section === "registration") {
    registrationSection.hidden = false;
    listSection.hidden = true;

    registrationBtn.classList.add("active");
    listBtn.classList.remove("active");
  } else {
    registrationSection.hidden = true;
    listSection.hidden = false;

    listBtn.classList.add("active");
    registrationBtn.classList.remove("active");

    displayStudents();
  }
}

// ==========================================
// 6. ADD OR UPDATE STUDENT
// ==========================================

studentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get Form Values

  const name = studentName.value.trim();
  const regNo = registerNumber.value.trim();
  const studentEmail = email.value.trim();
  const studentDepartment = department.value;
  const studentYear = year.value;
  const studentPhone = phone.value.trim();

  if (verifiedEmail !== studentEmail.toLowerCase()) {
    alert("Please verify your email before submitting the form.");
    return;
  }

  // Check for Duplicate Register Number

  const duplicate = students.some(
    (student) =>
      student.registerNumber.toLowerCase() === regNo.toLowerCase() &&
      (!isEditing ||
        student.registerNumber.toLowerCase() !== originalRegNo.toLowerCase()),
  );

  if (duplicate) {
    alert("This Register Number already exists!");
    registerNumber.focus();
    return;
  }

  // Create Student Object

  const studentDetails = {
    id: regNo,
    name: name,
    registerNumber: regNo,
    email: studentEmail,
    department: studentDepartment,
    year: studentYear,
    phone: studentPhone,
  };

  if (isEditing) {
    // Update Existing Student

    students = students.map((student) =>
      student.registerNumber.toLowerCase() === originalRegNo.toLowerCase()
        ? studentDetails
        : student,
    );

    alert("Student details updated successfully!");
  } else {
    // Add New Student

    students.push(studentDetails);

    alert("Student registered successfully!");
  }

  // Save and Refresh

  saveStudents();

  studentForm.reset();

  resetForm();

  displayStudents();

  showSection("list");
});

// ==========================================
// 7. DISPLAY STUDENTS IN TABLE
// ==========================================

function displayStudents() {
  studentTableBody.textContent = "";

  const searchValue = searchInput.value.toLowerCase().trim();
  const selectedDepartment = departmentFilter.value;

  // Search and Filter Students

  const filteredStudents = students.filter((student) => {
    const matchesName = student.name.toLowerCase().includes(searchValue);

    const matchesDepartment =
      selectedDepartment === "" || student.department === selectedDepartment;

    return matchesName && matchesDepartment;
  });

  // Display Empty Message

  if (filteredStudents.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 8;
    cell.className = "empty-message";
    cell.textContent = "No students found.";

    row.appendChild(cell);

    studentTableBody.appendChild(row);
  }

  // Display Student Records

  filteredStudents.forEach((student, index) => {
    const row = document.createElement("tr");

    const values = [
      index + 1,
      student.name,
      student.registerNumber,
      student.email,
      student.department,
      student.year,
      student.phone,
    ];

    values.forEach((value) => {
      const cell = document.createElement("td");

      cell.textContent = value;

      row.appendChild(cell);
    });

    // Actions Column

    const actionCell = document.createElement("td");

    // Edit Button

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "action-btn edit-btn";
    editButton.textContent = "✎";
    editButton.title = "Edit Student";
    editButton.setAttribute("aria-label", "Edit student");

    editButton.dataset.id = student.registerNumber;

    // Delete Button

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "action-btn delete-btn";
    deleteButton.textContent = "🗑";
    deleteButton.title = "Delete Student";
    deleteButton.setAttribute("aria-label", "Delete student");

    deleteButton.dataset.id = student.registerNumber;

    actionCell.appendChild(editButton);
    actionCell.appendChild(deleteButton);

    row.appendChild(actionCell);

    studentTableBody.appendChild(row);
  });

  // Update Student Count

  studentCount.textContent = `Showing ${filteredStudents.length} of ${students.length} students`;
}

// ==========================================
// 8. HANDLE EDIT AND DELETE BUTTONS
// ==========================================

studentTableBody.addEventListener("click", function (event) {
  const button = event.target.closest("button");

  if (!button) return;

  const regNo = button.dataset.id;

  if (button.classList.contains("edit-btn")) {
    editStudent(regNo);
  }

  if (button.classList.contains("delete-btn")) {
    deleteStudent(regNo);
  }
});

// ==========================================
// 9. EDIT STUDENT
// ==========================================

function editStudent(regNo) {
  const student = students.find(
    (student) => student.registerNumber.toLowerCase() === regNo.toLowerCase(),
  );

  if (!student) return;

  // Fill Existing Student Details

  studentName.value = student.name;
  registerNumber.value = student.registerNumber;
  email.value = student.email;
  department.value = student.department;
  year.value = student.year;
  phone.value = student.phone;

  // Enable Editing Mode

  isEditing = true;
  originalRegNo = student.registerNumber;

  // Change Form Heading and Button

  formTitle.textContent = "Edit Student Details";

  submitBtn.textContent = "Update Student";

  cancelBtn.hidden = false;

  // Open Registration Form

  showSection("registration");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// ==========================================
// 10. DELETE STUDENT
// ==========================================

function deleteStudent(regNo) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this student?",
  );

  if (!confirmDelete) return;

  students = students.filter(
    (student) => student.registerNumber.toLowerCase() !== regNo.toLowerCase(),
  );

  saveStudents();

  displayStudents();
}

// ==========================================
// 11. RESET FORM
// ==========================================

function resetForm() {
  isEditing = false;

  originalRegNo = "";

  formTitle.textContent = "Student Registration Form";

  submitBtn.textContent = "Submit";

  cancelBtn.hidden = true;

  verifiedEmail = "";

  otpSection.hidden = true;
  otpInput.value = "";
  otpInput.disabled = false;

  verifyEmailBtn.disabled = false;
  verifyEmailBtn.textContent = "Verify Email";

  verifyOtpBtn.disabled = false;
  verifyOtpBtn.textContent = "Verify OTP";

  otpMessage.textContent = "";
  otpMessage.style.color = "";
}

// ==========================================
// 12. CANCEL EDITING
// ==========================================

cancelBtn.addEventListener("click", () => {
  studentForm.reset();

  resetForm();

  showSection("list");
});

// ==========================================
// 13. SEARCH STUDENTS BY NAME
// ==========================================

searchInput.addEventListener("input", () => {
  displayStudents();
});

// ==========================================
// 14. FILTER STUDENTS BY DEPARTMENT
// ==========================================

departmentFilter.addEventListener("change", () => {
  displayStudents();
});

// ==========================================
// 15. INITIAL DISPLAY
// ==========================================

displayStudents();

showSection("registration");

// ==========================================
// 16. EMAIL VERIFICAION AND OTP HANDLING
// ==========================================

verifyEmailBtn.addEventListener("click", async () => {
  const emailValue = email.value.trim().toLowerCase();
  const nameValue = studentName.value.trim();

  if (!emailValue) {
    alert("Please enter a valid email address.");
    email.focus();
    return;
  }

  if (email.checkValidity() === false) {
    alert("Please enter a valid email address.");
    email.focus();
    return;
  }

  try {
    verifyEmailBtn.disabled = true;
    verifyEmailBtn.textContent = "Sending...";

    const response = await fetch(`${API_BASE_URL}/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailValue,
        studentName: nameValue,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }
    verifiedEmail = "";
    otpInput.value = "";
    otpInput.disabled = false;
    verifyOtpBtn.disabled = false;

    otpSection.hidden = false;
    otpMessage.textContent = result.message;

    alert("OTP sent successfully! Check your email.");

    otpInput.focus();
  } catch (error) {
    console.error("OTP sending error:", error);
    alert(error.message || "Unable to send OTP. Please try again.");
  } finally {
    verifyEmailBtn.disabled = false;
    verifyEmailBtn.textContent = "Verify Email";
  }
});

verifyOtpBtn.addEventListener("click", async function () {
  const emailValue = email.value.trim().toLowerCase();
  const otpValue = otpInput.value.trim();

  if (!otpValue) {
    alert("Please enter the OTP.");
    otpInput.focus();
    return;
  }

  if (!/^\d{6}$/.test(otpValue)) {
    alert("Please enter a valid 6-digit OTP.");
    return;
  }

  try {
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Verifying...";

    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailValue,
        otp: otpValue,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    verifiedEmail = emailValue;

    otpMessage.textContent = "Email verified successfully!";
    otpMessage.style.color = "#16a34a";

    otpInput.disabled = true;
    verifyOtpBtn.textContent = "Verified";

    verifyEmailBtn.textContent = "Email Verified";
    verifyEmailBtn.disabled = true;

    alert("Email verified successfully! You can now register.");
  } catch (error) {
    console.error("OTP verification error:", error);
    alert(error.message || "OTP verification failed.");

    verifyOtpBtn.disabled = false;
    verifyOtpBtn.textContent = "Verify OTP";
  }
});

email.addEventListener("input", function () {
  const currentEmail = email.value.trim().toLowerCase();

  if (verifiedEmail && currentEmail !== verifiedEmail) {
    verifiedEmail = "";

    otpInput.value = "";
    otpInput.disabled = false;

    otpSection.hidden = true;

    verifyEmailBtn.disabled = false;
    verifyEmailBtn.textContent = "Verify Email";

    verifyOtpBtn.disabled = false;
    verifyOtpBtn.textContent = "Verify OTP";

    otpMessage.textContent = "";
  }
});
