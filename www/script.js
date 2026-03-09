let isArabic = true;
let showDetails = false;

function formatNumber(number) {
    if (isNaN(number)) return "0";
    return Math.round(number).toLocaleString("en-US");
}

function handleInput(input) {
    let selection = input.selectionStart;
    let oldLen = input.value.length;

    let value = input.value.replace(/[^0-9.]/g, '');
    let parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    input.value = parts.join('.');
    
    let newLen = input.value.length;
    input.setSelectionRange(selection + (newLen - oldLen), selection + (newLen - oldLen));
    
    calculate();
}

function getRawValue(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value.replace(/,/g, '')) || 0 : 0;
}

function toggleDetails() {
    showDetails = !showDetails;
    const area = document.getElementById("settingsArea");
    const btn = document.getElementById("btnDetails");
    area.style.display = showDetails ? 'block' : 'none';
    btn.innerText = isArabic ? 
        (showDetails ? "إخفاء الإعدادات" : "المزيد من التفاصيل") : 
        (showDetails ? "Hide Settings" : "More Details");
}

function changeLanguage() {
    const lang = document.getElementById("langSelect").value;
    isArabic = (lang === "ar");
    const container = document.getElementById("mainContainer");
    
    const labels = {
        total: isArabic ? "التكلفة الإجمالية (ل.س)" : "Total Cost (SYP)",
        paid: isArabic ? "المبلغ المدفوع ($)" : "Customer Paid ($)",
        market: isArabic ? "سعر السوق" : "Market Rate",
        margin: isArabic ? "الهامش (%)" : "Margin (%)",
        internal: isArabic ? "سعر الشراء الداخلي:" : "Internal Buy Rate:",
        btn: showDetails ? 
            (isArabic ? "إخفاء الإعدادات" : "Hide Settings") : 
            (isArabic ? "المزيد من التفاصيل" : "More Details")
    };

    if (isArabic) container.classList.add("rtl");
    else container.classList.remove("rtl");

    document.getElementById("labelTotal").innerText = labels.total;
    document.getElementById("labelPaid").innerText = labels.paid;
    document.getElementById("labelMarket").innerText = labels.market;
    document.getElementById("labelMargin").innerText = labels.margin;
    document.getElementById("labelInternal").innerText = labels.internal;
    document.getElementById("btnDetails").innerText = labels.btn;

    calculate();
}

function calculate() {
    const totalCost = getRawValue("totalCost");
    const paidUSD = getRawValue("paidUSD");
    const marketBuy = getRawValue("marketBuy") || 11400;
    const marginPercent = parseFloat(document.getElementById("margin").value) || 0;

    const internalBuyRate = marketBuy * (1 - (marginPercent / 100));
    const paidInSYP = paidUSD * internalBuyRate;
    const difference = paidInSYP - totalCost;

    const currency = isArabic ? "ل.س" : "SYP";
    
    // Update Internal Rate text
    document.getElementById("internalValue").innerText = formatNumber(internalBuyRate);

    // Update Result Areas
    const changeArea = document.getElementById("changeArea");
    const totalPaidArea = document.getElementById("totalPaidArea");

    if (paidUSD === 0 && totalCost === 0) {
        changeArea.innerHTML = "";
        totalPaidArea.innerHTML = "";
        return;
    }

    // 1. Total Paid Area
    totalPaidArea.innerHTML = `
        <div class="total-paid-card">
            <small>${isArabic ? "إجمالي المدفوع (ل.س)" : "Total Paid (SYP)"}</small>
            <span>${formatNumber(paidInSYP)}</span>
        </div>`;

    // 2. Change Area (Now above total paid)
    if (difference > 0) {
        changeArea.innerHTML = `<div class="result info">${isArabic ? "باقي للزبون" : "Return"}: ${formatNumber(difference)} ${currency}</div>`;
    } else if (difference < 0) {
        changeArea.innerHTML = `<div class="result danger">${isArabic ? "يجب دفع" : "Must pay"}: ${formatNumber(Math.abs(difference))} ${currency}</div>`;
    } else if (totalCost > 0) {
        changeArea.innerHTML = `<div class="result success">${isArabic ? "تم الدفع" : "Paid"}</div>`;
    } else {
        changeArea.innerHTML = "";
    }
}

// Init
calculate();
