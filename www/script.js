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
    calculate();
}

function changeLanguage() {
    const lang = document.getElementById("langSelect").value;
    isArabic = (lang === "ar");
    const container = document.getElementById("mainContainer");
    
    if (isArabic) {
        container.classList.add("rtl");
        document.getElementById("labelTotal").innerText = "التكلفة الإجمالية (ل.س)";
        document.getElementById("labelPaid").innerText = "المبلغ المدفوع ($)";
    } else {
        container.classList.remove("rtl");
        document.getElementById("labelTotal").innerText = "Total Cost (SYP)";
        document.getElementById("labelPaid").innerText = "Customer Paid ($)";
    }
    calculate();
}

function calculate() {
    const totalCost = getRawValue("totalCost");
    const paidUSD = getRawValue("paidUSD");
    
    const marketEl = document.getElementById("marketBuy");
    const marketBuy = marketEl ? parseFloat(marketEl.value.replace(/,/g, '')) : 11400;

    const marginEl = document.getElementById("margin");
    const marginPercent = marginEl ? parseFloat(marginEl.value) : 0;

    const output = document.getElementById("output");
    if (paidUSD === 0 && totalCost === 0) { output.innerHTML = ""; return; }

    const internalBuyRate = marketBuy * (1 - (marginPercent / 100));
    const paidInSYP = paidUSD * internalBuyRate;
    const difference = paidInSYP - totalCost;

    const currency = isArabic ? "ل.س" : "SYP";
    const tRate = isArabic ? "سعر الشراء الداخلي" : "Internal Buy Rate";
    const tPaid = isArabic ? "إجمالي المدفوع (ل.س)" : "Total Paid (SYP)";
    const tReturn = isArabic ? "باقي للزبون" : "Return to customer";
    const tMustPay = isArabic ? "يجب دفع" : "Must pay";
    const tSuccess = isArabic ? "تم الدفع" : "Paid";
    const tDetails = isArabic ? (showDetails ? "إخفاء الإعدادات" : "المزيد من التفاصيل") : (showDetails ? "Hide Settings" : "More Details");
    const tMarginLabel = isArabic ? "الهامش (%)" : "Margin (%)";
    const tMarketLabel = isArabic ? "سعر السوق" : "Market Rate";

    let resultHTML = `
        <div class="total-paid-card">
            <small>${tPaid}</small>
            <span>${formatNumber(paidInSYP)}</span>
        </div>
        
        <button class="details-btn" onclick="toggleDetails()">${tDetails}</button>
        
        <div class="hidden-details" style="display: ${showDetails ? 'block' : 'none'}">
            <p><strong>${tRate}:</strong> ${formatNumber(internalBuyRate)}</p>
            <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
            
            <label>${tMarketLabel}</label>
            <input type="text" id="marketBuy" value="${formatNumber(marketBuy)}" oninput="handleInput(this)" style="font-size: 12px; padding: 5px; margin-bottom: 5px;">

            <label>${tMarginLabel}</label>
            <select id="margin" onchange="calculate()" style="font-size: 12px; padding: 5px;">
                <option value="0" ${marginPercent==0?'selected':''}>0%</option>
                <option value="1" ${marginPercent==1?'selected':''}>1%</option>
                <option value="2" ${marginPercent==2?'selected':''}>2%</option>
                <option value="3" ${marginPercent==3?'selected':''}>3%</option>
                <option value="4" ${marginPercent==4?'selected':''}>4%</option>
                <option value="5" ${marginPercent==5?'selected':''}>5%</option>
            </select>
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

calculate();
