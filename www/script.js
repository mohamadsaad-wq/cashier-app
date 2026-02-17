let isArabic = false;
let showDetails = false;

function formatNumber(number) {
    return Math.round(number).toLocaleString("en-US");
}

function handleInput(input) {
    let value = input.value.replace(/[^0-9.]/g, '');
    let parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    input.value = parts.join('.');
    calculate();
}

function getRawValue(id) {
    const val = document.getElementById(id).value.replace(/,/g, '');
    return parseFloat(val) || 0;
}

function toggleDetails() {
    showDetails = !showDetails;
    calculate();
}

function toggleLanguage() {
    isArabic = !isArabic;
    const container = document.getElementById("mainContainer");
    const langBtn = document.getElementById("langBtn");

    if (isArabic) {
        container.classList.add("rtl");
        document.getElementById("title").innerText = "Currency Calculator";
        document.getElementById("labelTotal").innerText = "التكلفة الإجمالية (ل.س)";
        document.getElementById("labelPaid").innerText = "المبلغ المدفوع ($)";
        document.getElementById("labelRate").innerText = "سعر السوق";
        document.getElementById("labelMargin").innerText = "الهامش";
        langBtn.innerText = "English";
    } else {
        container.classList.remove("rtl");
        document.getElementById("title").innerText = "Cashier Currency Calculator";
        document.getElementById("labelTotal").innerText = "Total Cost (SYP)";
        document.getElementById("labelPaid").innerText = "Customer Paid ($)";
        document.getElementById("labelRate").innerText = "Market Buy Rate";
        document.getElementById("labelMargin").innerText = "Margin";
        langBtn.innerText = "العربية";
    }
    calculate();
}

function calculate() {
    const totalCost = getRawValue("totalCost");
    const paidUSD = getRawValue("paidUSD");
    const marketBuy = getRawValue("marketBuy");
    const marginPercent = parseFloat(document.getElementById("margin").value);
    const output = document.getElementById("output");

    if (marketBuy === 0) { output.innerHTML = ""; return; }

    const internalBuyRate = marketBuy * (1 - (marginPercent / 100));
    const paidInSYP = paidUSD * internalBuyRate;
    const difference = paidInSYP - totalCost;

    const tRate = isArabic ? "سعر الشراء الداخلي" : "Internal Buy Rate";
    const tPaid = isArabic ? "إجمالي المدفوع (ل.س)" : "Total Paid (SYP)";
    const tReturn = isArabic ? "باقي للزبون" : "Return to customer";
    const tMustPay = isArabic ? "يجب على الزبون دفع" : "Customer must pay";
    const tSuccess = isArabic ? "تم دفع كامل المبلغ" : "Payment completed";
    const tDetails = isArabic ? (showDetails ? "إخفاء التفاصيل" : "المزيد من التفاصيل") : (showDetails ? "Hide Details" : "More Details");
    const currency = isArabic ? "ل.س" : "SYP";

    let resultHTML = `
        <div class="total-paid-card">
            <small>${tPaid}</small>
            <span>${formatNumber(paidInSYP)}</span>
        </div>
        
        <button class="details-btn" onclick="toggleDetails()">${tDetails}</button>
        <div class="hidden-details" style="display: ${showDetails ? 'block' : 'none'}">
            <strong>${tRate}:</strong> ${formatNumber(internalBuyRate)}
        </div>
    `;

    if (difference > 0) {
        resultHTML += `<div class="result info">${tReturn}: ${formatNumber(difference)} ${currency}</div>`;
    } else if (difference < 0) {
        resultHTML += `<div class="result danger">${tMustPay}: ${formatNumber(Math.abs(difference))} ${currency}</div>`;
    } else if (totalCost > 0) {
        resultHTML += `<div class="result success">${tSuccess}</div>`;
    }

    output.innerHTML = resultHTML;
}
