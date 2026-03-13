// CONFIGURATION
const ADMIN_PIN = "0468"; 
let isArabic = true;
let isAdmin = false;

function loadSettings() {
    const savedMarket = localStorage.getItem("marketBuy") || "11,400";
    const savedReal = localStorage.getItem("realRate") || "11,500";
    const savedMargin = localStorage.getItem("margin") || "0";
    
    document.getElementById("marketBuy").value = savedMarket;
    document.getElementById("marketViewOnly").value = savedMarket; // For Cashier
    document.getElementById("realRate").value = savedReal;
    document.getElementById("margin").value = savedMargin;
}

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

function tryAccessAdmin() {
    if (isAdmin) {
        isAdmin = false;
        document.getElementById("adminPanel").style.display = "none";
        document.getElementById("btnDetails").innerText = isArabic ? "إعدادات الإدارة (PIN)" : "Admin Settings (PIN)";
    } else {
        const pin = prompt(isArabic ? "أدخل رمز الأمان (PIN):" : "Enter Admin PIN:");
        if (pin === ADMIN_PIN) {
            isAdmin = true;
            document.getElementById("adminPanel").style.display = "block";
            document.getElementById("btnDetails").innerText = isArabic ? "قفل الإعدادات" : "Lock Settings";
            calculate();
        } else if (pin !== null) {
            alert(isArabic ? "رمز خاطئ!" : "Incorrect PIN!");
        }
    }
}

function resetAll() {
    document.getElementById("totalCost").value = "";
    document.getElementById("paidUSD").value = "";
    calculate();
}

function changeLanguage() {
    const lang = document.getElementById("langSelect").value;
    isArabic = (lang === "ar");
    const container = document.getElementById("mainContainer");
    
    if (isArabic) container.classList.add("rtl"); 
    else container.classList.remove("rtl");

    document.getElementById("labelTotal").innerText = isArabic ? "التكلفة الإجمالية (ل.س)" : "Total Cost (SYP)";
    document.getElementById("labelPaid").innerText = isArabic ? "المبلغ المدفوع ($)" : "Customer Paid ($)";
    document.getElementById("labelMarketView").innerText = isArabic ? "سعر الصرف المعتمد حالياً" : "Current Market Rate";
    document.getElementById("labelMarketEdit").innerText = isArabic ? "تعديل سعر السوق" : "Edit Market Rate";
    document.getElementById("labelReal").innerText = isArabic ? "سعر الصرف الحقيقي (خفي)" : "Real Street Rate (Hidden)";
    document.getElementById("labelMargin").innerText = isArabic ? "الهامش (%)" : "Margin (%)";
    document.getElementById("labelInternal").innerText = isArabic ? "سعر الشراء الداخلي:" : "Internal Buy Rate:";
    document.getElementById("labelProfit").innerText = isArabic ? "ربح الصرافة:" : "Exchange Profit:";
    
    calculate();
}

function calculate() {
    const totalCost = getRawValue("totalCost");
    const paidUSD = getRawValue("paidUSD");
    const marketBuy = getRawValue("marketBuy");
    const realRate = getRawValue("realRate");
    const marginPercent = parseFloat(document.getElementById("margin").value);

    // Update Ghost field for Cashier
    document.getElementById("marketViewOnly").value = document.getElementById("marketBuy").value;

    localStorage.setItem("marketBuy", document.getElementById("marketBuy").value);
    localStorage.setItem("realRate", document.getElementById("realRate").value);
    localStorage.setItem("margin", document.getElementById("margin").value);

    const internalBuyRate = marketBuy * (1 - (marginPercent / 100));
    const paidInSYP = paidUSD * internalBuyRate;
    const difference = paidInSYP - totalCost;
    const exchangeProfit = (paidUSD * realRate) - paidInSYP;

    document.getElementById("internalValue").innerText = formatNumber(internalBuyRate);
    document.getElementById("profitValue").innerText = formatNumber(exchangeProfit) + (isArabic ? " ل.س" : " SYP");

    const changeArea = document.getElementById("changeArea");
    const totalPaidArea = document.getElementById("totalPaidArea");

    if (paidUSD === 0 && totalCost === 0) {
        changeArea.innerHTML = ""; totalPaidArea.innerHTML = ""; return;
    }

    const currency = isArabic ? "ل.س" : "SYP";
    if (difference > 0) {
        changeArea.innerHTML = `<div class="result info">${isArabic ? "باقي للزبون" : "Return"}: ${formatNumber(difference)} ${currency}</div>`;
    } else if (difference < 0) {
        changeArea.innerHTML = `<div class="result danger">${isArabic ? "يجب دفع" : "Must pay"}: ${formatNumber(Math.abs(difference))} ${currency}</div>`;
    } else if (totalCost > 0) {
        changeArea.innerHTML = `<div class="result success">${isArabic ? "تم الدفع" : "Paid"}</div>`;
    }

    totalPaidArea.innerHTML = `
        <div class="total-paid-card">
            <small>${isArabic ? "إجمالي المدفوع (ل.س)" : "Total Paid (SYP)"}</small>
            <span>${formatNumber(paidInSYP)}</span>
        </div>`;
}

loadSettings();
calculate();
