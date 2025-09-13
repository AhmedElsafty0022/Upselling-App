const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

const form = document.getElementById('dataForm');
const outputs = document.getElementById('outputs');
const loadSampleBtn = document.getElementById('loadSample');
const resetBtn = document.getElementById('resetForm');
const themeToggle = document.getElementById('themeToggle');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const generateBtn = document.getElementById('generateBtn');
const voucherRangesContainer = document.getElementById('voucherRangesContainer');
let rangeCount = 1;

// Set default dates (September 07, 2025, and +3 days)
const today = new Date('2025-09-07');
const checkoutDefault = new Date(today);
checkoutDefault.setDate(today.getDate() + 3);

document.getElementById('checkin').value = today.toISOString().split('T')[0];
document.getElementById('checkout').value = checkoutDefault.toISOString().split('T')[0];

// Theme toggle
themeToggle.addEventListener('click', () => {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        body.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
});

// Add voucher range
function addVoucherRange() {
    const newRange = document.createElement('div');
    newRange.className = 'input-group mb-2 voucher-range';
    newRange.id = `voucherRange${rangeCount}`;
    newRange.innerHTML = `
        <input type="number" class="form-control voucher-start" placeholder="Start (e.g., 10001)" min="1" required>
        <input type="number" class="form-control voucher-end" placeholder="End (e.g., 10005)" min="1" required>
        <button type="button" class="btn btn-danger remove-range-btn" onclick="removeVoucherRange(${rangeCount})"><i class="fas fa-trash"></i></button>
    `;
    voucherRangesContainer.appendChild(newRange);
    rangeCount++;
    updateRemoveButtons();
}

// Remove voucher range
function removeVoucherRange(index) {
    const rangeElement = document.getElementById(`voucherRange${index}`);
    if (rangeElement) {
        rangeElement.remove();
    }
    updateRemoveButtons();
}

function updateRemoveButtons() {
    const ranges = voucherRangesContainer.querySelectorAll('.voucher-range');
    if (ranges.length === 1) {
        ranges[0].querySelector('.remove-range-btn').style.display = 'none';
    } else {
        ranges.forEach(range => range.querySelector('.remove-range-btn').style.display = 'block');
    }
}
updateRemoveButtons();

loadSampleBtn.addEventListener('click', function() {
    document.getElementById('name').value = 'John Doe';
    document.getElementById('hcn').value = '123456789';
    document.getElementById('room').value = '101';
    document.getElementById('checkin').value = '2025-09-06';
    document.getElementById('checkout').value = '2025-09-09';
    document.getElementById('guests').value = 2;
    document.getElementById('type').value = 'Visa';
    document.getElementById('amount').value = 40;
    document.getElementById('currency').value = 'AED';
    document.getElementById('meal1').value = 'RO';
    document.getElementById('meal2').value = 'BB';
    document.getElementById('cashier').value = 'Ahmed';
    document.getElementById('notes').value = 'Sample notes';

    // Reset voucher ranges
    voucherRangesContainer.innerHTML = `
        <div class="input-group mb-2 voucher-range" id="voucherRange0">
            <input type="number" class="form-control voucher-start" placeholder="Start (e.g., 10001)" min="1" required value="10001">
            <input type="number" class="form-control voucher-end" placeholder="End (e.g., 10005)" min="1" required value="10005">
            <button type="button" class="btn btn-danger remove-range-btn" onclick="removeVoucherRange(0)" style="display: none;"><i class="fas fa-trash"></i></button>
        </div>
    `;
    rangeCount = 1;
    addVoucherRange();
    const secondRange = document.getElementById(`voucherRange${rangeCount - 1}`);
    secondRange.querySelector('.voucher-start').value = '20001';
    secondRange.querySelector('.voucher-end').value = '20003';
    updateRemoveButtons();

    errorMessage.classList.add('d-none');
    successMessage.classList.add('d-none');
});

resetBtn.addEventListener('click', function() {
    form.reset();
    document.getElementById('sheet1').value = '';
    document.getElementById('sheet2').value = '';
    document.getElementById('system').value = '';
    outputs.classList.add('d-none');
    document.getElementById('checkin').value = today.toISOString().split('T')[0];
    document.getElementById('checkout').value = checkoutDefault.toISOString().split('T')[0];
    document.getElementById('meal1').value = 'RO';
    document.getElementById('meal2').value = 'BB';

    // Reset voucher ranges
    voucherRangesContainer.innerHTML = `
        <div class="input-group mb-2 voucher-range" id="voucherRange0">
            <input type="number" class="form-control voucher-start" placeholder="Start (e.g., 10001)" min="1" required>
            <input type="number" class="form-control voucher-end" placeholder="End (e.g., 10005)" min="1" required>
            <button type="button" class="btn btn-danger remove-range-btn" onclick="removeVoucherRange(0)" style="display: none;"><i class="fas fa-trash"></i></button>
        </div>
    `;
    rangeCount = 1;
    updateRemoveButtons();

    errorMessage.classList.add('d-none');
    successMessage.classList.add('d-none');
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-cogs"></i> Generating...';
    generateBtn.classList.add('loading');

    // Get values
    const name = document.getElementById('name').value.trim();
    const hcn = document.getElementById('hcn').value.trim();
    const room = document.getElementById('room').value.trim();
    const checkinDate = new Date(document.getElementById('checkin').value);
    const checkoutDate = new Date(document.getElementById('checkout').value);
    const guests = parseInt(document.getElementById('guests').value);
    const type = document.getElementById('type').value.trim();
    const typeUpper = type.toUpperCase();
    const amount = parseFloat(document.getElementById('amount').value || 0);
    const currency = document.getElementById('currency').value.trim();
    const meal1 = document.getElementById('meal1').value.trim();
    const meal2 = document.getElementById('meal2').value.trim();
    const cashier = document.getElementById('cashier').value.trim();
    const notes = document.getElementById('notes').value.trim();

    // Get voucher ranges
    const voucherRanges = [];
    const rangeElements = voucherRangesContainer.querySelectorAll('.voucher-range');
    let validRanges = true;
    for (const range of rangeElements) {
        const start = parseInt(range.querySelector('.voucher-start').value);
        const end = parseInt(range.querySelector('.voucher-end').value);
        if (isNaN(start) || isNaN(end) || start > end) {
            validRanges = false;
            break;
        }
        voucherRanges.push(`${start}>${end}`);
    }

    if (!validRanges) {
        errorMessage.textContent = 'Invalid voucher ranges: Ensure start ≤ end and valid numbers.';
        errorMessage.classList.remove('d-none');
        successMessage.classList.add('d-none');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-cogs"></i> Generate Data';
        generateBtn.classList.remove('loading');
        return;
    }

    // Validate dates
    const timeDiff = checkoutDate - checkinDate;
    if (timeDiff <= 0) {
        errorMessage.textContent = 'Check-out date must be after check-in date.';
        errorMessage.classList.remove('d-none');
        successMessage.classList.add('d-none');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-cogs"></i> Generate Data';
        generateBtn.classList.remove('loading');
        return;
    }

    // Clear messages
    errorMessage.classList.add('d-none');
    successMessage.classList.add('d-none');

    // Calculate nights
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Cashier upper
    const cashierUpper = cashier.toUpperCase();

    // Date formatting
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatDateFull = (date) => {
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`;
    };
    const formatDateShort = (date) => {
        const day = date.getDate();
        const month = months[date.getMonth()];
        return `${day}-${month}`;
    };

    const checkinFull = formatDateFull(checkinDate);
    const checkinShort = formatDateShort(checkinDate);
    const checkoutShort = formatDateShort(checkoutDate);

    // Pad room number
    const roomPadded = room.padStart(4, '0');

    // Combine voucher ranges
    const voucherDetails = voucherRanges.join(',');

    // Details for Sheet 2 and System
    let details = `Room ${room} | HCN: ${hcn} | ${name} | V ${voucherDetails} - ${type}`;
    if (notes) details += ` | Notes: ${notes}`;

    // System data
    const systemData = details;

    // Voucher Finance Numbers (Sheet 1)
    let sheet1Data = '';
    const line = `${checkinFull}\t${roomPadded}\t${hcn}\t${name}\t${cashierUpper}\t${typeUpper}`;
    for (let i = 0; i < nights * guests; i++) {
        sheet1Data += line + '\n';
    }

    // Upsell F&B Sheet (Sheet 2)
    const sheet2Data = `${name}\t${meal1}\t${meal2}\t${amount.toFixed(2)}\t${details}\t${checkinShort}\t${checkoutShort}\t${nights}\t${guests}`;

    // Display
    setTimeout(() => {
        document.getElementById('sheet1').value = sheet1Data.trim();
        document.getElementById('sheet2').value = sheet2Data;
        document.getElementById('system').value = systemData;
        outputs.classList.remove('d-none');
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-cogs"></i> Generate Data';
        generateBtn.classList.remove('loading');
        successMessage.textContent = 'Data generated successfully!';
        successMessage.classList.remove('d-none');
        setTimeout(() => {
            successMessage.classList.add('d-none');
        }, 3000);
    }, 800);
});

function copyToClipboard(id) {
    const textarea = document.getElementById(id);
    textarea.select();
    document.execCommand('copy');
    successMessage.textContent = 'Copied to clipboard!';
    successMessage.classList.remove('d-none');
    setTimeout(() => {
        successMessage.classList.add('d-none');
    }, 2000);

}
