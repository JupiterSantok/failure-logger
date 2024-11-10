// Load stored failure logs from localStorage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadFailures();
});

// Listen to form submission
document.getElementById('failureForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get values from form fields
    const testerId = document.getElementById('testerId').value;
    const mtfBin = document.getElementById('mtfBin').value;
    const testName = document.getElementById('testName').value;
    const testNumber = document.getElementById('testNumber').value;
    const dietype = document.getElementById('dietype').value;
    const jobReason = document.getElementById('jobReason').value;
    const comment = document.getElementById('comment').value;
    const employeeId = document.getElementById('employeeId').value;  // Get the Employee ID
    const timestamp = new Date().toLocaleString();  // Capture timestamp

    // Create a failure log object
    const failure = {
        timestamp,
        testerId,
        mtfBin,
        testName,
        testNumber,
        dietype,
        jobReason,
        comment,
        employeeId  // Store Employee ID instead of Tech Name
    };

    // Save the failure log to localStorage
    saveFailure(failure);

    // Clear the form fields after submission
    this.reset();

    // Load the updated failure logs from localStorage
    loadFailures();
});

// Save failure log to localStorage
function saveFailure(failure) {
    // Get the existing failure logs from localStorage
    let failures = JSON.parse(localStorage.getItem('failures')) || [];
    failures.push(failure);  // Add new failure log to the list

    // Save the updated list of failures back to localStorage
    localStorage.setItem('failures', JSON.stringify(failures));
}

// Load failures from localStorage and display them in the table
function loadFailures() {
    const failures = JSON.parse(localStorage.getItem('failures')) || [];
    const tableBody = document.querySelector('#failureTable tbody');

    // Clear the table before adding new rows
    tableBody.innerHTML = '';

    // Add rows for each failure log
    failures.forEach((failure, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${failure.timestamp}</td>
            <td>${failure.testerId}</td>
            <td>${failure.mtfBin}</td>
            <td>${failure.testName}</td>
            <td>${failure.testNumber}</td>
            <td>${failure.dietype}</td>
            <td>${failure.jobReason}</td>
            <td class="comment">${failure.comment || 'N/A'}</td>
            <td>${failure.employeeId}</td>  <!-- Display Employee ID -->
            <td><button class="delete-btn" onclick="confirmDeleteFailure(${index})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Confirm deletion of a failure log
function confirmDeleteFailure(index) {
    const confirmation = window.confirm("Are you sure you want to delete this failure log?");

    if (confirmation) {
        deleteFailure(index);  // Proceed with deletion if confirmed
    }
}

// Delete a failure log
function deleteFailure(index) {
    // Get existing failures from localStorage
    let failures = JSON.parse(localStorage.getItem('failures')) || [];
    
    // Remove the failure at the specified index
    failures.splice(index, 1);

    // Save the updated list of failures back to localStorage
    localStorage.setItem('failures', JSON.stringify(failures));

    // Reload the updated table
    loadFailures();
}

// Export the failure logs to an Excel file
function exportToExcel() {
    const failures = JSON.parse(localStorage.getItem('failures')) || [];

    if (failures.length === 0) {
        alert("No data to export.");
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(failures);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Failures");

    // Save the file as an Excel spreadsheet
    XLSX.writeFile(workbook, "Failure_Logs.xlsx");
}

// Filter failures based on search input
function filterFailures() {
    const query = document.getElementById('searchFilter').value.toLowerCase();
    const failures = JSON.parse(localStorage.getItem('failures')) || [];
    const tableBody = document.querySelector('#failureTable tbody');

    // Clear the table before adding filtered rows
    tableBody.innerHTML = '';

    // Loop through failures and filter based on the search query
    failures.forEach((failure, index) => {
        const row = document.createElement('tr');
        const isMatch = (
            failure.testerId.toLowerCase().includes(query) ||
            failure.mtfBin.toLowerCase().includes(query) ||
            failure.testName.toLowerCase().includes(query) ||
            failure.testNumber.toString().includes(query) ||
            failure.dietype.toString().includes(query) ||
            failure.jobReason.toLowerCase().includes(query) ||
            (failure.comment && failure.comment.toLowerCase().includes(query)) ||
            (failure.employeeId && failure.employeeId.toLowerCase().includes(query)) // Add Employee ID to the filter
        );

        // If the row matches, show it, otherwise hide it
        if (isMatch) {
            row.classList.remove('hidden');
            highlightText(row, query);  // Highlight matching text
        } else {
            row.classList.add('hidden');
        }

        // Fill in the row with data
        row.innerHTML = `
            <td>${failure.timestamp}</td>
            <td>${failure.testerId}</td>
            <td>${failure.mtfBin}</td>
            <td>${failure.testName}</td>
            <td>${failure.testNumber}</td>
            <td>${failure.dietype}</td>
            <td>${failure.jobReason}</td>
            <td class="comment">${failure.comment || 'N/A'}</td>
            <td>${failure.employeeId}</td>  <!-- Display Employee ID -->
            <td><button class="delete-btn" onclick="confirmDeleteFailure(${index})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to highlight the matched text
function highlightText(row, query) {
    const cells = row.querySelectorAll('td');
    cells.forEach(cell => {
        const cellText = cell.innerHTML;
        if (cellText.toLowerCase().includes(query)) {
            const highlightedText = cellText.replace(new RegExp(query, 'gi'), match => {
                return `<span class="highlight">${match}</span>`;
            });
            cell.innerHTML = highlightedText;
        }
    });
}
