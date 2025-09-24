// --- Dark Mode Schalter ---
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Funktion zum Setzen des Themes
const applyTheme = (theme) => {
    if (theme === 'dark') {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    }
};

// Event-Listener für den Button
darkModeToggle.addEventListener('click', () => {
    const isDarkMode = body.classList.contains('dark-mode');
    const newTheme = isDarkMode ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
});

// Initiales Theme beim Laden der Seite setzen
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
    showPage('saved'); // Geändert: Startseite ist jetzt 'saved'
});


// --- Grundfunktionen ---
function format(n){return Number(n||0).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})}
function toNum(v){return parseFloat(String(v).replace(",", "."))||0}

// --- SEITENNAVIGATION ---
const pageInvoices = document.getElementById('pageInvoices');
const pageSavedInvoices = document.getElementById('pageSavedInvoices');
const pageCustomers = document.getElementById('pageCustomers');
const navButtons = {
  invoices: document.getElementById('navInvoices'),
  saved: document.getElementById('navSavedInvoices'),
  customers: document.getElementById('navCustomers'),
};

function showPage(pageId) {
  // Verstecke alle Seiten
  if(pageInvoices) pageInvoices.style.display = 'none';
  if(pageSavedInvoices) pageSavedInvoices.style.display = 'none';
  if(pageCustomers) pageCustomers.style.display = 'none';

  // Zeige die ausgewählte Seite an
  if (pageId === 'saved' && pageSavedInvoices) {
    pageSavedInvoices.style.display = 'flex'; // Use flex for new layout
    renderSavedInvoices();
  } else if (pageId === 'customers' && pageCustomers) {
    pageCustomers.style.display = 'flex'; // Use flex for new layout
    renderCustomerList();
  } else { // Standardfall ist 'invoices'
    if(pageInvoices) pageInvoices.style.display = 'flex'; // Use flex for new layout
  }
}
if(navButtons.invoices) navButtons.invoices.onclick = () => showPage('invoices');
if(navButtons.saved) navButtons.saved.onclick = () => showPage('saved');
if(navButtons.customers) navButtons.customers.onclick = () => showPage('customers');

const selectCustomerBtn = document.getElementById('selectCustomerBtn');
if(selectCustomerBtn) selectCustomerBtn.onclick = () => showPage('customers');


// Element-Referenzen
const invoiceNumberEl = document.getElementById('invoiceNumber')
const invoiceDateEl = document.getElementById('invoiceDate')
const logoInput = document.getElementById('logoInput')
const previewEl = document.getElementById('preview')
const downloadPDFBtn = document.getElementById('downloadPDF')
const addPassengerBtn = document.getElementById('addPassenger')
const passengerBody = document.getElementById('passengerBody')
const addOutboundBtn = document.getElementById('addOutbound')
const outboundBody = document.getElementById('outboundBody')
const addReturnSectionBtn = document.getElementById('addReturnSection')
const returnSectionContainer = document.getElementById('returnSectionContainer')
const addItemBtn = document.getElementById('addItem')
const itemsBody = document.getElementById('itemsBody')
const addQuickBtn = document.getElementById('addQuick')
const quickOption = document.getElementById('quickOption')
const saveInvoiceBtn = document.getElementById('saveInvoice')
const bgToggle = document.getElementById('bgToggle')
const bgSize = document.getElementById('bgSize')
const bgOpacity = document.getElementById('bgOpacity')
const bgColor = document.getElementById('bgColor')
const bgColorOpacity = document.getElementById('bgColorOpacity')
const clearBgBtn = document.getElementById('clearBg')
const enableSequence = document.getElementById('enableSequence')
const sequencePrefix = document.getElementById('sequencePrefix')
const sequenceStart = document.getElementById('sequenceStart')
const resetSequenceBtn = document.getElementById('resetSequence')
const headingColorEl = document.getElementById('headingColor');
const updatePreviewBtn = document.getElementById('updatePreviewBtn');

// NEUE ELEMENT-REFERENZEN FÜR RECHNUNGSVERWALTUNG
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const periodFilter = document.getElementById('periodFilter');
const sortInvoices = document.getElementById('sortInvoices');
const savedInvoicesBody = document.getElementById('savedInvoicesBody');
const totalRevenueAllEl = document.getElementById('totalRevenueAll');
const totalRevenuePaidEl = document.getElementById('totalRevenuePaid');
const totalRevenueUnpaidEl = document.getElementById('totalRevenueUnpaid');


// Sequenz-Steuerung
function getSequenceState(){
  const s = JSON.parse(localStorage.getItem('invoiceSequence')||'null')
  return s || {prefix: sequencePrefix.value || 'U2025-', next: Number(sequenceStart.value)||1}
}
function saveSequenceState(state){ localStorage.setItem('invoiceSequence', JSON.stringify(state)) }
function nextInvoiceNumber(){
  const state = getSequenceState()
  const num = state.next
  state.next = num + 1
  saveSequenceState(state)
  return (state.prefix || 'U2025-') + num
}
if(resetSequenceBtn) resetSequenceBtn.onclick = ()=>{
  const start = Number(sequenceStart.value) || 1
  const pref = sequencePrefix.value || 'U2025-'
  saveSequenceState({prefix: pref, next: start})
  alert('Sequenz auf ' + pref + start + ' gesetzt')
}

// Initiales Rechnungsnummer- und Datumsverhalten
;(function initInvoiceNumberAndDate(){
  if (!invoiceNumberEl || !invoiceDateEl) return;
  const seqState = JSON.parse(localStorage.getItem('invoiceSequence')||'null')
  if(seqState) {
    if(sequencePrefix) sequencePrefix.value = seqState.prefix || sequencePrefix.value;
    if(sequenceStart) sequenceStart.value = seqState.next || sequenceStart.value;
  }
  if(enableSequence && enableSequence.checked){
    invoiceNumberEl.value = nextInvoiceNumber()
  } else {
    invoiceNumberEl.value = "R-"+Date.now().toString().slice(-6)
  }
  invoiceDateEl.value = new Date().toISOString().split('T')[0]
})()

// Logo handling
let logoData = ''; // Global variable to store logo data
if(logoInput) logoInput.addEventListener('change',function(e){
  const file = e.target.files[0]
  if(file){
    const reader=new FileReader()
    reader.onload=function(ev){ logoData=ev.target.result; applyBackgroundSettings(); updatePreview() }
    reader.readAsDataURL(file)
  }
})

// --- Hintergrund & Design-Einstellungen ---
function applyBackgroundSettings() {
    if (!previewEl) return;
    function hexToRgb(hex) {
        const h = hex.replace('#', '');
        return { r: parseInt(h.substring(0, 2), 16), g: parseInt(h.substring(2, 4), 16), b: parseInt(h.substring(4, 6), 16) };
    }
    function hexToRgba(hex, a) {
        const c = hexToRgb(hex);
        return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
    }
    
    if (logoData && bgToggle && bgToggle.checked) {
        previewEl.style.setProperty('--logo-image-url', `url(${logoData})`);
        previewEl.style.setProperty('--logo-size', `${bgSize.value}%`);
        previewEl.style.setProperty('--logo-opacity', bgOpacity.value);
    } else {
        previewEl.style.setProperty('--logo-image-url', 'none');
        previewEl.style.setProperty('--logo-opacity', '0');
    }
    
    const overlayOpacity = parseFloat(bgColorOpacity.value) || 0;
    previewEl.style.backgroundColor = hexToRgba(bgColor.value, overlayOpacity);
    previewEl.style.setProperty('--heading-color', headingColorEl.value);
}

// Event Listeners für Design-Steuerung
if(bgToggle) bgToggle.onchange = ()=>{ applyBackgroundSettings(); updatePreview() }
if(bgSize) bgSize.oninput = ()=>{ applyBackgroundSettings() }
if(bgOpacity) bgOpacity.oninput = ()=>{ applyBackgroundSettings() }
if(bgColor) bgColor.oninput = ()=>{ applyBackgroundSettings() }
if(bgColorOpacity) bgColorOpacity.oninput = ()=>{ applyBackgroundSettings() }
if(headingColorEl) headingColorEl.oninput = ()=>{ applyBackgroundSettings(); updatePreview() };

if(clearBgBtn) clearBgBtn.onclick = ()=>{
  bgToggle.checked = false; bgSize.value = 100; bgOpacity.value = 0.15;
  bgColor.value = '#ffffff'; bgColorOpacity.value = 0.85;
  headingColorEl.value = '#0277bd';
  applyBackgroundSettings(); updatePreview();
}

// Passagiere
function updateBaggageWeightInputs(inputElement, weights = []) {
    const count = parseInt(inputElement.value, 10) || 0;
    const container = inputElement.parentElement.querySelector('.bag-weights');
    container.innerHTML = '';
    if (count > 0 && count <= 5) {
        let options = '';
        for (let i = 0; i <= 1000; i++) {
            options += `<option value="${i}">${i} kg</option>`;
        }
        for (let i = 1; i <= count; i++) {
            const weightValue = weights[i - 1] || '23';
            const div = document.createElement('div');
            div.style = "display: flex; align-items: center; gap: 8px; margin-bottom: 4px;";
            div.innerHTML = `
                <label style="font-size: 0.75rem; margin-bottom: 0; white-space: nowrap;">Gepäck #${i}:</label>
                <select class="bag-weight">${options}</select>
            `;
            container.appendChild(div);
            const select = div.querySelector('select');
            select.value = weightValue;
            select.oninput = updatePreview;
        }
    }
}
function addPassenger(name='',dob='', baggage={count: 0, weights: []}){
  if(!passengerBody) return;
  const tr=document.createElement('tr')
  tr.innerHTML=`<td><input class="pname" value="${escapeHtml(name)}"></td>
  <td><input class="pdob" type="date" value="${dob}"></td>
  <td class="baggage-cell">
   <label style="font-size: 0.75rem; margin-bottom: 4px;">Anzahl</label>
   <input type="number" min="0" max="5" class="bag-count" value="${baggage.count || 0}" style="width: 60px; padding: 4px; margin-bottom: 8px;">
   <div class="bag-weights"></div>
  </td>
  <td><button class="btn btn-icon danger remove"><i data-lucide="trash-2"></i></button></td>`
  tr.querySelector('.remove').onclick=()=>{tr.remove();updatePreview()}
  tr.querySelectorAll('input').forEach(i=>i.oninput=updatePreview)
  
  const bagCountInput = tr.querySelector('.bag-count');
  bagCountInput.oninput = (e) => {
      updateBaggageWeightInputs(e.target);
      updatePreview();
  };
  
  passengerBody.appendChild(tr);
  updateBaggageWeightInputs(bagCountInput, baggage.weights);
  if (window.lucide) window.lucide.createIcons();
  updatePreview();
}
if(addPassengerBtn) addPassengerBtn.onclick=()=>addPassenger()

// Flugzeilen
function addFlightRow(bodyEl,fromCity='',toCity='',depDate='',depTime='',arrDate='',arrTime='',airline='',pnr='', duration=''){
  const container = document.getElementById(bodyEl);
  if(!container) return;
  const tr_header = document.createElement('tr');
  const tr_details = document.createElement('tr');
  tr_details.className = 'flight-details-row';

  tr_header.innerHTML = `<td colspan="3" style="padding-bottom:0;"><label style="margin-bottom:0;">Fluggesellschaft / Flugnr.<input class="airline" value="${escapeHtml(airline)}" placeholder="z. B. Lufthansa LH123"></label></td>
                         <td colspan="3" style="padding-bottom:0;"><label style="margin-bottom:0;">PNR<input class="pnr" value="${escapeHtml(pnr)}" placeholder="Buchungscode"></label></td>`;
  tr_details.innerHTML=`<td><input class="fromCity" value="${escapeHtml(fromCity)}"></td>
  <td><input class="toCity" value="${escapeHtml(toCity)}"></td>
  <td><input type="date" class="depDate" value="${depDate}"><br><input type="time" class="depTime" value="${depTime}"></td>
  <td><input type="date" class="arrDate" value="${arrDate}"><br><input type="time" class="arrTime" value="${arrTime}"></td>
  <td><input class="duration-input" value="${escapeHtml(duration)}" style="width: 80px;"></td>
  <td><button class="btn btn-icon danger remove"><i data-lucide="trash-2"></i></button></td>`;
  
  tr_details.querySelector('.remove').onclick=()=>{ tr_header.remove(); tr_details.remove(); updatePreview(); }
  tr_header.querySelectorAll('input').forEach(i => i.oninput = updatePreview);
  tr_details.querySelectorAll('input').forEach(i=>i.oninput=updatePreview);

  container.appendChild(tr_header); container.appendChild(tr_details);
  if (window.lucide) window.lucide.createIcons();
  updatePreview();
}
if(addOutboundBtn) addOutboundBtn.onclick=()=>addFlightRow('outboundBody')

// Rückflug-Option
if(addReturnSectionBtn) addReturnSectionBtn.onclick=()=>{
  if(document.getElementById('returnSection') || !returnSectionContainer) return;
  const div=document.createElement('div')
  div.id="returnSection"
  div.className = "card-content"
  div.innerHTML=`<h4>Rückflug</h4>
    <div class="form-group">
        <label for="totalReturnDuration">Gesamte Reisedauer (Rückflug)</label>
        <input id="totalReturnDuration" placeholder="Wird automatisch berechnet, kann aber überschrieben werden">
    </div>
    <div class="table-wrapper">
    <table id="returnTable">
        <thead><tr><th>Von (Abflugort)</th><th>Nach (Ankunftsort)</th><th>Abflug</th><th>Ankunft</th><th>Dauer</th><th></th></tr></thead>
        <tbody id="returnBody"></tbody>
    </table>
    </div>
    <div class="card-actions">
        <button class="btn btn-secondary" id="addReturn"><i data-lucide="plus"></i>Rückflug hinzufügen</button>
        <button class="btn btn-text danger" id="removeReturnSection">Rückflug-Option entfernen</button>
    </div>`
  
  returnSectionContainer.innerHTML = '';
  returnSectionContainer.appendChild(div);

  document.getElementById('addReturn').onclick=()=>addFlightRow('returnBody')
  document.getElementById('removeReturnSection').onclick=()=>{
      div.remove();
      returnSectionContainer.innerHTML = `<button class="btn btn-text" id="addReturnSection"><i data-lucide="corner-down-left"></i>Rückflug-Option hinzufügen</button>`;
      document.getElementById('addReturnSection').onclick = addReturnSectionBtn.onclick;
      if (window.lucide) window.lucide.createIcons();
      updatePreview();
  }
  if (window.lucide) window.lucide.createIcons();
}

// Leistungen
function addItem(desc='',qty=1,price=0, option=''){
  if(!itemsBody) return;
  const tr=document.createElement('tr')
  tr.innerHTML=`<td><select class="opt"><option value="">--Option--</option><option value="Hotel" ${option==='Hotel'?'selected':''}>Hotel</option><option value="Flugticket" ${option==='Flugticket'?'selected':''}>Flugticket</option><option value="Gebäck" ${option==='Gebäck'?'selected':''}>Gebäck</option><option value="Sonstige" ${option==='Sonstige'?'selected':''}>Sonstige</option></select></td>
    <td><input class="desc" value="${escapeHtml(desc)}" placeholder="z.B. Hotel 7 Nächte"></td>
    <td><input class="qty center" type="number" value="${qty}"></td>
    <td><input class="price center" type="number" step="0.01" value="${price}"></td>
    <td class="line center">0.00</td><td><button class="btn btn-icon danger remove"><i data-lucide="trash-2"></i></button></td>`
  tr.querySelector('.remove').onclick=()=>{tr.remove();updatePreview()}
  tr.querySelectorAll('input,select').forEach(i=>i.oninput=updatePreview)
  itemsBody.appendChild(tr)
  if (window.lucide) window.lucide.createIcons();
  updatePreview()
}
if(addItemBtn) addItemBtn.onclick=()=>addItem()
if(addQuickBtn) addQuickBtn.onclick=()=>{
  const opt = quickOption.options[quickOption.selectedIndex]
  if(opt && opt.dataset && opt.dataset.desc){
    addItem(opt.dataset.desc,1,0, opt.textContent.split(' ')[0])
    quickOption.selectedIndex = 0
  }
}

// Sammeln Flugdaten
function collectFlights(bodyId){
  return [...document.querySelectorAll(`#${bodyId} tr.flight-details-row`)].map(r=>{
    const headerRow = r.previousElementSibling;
    const airline = headerRow ? headerRow.querySelector('.airline').value : '';
    const pnr = headerRow ? headerRow.querySelector('.pnr').value : '';
    const fromCity=r.querySelector('.fromCity').value, toCity=r.querySelector('.toCity').value
    const dd=r.querySelector('.depDate').value, dt=r.querySelector('.depTime').value
    const ad=r.querySelector('.arrDate').value, at=r.querySelector('.arrTime').value
    const dur=r.querySelector('.duration-input').value;
    return {fromCity,toCity,airline,pnr,depDate:dd,depTime:dt,arrDate:ad,arrTime:at,duration:dur}
  })
}

// Vorschau
function updatePreview(){
  if (!previewEl) return;
  
  const layoverValues = {};
  ['outboundBody', 'returnBody'].forEach(bodyId => {
      layoverValues[bodyId] = [];
      document.querySelectorAll(`#${bodyId} .layover-input`).forEach(input => {
          layoverValues[bodyId].push(input.value);
      });
  });

  document.querySelectorAll('.layover-row-form').forEach(row => row.remove());
  ['outboundBody', 'returnBody'].forEach(bodyId => {
      const flightRows = [...document.querySelectorAll(`#${bodyId} .flight-details-row`)];
      let layoverIndex = 0;
      for (let i = 0; i < flightRows.length - 1; i++) {
          const currentRow = flightRows[i];
          const nextRow = flightRows[i + 1];
          const arrDate = currentRow.querySelector('.arrDate').value, arrTime = currentRow.querySelector('.arrTime').value;
          const depDate = nextRow.querySelector('.depDate').value, depTime = nextRow.querySelector('.depTime').value;
          const layoverCity = currentRow.querySelector('.toCity').value;

          if (arrDate && arrTime && depDate && depTime) {
              const newRow = document.createElement('tr');
              newRow.className = 'layover-row-form';
              const existingValue = (layoverValues[bodyId] && layoverValues[bodyId][layoverIndex]) || '';
              newRow.innerHTML = `<td colspan="5" style="text-align: right; background-color: rgba(0,0,0,0.05);">Umsteigezeit in ${escapeHtml(layoverCity)}: <input class="layover-input" value="${existingValue}" placeholder="z.B. 2h 30m" style="width: 120px;"></td><td></td>`;
              currentRow.after(newRow);
              newRow.querySelector('input').oninput = updatePreview;
              layoverIndex++;
          }
      }
  });

  const number=invoiceNumberEl.value, date=invoiceDateEl.value
  const from=document.getElementById('from').value
  const to=document.getElementById('to').value
  const customerEmail = document.getElementById('customerEmail').value;
  const customerPhone = document.getElementById('customerPhone').value;
  
  let toBlock = escapeHtml(to);
  if (customerEmail) toBlock += `\n${escapeHtml(customerEmail)}`;
  if (customerPhone) toBlock += `\n${escapeHtml(customerPhone)}`;

  const note=document.getElementById('note').value
  const payment=document.getElementById('payment').value.replace("Rechnungsnummer", number)
  let netto=0
  const passengers=[...document.querySelectorAll('#passengerBody tr')].map(r=>{
    const name = r.querySelector('.pname').value;
    const dob = r.querySelector('.pdob').value;
    const bagCount = parseInt(r.querySelector('.bag-count').value, 10) || 0;
    let baggageInfo = '';
    if (bagCount > 0) {
        const weights = [...r.querySelectorAll('.bag-weight')].map(sel => sel.value + ' kg').join(', ');
        baggageInfo = `<br><small style="color: #555;">Gepäck: ${bagCount} Stk (${weights})</small>`;
    }
    return `<li>${escapeHtml(name)} (${dob})${baggageInfo}</li>`;
  }).join("")
  const outboundFlights=collectFlights('outboundBody')
  const returnFlights=document.getElementById('returnBody') ? collectFlights('returnBody') : []
  applyBackgroundSettings()

  function renderFlights(title, flights) {
    if (flights.length === 0) return "";
    let rowsHtml = "";
    for (let i = 0; i < flights.length; i++) {
        const f = flights[i];
        if (f.airline || f.pnr) { rowsHtml += `<tr class="layover-row" style="text-align:left; font-style:normal;"><td colspan="5" style="padding: 6px 8px;"><b>${escapeHtml(f.airline || "")}</b> ${f.pnr ? `— PNR: ${escapeHtml(f.pnr)}` : ""}</td></tr>`; }
        rowsHtml += `<tr><td>${escapeHtml(f.fromCity)}</td><td>${escapeHtml(f.toCity)}</td><td>${f.depDate} ${f.depTime}</td><td>${f.arrDate} ${f.arrTime}</td><td>${f.duration}</td></tr>`;
        if (i < flights.length - 1) {
            const nextFlight = flights[i + 1];
            if (f.arrDate && f.arrTime && nextFlight.depDate && nextFlight.depTime) {
                const bodyId = title === "Hinflug" ? "outboundBody" : "returnBody";
                const layoverInput = document.querySelectorAll(`#${bodyId} .layover-input`)[i];
                const layoverDuration = layoverInput ? layoverInput.value : '';
                if (layoverDuration) {
                    rowsHtml += `<tr class="layover-row"><td colspan="5" style="text-align: right;">Umsteigezeit in ${escapeHtml(f.toCity)}: ${escapeHtml(layoverDuration)}</td></tr>`;
                }
            }
        }
    }
    let totalDurationForPreview = '';
    if (title === "Hinflug" && document.getElementById('totalOutboundDuration')) {
        totalDurationForPreview = document.getElementById('totalOutboundDuration').value;
    } else if (title === "Rückflug" && document.getElementById('totalReturnDuration')) {
        totalDurationForPreview = document.getElementById('totalReturnDuration').value;
    }
    const totalDurationHtml = totalDurationForPreview ? `<p style="text-align: right; font-weight: bold; margin-top: 10px;">Gesamte Reisedauer: ${escapeHtml(totalDurationForPreview)}</p>` : '';
    return `<h3 class="flight-heading">${title}</h3><table><thead><tr><th>Von</th><th>Nach</th><th>Abflug</th><th>Ankunft</th><th>Dauer</th></tr></thead><tbody>${rowsHtml}</tbody></table>${totalDurationHtml}`;
  }

  const items=[...document.querySelectorAll('#itemsBody tr')].map(r=>{
    const d=r.querySelector('.desc').value, q=toNum(r.querySelector('.qty').value), p=toNum(r.querySelector('.price').value)
    const line=q*p; netto+=line; r.querySelector('.line').textContent=format(line)
    const opt = r.querySelector('.opt').value
    return `<tr><td>${escapeHtml(opt)}</td><td>${escapeHtml(d)}</td><td class="center">${q}</td><td class="center">${format(p)}</td><td class="center">${format(line)}</td></tr>`
  }).join("")

  previewEl.innerHTML=`
    <div class="pdf-block invoice-header">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap: wrap; gap: 20px;">
          <div>
            ${logoData ? `<img class="logo" src="${logoData}" alt="Logo" />` : ""}
            <pre style="font-family: inherit; margin: 0;">${escapeHtml(from)}</pre>
          </div>
          <div style="text-align:right">
            <h2>Rechnung Nr. ${escapeHtml(number)}</h2>
            <p><b>Datum:</b> ${escapeHtml(date)}</p>
            <h3>Rechnung an:</h3>
            <pre style="font-family: inherit; margin: 0;">${toBlock}</pre>
          </div>
        </div>
    </div>
    <div class="pdf-block invoice-passengers">
        <h3>Passagiere</h3>
        <ul>${passengers}</ul>
    </div>
    <div class="pdf-block invoice-outbound">
        ${renderFlights("Hinflug",outboundFlights)}
    </div>
    <div class="pdf-block invoice-return">
        ${renderFlights("Rückflug",returnFlights)}
    </div>
    <div class="pdf-block invoice-payment-block">
        <h3>Weitere Leistungen</h3>
        <table>
          <thead><tr><th>Option</th><th>Beschreibung</th><th class="center">Menge</th><th class="center">Preis (€ / Stück)</th><th class="center">Gesamt (€)</th></tr></thead>
          <tbody>${items}</tbody>
          <tfoot><tr class="total-row"><td colspan="4" style="text-align:right; padding-right: 20px;">Gesamtsumme</td><td class="center">${format(netto)} €</td></tr></tfoot>
        </table>
        <p style="margin-top:20px;font-size:13px;color:#555">Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>
        ${note ? `<h3>Notiz</h3><p>${escapeHtml(note).replace(/\n/g,"<br>")}</p>` : ""}
        ${payment ? `<h3>Zahlungsinformationen</h3><p>${escapeHtml(payment).replace(/\n/g,"<br>")}</p>` : ""}
    </div>
    <div class="pdf-block" style="border-top: 1px solid #ccc; margin-top: 40px; padding-top: 10px; text-align: center; font-size: 0.8rem; color: #555;">
        Email: urlaubsde@gmail.com | Telefon: +4917664957576
    </div>`;
}

// Event-Listener für den neuen Aktualisierungsbutton
if (updatePreviewBtn) {
    updatePreviewBtn.onclick = updatePreview;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('pageInvoices')) {
    addPassenger("Max Mustermann","1985-05-10");
    addPassenger("Erika Mustermann","1987-07-21");
    addFlightRow('outboundBody',"Hamburg","Rom","2025-09-12","08:15","2025-09-12","11:05", "Lufthansa LH24", "ABCDE1");
    addItem("Hotel 7 Nächte",1,560);
    updatePreview();
  }
});

// PDF EXPORT
if (downloadPDFBtn) downloadPDFBtn.onclick = async () => {
    saveInvoice();
    updatePreview();
    
    // Warten Sie einen kurzen Moment, damit das DOM nach `updatePreview` vollständig aktualisiert ist
    await new Promise(resolve => setTimeout(resolve, 100));

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    const margin = 15;
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pdfWidth - margin * 2;
    let y = margin;

    const addWatermark = (pdfInstance) => {
        if (logoData && bgToggle.checked) {
            const opacity = parseFloat(bgOpacity.value) || 0.1;
            const size = parseFloat(bgSize.value) || 100;
            const imgWidth = pdfWidth * (size / 100);
            const imgHeight = imgWidth;
            const x = (pdfWidth - imgWidth) / 2;
            const y_pos = (pdfHeight - imgHeight) / 2;
            pdfInstance.setGState(new pdfInstance.GState({ opacity: opacity }));
            pdfInstance.addImage(logoData, 'PNG', x, y_pos, imgWidth, imgHeight);
            pdfInstance.setGState(new pdfInstance.GState({ opacity: 1 }));
        }
    };

    const canvasOptions = { scale: 2, useCORS: true, backgroundColor: null };

    const getCanvas = async (selector) => {
        const element = document.querySelector(selector);
        if (element && element.clientHeight > 10) {
            return await html2canvas(element, canvasOptions);
        }
        return null;
    };

    const getImgHeight = (canvas) => {
        if (!canvas) return 0;
        return canvas.height * (usableWidth / canvas.width);
    };

    addWatermark(pdf);

    // Block 1: Header
    const headerCanvas = await getCanvas('.invoice-header');
    if (headerCanvas) {
        const imgHeight = getImgHeight(headerCanvas);
        if (y + imgHeight > pdfHeight - margin) {
            pdf.addPage();
            addWatermark(pdf);
            y = margin;
        }
        pdf.addImage(headerCanvas, 'PNG', margin, y, usableWidth, imgHeight);
        y += imgHeight + 5;
    }

    // Block 2: Passagiere
    const passengersCanvas = await getCanvas('.invoice-passengers');
    if (passengersCanvas) {
        const imgHeight = getImgHeight(passengersCanvas);
        if (y + imgHeight > pdfHeight - margin) {
            pdf.addPage();
            addWatermark(pdf);
            y = margin;
        }
        pdf.addImage(passengersCanvas, 'PNG', margin, y, usableWidth, imgHeight);
        y += imgHeight + 5;
    }

    // Block 3: Hinflug (zusammenhalten)
    const outboundCanvas = await getCanvas('.invoice-outbound');
    if (outboundCanvas) {
        const imgHeight = getImgHeight(outboundCanvas);
        if (y + imgHeight > pdfHeight - margin) {
            pdf.addPage();
            addWatermark(pdf);
            y = margin;
        }
        pdf.addImage(outboundCanvas, 'PNG', margin, y, usableWidth, imgHeight);
        y += imgHeight + 5;
    }
    
    // Block 4: Rückflug (zusammenhalten)
    const returnCanvas = await getCanvas('.invoice-return');
    if (returnCanvas) {
        const imgHeight = getImgHeight(returnCanvas);
        if (y + imgHeight > pdfHeight - margin) {
            pdf.addPage();
            addWatermark(pdf);
            y = margin;
        }
        pdf.addImage(returnCanvas, 'PNG', margin, y, usableWidth, imgHeight);
        y += imgHeight + 5;
    }

    // Block 5: Leistungen & Fußzeile (zusammenhalten)
    const paymentCanvas = await getCanvas('.invoice-payment-block');
    const footerCanvas = await getCanvas('.pdf-block[style*="border-top"]');
    
    if (paymentCanvas) {
        const paymentHeight = getImgHeight(paymentCanvas);
        const footerHeight = getImgHeight(footerCanvas);
        const combinedHeight = paymentHeight + (footerHeight ? footerHeight + 5 : 0);

        if (y + combinedHeight > pdfHeight - margin) {
            pdf.addPage();
            addWatermark(pdf);
            y = margin;
        }

        pdf.addImage(paymentCanvas, 'PNG', margin, y, usableWidth, paymentHeight);
        y += paymentHeight + 5;

        if (footerCanvas) {
            pdf.addImage(footerCanvas, 'PNG', margin, y, usableWidth, footerHeight);
            y += footerHeight + 5;
        }
    }
    
    const fileName = `Rechnung_${document.getElementById('invoiceNumber').value}.pdf`;
    pdf.save(fileName);
};


// Save/Load
function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function collectInvoiceData(){
  const totalOutboundEl = document.getElementById('totalOutboundDuration');
  const totalReturnEl = document.getElementById('totalReturnDuration');
  return {
    number: invoiceNumberEl.value, date: invoiceDateEl.value,
    from: document.getElementById('from').value, to: document.getElementById('to').value,
    note: document.getElementById('note').value, payment: document.getElementById('payment').value,
    passengers: [...document.querySelectorAll('#passengerBody tr')].map(r=>({ 
        name: r.querySelector('.pname').value, 
        dob: r.querySelector('.pdob').value,
        baggage: {
            count: r.querySelector('.bag-count').value,
            weights: [...r.querySelectorAll('.bag-weight')].map(sel => sel.value)
        }
    })),
    outbound: collectFlights('outboundBody'),
    returns: document.getElementById('returnBody') ? collectFlights('returnBody') : [],
    totalOutboundDuration: totalOutboundEl ? totalOutboundEl.value : '',
    totalReturnDuration: totalReturnEl ? totalReturnEl.value : '',
    items: [...document.querySelectorAll('#itemsBody tr')].map(r=>({ option: r.querySelector('.opt').value, desc: r.querySelector('.desc').value, qty: r.querySelector('.qty').value, price: r.querySelector('.price').value })),
    logo: logoData,
    bgSettings: { enabled: bgToggle.checked, size: bgSize.value, opacity: bgOpacity.value, color: bgColor.value, colorOpacity: bgColorOpacity.value, headingColor: headingColorEl.value },
    createdAt: new Date().toISOString()
  }
}

function saveInvoice(){
  const data = collectInvoiceData();
  let list = JSON.parse(localStorage.getItem('invoices')||'[]');
  const idx = list.findIndex(i=>i.number === data.number);
  
  if(idx >= 0){
    data.status = list[idx].status || 'Unbezahlt';
    list[idx] = data;
  } else {
    data.status = 'Unbezahlt';
    list.push(data);
  };

  localStorage.setItem('invoices', JSON.stringify(list));
}

if(saveInvoiceBtn) saveInvoiceBtn.onclick = ()=>{
  if(enableSequence && enableSequence.checked && (!invoiceNumberEl.value || invoiceNumberEl.value.startsWith('R-'))){
    invoiceNumberEl.value = nextInvoiceNumber()
  }
  saveInvoice();
  alert('Rechnung gespeichert!');
  renderSavedInvoices(); 
}


// --- NEUE FUNKTIONEN FÜR RECHNUNGSVERWALTUNG ---
function getInvoiceTotal(invoice) {
    return (invoice.items || []).reduce((sum, item) => sum + (toNum(item.qty) * toNum(item.price)), 0);
}

function renderSavedInvoices() {
    if (!savedInvoicesBody) return;
    
    let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const period = periodFilter.value;

    if (period !== 'all') {
        invoices = invoices.filter(inv => {
            if (!inv.date) return false;
            const date = new Date(inv.date);
            const today = new Date();
            if (period === 'day') {
                return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            } else if (period === 'month') {
                return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
            } else if (period === 'year') {
                return date.getFullYear() === today.getFullYear();
            }
            return true;
        });
    }

    let totalAll = 0, totalPaid = 0, totalUnpaid = 0;
    invoices.forEach(inv => {
        const total = getInvoiceTotal(inv);
        totalAll += total;
        if (inv.status === 'Bezahlt') {
            totalPaid += total;
        } else {
            totalUnpaid += total;
        }
    });
    totalRevenueAllEl.textContent = format(totalAll) + ' €';
    totalRevenuePaidEl.textContent = format(totalPaid) + ' €';
    totalRevenueUnpaidEl.textContent = format(totalUnpaid) + ' €';

    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    let filteredInvoices = invoices.filter(inv => {
        const customerName = (inv.to || '').toLowerCase();
        const invoiceNumber = (inv.number || '').toLowerCase();
        const matchesSearch = customerName.includes(searchTerm) || invoiceNumber.includes(searchTerm);
        const matchesStatus = (status === 'all') || (inv.status === status);
        return matchesSearch && matchesStatus;
    });

    const sortValue = sortInvoices.value;
    filteredInvoices.sort((a, b) => {
        switch (sortValue) {
            case 'date_asc': return new Date(a.date) - new Date(b.date);
            case 'amount_desc': return getInvoiceTotal(b) - getInvoiceTotal(a);
            case 'amount_asc': return getInvoiceTotal(a) - getInvoiceTotal(b);
            case 'name_asc': return (a.to || '').localeCompare(b.to || '');
            case 'date_desc':
            default: return new Date(b.date) - new Date(a.date);
        }
    });

    if (filteredInvoices.length === 0) {
        savedInvoicesBody.innerHTML = '<tr><td colspan="6" class="center">Keine Rechnungen für den ausgewählten Zeitraum gefunden.</td></tr>';
        return;
    }

    savedInvoicesBody.innerHTML = filteredInvoices.map(inv => {
        const total = getInvoiceTotal(inv);
        const isPaid = inv.status === 'Bezahlt';
        return `
            <tr data-id="${inv.number}">
                <td>
                    <select class="status-select ${isPaid ? 'paid' : 'unpaid'}" data-id="${inv.number}">
                        <option value="Unbezahlt" ${!isPaid ? 'selected' : ''}>Unbezahlt</option>
                        <option value="Bezahlt" ${isPaid ? 'selected' : ''}>Bezahlt</option>
                    </select>
                </td>
                <td>${escapeHtml(inv.number)}</td>
                <td>${escapeHtml(inv.date)}</td>
                <td>${escapeHtml((inv.to || '').split('\n')[0])}</td>
                <td class="center">${format(total)} €</td>
                <td class="actions-cell">
                    <button class="btn btn-icon load-inv" title="Laden"><i data-lucide="edit"></i></button>
                    <button class="btn btn-icon pdf-inv" title="PDF anzeigen"><i data-lucide="file-text"></i></button>
                    <button class="btn btn-icon danger delete-inv" title="Löschen"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `;
    }).join('');
    
    if (window.lucide) window.lucide.createIcons();

    savedInvoicesBody.querySelectorAll('.status-select').forEach(sel => {
        sel.onchange = (e) => {
            const number = e.target.dataset.id;
            const newStatus = e.target.value;
            let allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
            const index = allInvoices.findIndex(i => i.number === number);
            if (index > -1) {
                allInvoices[index].status = newStatus;
                localStorage.setItem('invoices', JSON.stringify(allInvoices));
                renderSavedInvoices();
            }
        };
    });

    savedInvoicesBody.querySelectorAll('.load-inv').forEach(b => b.onclick = (e) => { loadInvoice(e.currentTarget.closest('tr').dataset.id); showPage('invoices'); });
    savedInvoicesBody.querySelectorAll('.pdf-inv').forEach(b => b.onclick = (e) => loadInvoiceAndDownload(e.currentTarget.closest('tr').dataset.id));
    savedInvoicesBody.querySelectorAll('.delete-inv').forEach(b => {
        b.onclick = (e) => {
            const number = e.currentTarget.closest('tr').dataset.id;
            if (confirm(`Soll die Rechnung ${number} wirklich gelöscht werden?`)) {
                let allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
                allInvoices = allInvoices.filter(i => i.number !== number);
                localStorage.setItem('invoices', JSON.stringify(allInvoices));
                renderSavedInvoices();
            }
        };
    });
}

if(searchInput) searchInput.oninput = renderSavedInvoices;
if(statusFilter) statusFilter.onchange = renderSavedInvoices;
if(periodFilter) periodFilter.onchange = renderSavedInvoices;
if(sortInvoices) sortInvoices.onchange = renderSavedInvoices;


function loadInvoice(number){
  const list = JSON.parse(localStorage.getItem('invoices')||'[]')
  const inv = list.find(i=>i.number === number)
  if(!inv){ alert('Rechnung nicht gefunden') ; return }
  invoiceNumberEl.value = inv.number; invoiceDateEl.value = inv.date
  document.getElementById('from').value = inv.from || ''; document.getElementById('to').value = inv.to || ''
  document.getElementById('note').value = inv.note || ''; document.getElementById('payment').value = inv.payment || ''
  passengerBody.innerHTML = ''; outboundBody.innerHTML = ''; itemsBody.innerHTML = ''
  
  returnSectionContainer.innerHTML = `<button class="btn btn-text" id="addReturnSection"><i data-lucide="corner-down-left"></i>Rückflug-Option hinzufügen</button>`;
  document.getElementById('addReturnSection').onclick = addReturnSectionBtn.onclick;
  if(window.lucide) window.lucide.createIcons();
  
  (inv.passengers||[]).forEach(p=>addPassenger(p.name,p.dob, p.baggage))
  ;(inv.outbound||[]).forEach(f=>addFlightRow('outboundBody',f.fromCity,f.toCity,f.depDate,f.depTime,f.arrDate,f.arrTime,f.airline,f.pnr, f.duration))
  
  if(inv.returns && inv.returns.length){
    if(!document.getElementById('returnSection')) addReturnSectionBtn.onclick()
    setTimeout(() => { 
      inv.returns.forEach(f=>addFlightRow('returnBody',f.fromCity,f.toCity,f.depDate,f.depTime,f.arrDate,f.arrTime,f.airline,f.pnr,f.duration));
      const totalReturnEl = document.getElementById('totalReturnDuration');
      if (inv.totalReturnDuration && totalReturnEl) {
        totalReturnEl.value = inv.totalReturnDuration;
      }
    }, 0);
  }

  const totalOutboundEl = document.getElementById('totalOutboundDuration');
  if (inv.totalOutboundDuration && totalOutboundEl) {
    totalOutboundEl.value = inv.totalOutboundDuration;
  }

  (inv.items||[]).forEach(it=>addItem(it.desc,it.qty,it.price,it.option))
  logoData = inv.logo || ''
  if (inv.bgSettings) {
    bgToggle.checked = inv.bgSettings.enabled; bgSize.value = inv.bgSettings.size
    bgOpacity.value = inv.bgSettings.opacity; bgColor.value = inv.bgSettings.color
    bgColorOpacity.value = inv.bgSettings.colorOpacity;
    headingColorEl.value = inv.bgSettings.headingColor || '#0277bd';
  }
  applyBackgroundSettings(); updatePreview()
}
function loadInvoiceAndDownload(number){ 
    loadInvoice(number); 
    setTimeout(()=>downloadPDFBtn.click(), 500);
}
window.addEventListener('beforeunload', ()=>{ saveSequenceState(getSequenceState()) });


// --- KUNDEN-SEITE ---
const customerForm = document.getElementById('customerForm');
const customerIdEl = document.getElementById('customerId');
const customerListEl = document.getElementById('customerList');
const customerSearchEl = document.getElementById('customerSearch');
const clearCustomerFormBtn = document.getElementById('clearCustomerForm');

function getCustomers() { return JSON.parse(localStorage.getItem('customers') || '[]'); }
function saveCustomers(customers) { localStorage.setItem('customers', JSON.stringify(customers)); }

if (customerForm) {
    customerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const customers = getCustomers();
      const customerData = {
        id: customerIdEl.value || `cust_${Date.now()}`,
        firstName: document.getElementById('custFirstName').value,
        lastName: document.getElementById('custLastName').value,
        phone: document.getElementById('custPhone').value,
        email: document.getElementById('custEmail').value,
        dob: document.getElementById('custDob').value,
        passportNum: document.getElementById('custPassportNum').value,
        passportExp: document.getElementById('custPassportExp').value,
      };
      
      const existingIndex = customers.findIndex(c => c.id === customerData.id);
      if (existingIndex >= 0) customers[existingIndex] = customerData;
      else customers.push(customerData);

      saveCustomers(customers);
      alert('Kunde gespeichert!');
      customerForm.reset();
      customerIdEl.value = '';
      renderCustomerList();
    });
}
if(clearCustomerFormBtn) clearCustomerFormBtn.onclick = () => { customerForm.reset(); customerIdEl.value = ''; };
if(customerSearchEl) customerSearchEl.oninput = () => renderCustomerList();

function renderCustomerList() {
  if (!customerListEl) return;
  const customers = getCustomers().sort((a,b) => (a.lastName || "").localeCompare(b.lastName || ""));
  const searchTerm = customerSearchEl.value.toLowerCase();

  const filtered = searchTerm
    ? customers.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm))
    : customers;

  if (filtered.length === 0) {
    customerListEl.innerHTML = '<p>Keine Kunden gefunden.</p>'; return;
  }
  customerListEl.innerHTML = filtered.map(cust => `
    <div class="saved-inv">
      <div><b>${escapeHtml(cust.lastName)}, ${escapeHtml(cust.firstName)}</b><br><small>${escapeHtml(cust.email || '')}</small></div>
      <div class="card-actions">
        <button class="btn btn-secondary select-customer" data-id="${cust.id}">Für Rechnung auswählen</button>
        <button class="btn btn-icon edit-customer" data-id="${cust.id}"><i data-lucide="edit"></i></button>
        <button class="btn btn-icon danger delete-customer" data-id="${cust.id}"><i data-lucide="trash-2"></i></button>
      </div>
    </div>`
  ).join('');
  
  if(window.lucide) window.lucide.createIcons();

  customerListEl.querySelectorAll('.edit-customer').forEach(b => {
    b.onclick = () => {
      const cust = getCustomers().find(c => c.id === b.dataset.id);
      if (cust) {
        customerIdEl.value = cust.id;
        document.getElementById('custFirstName').value = cust.firstName;
        document.getElementById('custLastName').value = cust.lastName;
        document.getElementById('custPhone').value = cust.phone;
        document.getElementById('custEmail').value = cust.email;
        document.getElementById('custDob').value = cust.dob;
        document.getElementById('custPassportNum').value = cust.passportNum;
        document.getElementById('custPassportExp').value = cust.passportExp;
        window.scrollTo(0, 0);
      }
    };
  });
  
  customerListEl.querySelectorAll('.delete-customer').forEach(b => {
    b.onclick = () => {
      if (confirm('Soll dieser Kunde wirklich gelöscht werden?')) {
        let customers = getCustomers();
        customers = customers.filter(c => c.id !== b.dataset.id);
        saveCustomers(customers);
        renderCustomerList();
      }
    };
  });

  customerListEl.querySelectorAll('.select-customer').forEach(b => {
    b.onclick = () => {
      const cust = getCustomers().find(c => c.id === b.dataset.id);
      if (cust) {
        document.getElementById('to').value = `${cust.firstName} ${cust.lastName}`;
        document.getElementById('customerEmail').value = cust.email || '';
        document.getElementById('customerPhone').value = cust.phone || '';
        passengerBody.innerHTML = '';
        addPassenger(`${cust.firstName} ${cust.lastName}`, cust.dob);
        showPage('invoices');
        updatePreview();
      }
    };
  });
}

const printPDFBtn = document.getElementById('printPDF');
if (printPDFBtn) {
    printPDFBtn.onclick = () => {
      updatePreview();
      setTimeout(() => {
        window.print();
      }, 100);
    };
}


// --- LOGIK FÜR VORSCHAU-UMSCHALTER ---
document.addEventListener('DOMContentLoaded', () => {
    const togglePreviewBtn = document.getElementById('togglePreviewBtn');
    const previewPane = document.querySelector('.preview-pane');

    if (togglePreviewBtn && previewPane) {
        togglePreviewBtn.addEventListener('click', () => {
            const isHidden = previewPane.style.display === 'none';
            previewPane.style.display = isHidden ? 'block' : 'none';
            if (!isHidden) {
                previewPane.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});