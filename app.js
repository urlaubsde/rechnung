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
    // const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; // No longer needed for default

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Default to light mode if no theme is saved, regardless of system preference
        applyTheme('light');
    }
    showPage('home'); // Geändert: Startseite ist jetzt 'home'
});


// --- Grundfunktionen ---
function format(n){return Number(n||0).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})}
function toNum(v){return parseFloat(String(v).replace(",", "."))||0}

// Toast Notification Function
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Force reflow to enable transition
    void toast.offsetWidth; 
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
}

// --- INVOICE TYPE SWITCHER ---
function updateInvoiceFormDisplay() {
    const invoiceTypeSelector = document.getElementById('invoiceTypeSelector');
    if (!invoiceTypeSelector) return; // Only run on invoice page
    
    const passengersCard = document.getElementById('passengersCard');
    const flightDetailsCard = document.getElementById('flightDetailsCard');
    const selectedType = document.querySelector('input[name="invoiceType"]:checked').value;

    const isSimple = selectedType === 'simple';
    // Use 'block' as it's the default for divs, or 'flex' if they have specific display styles
    if (passengersCard) passengersCard.style.display = isSimple ? 'none' : 'block';
    if (flightDetailsCard) flightDetailsCard.style.display = isSimple ? 'none' : 'block';
}

// --- SEITENNAVIGATION ---
const pageHome = document.getElementById('pageHome');
const pageInvoices = document.getElementById('pageInvoices');
const pageSavedInvoices = document.getElementById('pageSavedInvoices');
const pageCustomers = document.getElementById('pageCustomers');
const pageCalculator = document.getElementById('pageCalculator'); // New Calculator Page
const pageReminders = document.getElementById('pageReminders'); // New Reminders Page
const pageSettings = document.getElementById('pageSettings'); // New Settings Page
const pageInvoiceSettings = document.getElementById('pageInvoiceSettings'); // New Invoice Settings Page
const pageCalculatorSettings = document.getElementById('pageCalculatorSettings'); // New Calculator Settings Page
const navButtons = {
  home: document.getElementById('navHome'),
  saved: document.getElementById('navSavedInvoices'),
  reminders: document.getElementById('navReminders'), // New Reminders Nav Button
  settings: document.getElementById('navSettings'),
};
const settingsBtn = document.getElementById('settingsBtn');

const invoiceActionButtons = [
    document.getElementById('togglePreviewBtn'),
    document.getElementById('updatePreviewBtn'),
    document.getElementById('saveInvoice'),
    document.getElementById('printPDF'),
    document.getElementById('downloadPDF')
].filter(Boolean);

function showPage(pageId) {
  // Verstecke alle Seiten
  if(pageHome) pageHome.style.display = 'none';
  if(pageInvoices) pageInvoices.style.display = 'none';
  if(pageSavedInvoices) pageSavedInvoices.style.display = 'none';
  if(pageCustomers) pageCustomers.style.display = 'none';
  if(pageCalculator) pageCalculator.style.display = 'none'; // Hide calculator
  if(pageReminders) pageReminders.style.display = 'none'; // Hide reminders
  if(pageSettings) pageSettings.style.display = 'none'; // Hide settings
  if(pageInvoiceSettings) pageInvoiceSettings.style.display = 'none'; // Hide invoice settings
  if(pageCalculatorSettings) pageCalculatorSettings.style.display = 'none'; // Hide calculator settings

  // Show/hide invoice action buttons
  const isInvoicePage = pageId === 'invoices' || (!pageId && pageInvoices);
  invoiceActionButtons.forEach(btn => {
      btn.style.display = isInvoicePage ? 'inline-flex' : 'none';
  });

  // Zeige die ausgewählte Seite an
  if (pageId === 'home' && pageHome) {
    pageHome.style.display = 'block'; // Change to block to manage internal sections
    const upcomingRemindersCount = getUpcomingRemindersCount();
    const overdueInvoicesCount = getOverdueInvoicesCount();

    pageHome.innerHTML = `
        <div class="summary-cards-container">
            <div class="card summary-card reminder-summary-card">
                <div class="card-content">
                    <div class="summary-card-header">
                        <i data-lucide="bell" class="icon-lg"></i>
                        <span>Anstehende Erinnerungen (7 Tage)</span>
                    </div>
                    <div class="summary-card-body">
                        <span class="count">${upcomingRemindersCount}</span>
                    </div>
                </div>
            </div>
            <div class="card summary-card invoice-summary-card">
                <div class="card-content">
                    <div class="summary-card-header">
                        <i data-lucide="file-warning" class="icon-lg"></i>
                        <span>Überfällige Rechnungen (>14 Tage)</span>
                    </div>
                    <div class="summary-card-body">
                        <span class="count">${overdueInvoicesCount}</span>
                    </div>
                </div>
            </div>
        </div>
        <div id="unpaidInvoicesSection" class="home-section">
            <h3>Unbezahlte Rechnungen</h3>
            <div class="home-grid"></div>
        </div>
        <div id="upcomingRemindersSection" class="home-section">
            <h3>Anstehende Erinnerungen</h3>
            <div class="home-grid"></div>
        </div>
    `;
    renderUnpaidInvoices();
    renderUpcomingReminders();
    if (window.lucide) window.lucide.createIcons(); // Re-render icons for new cards
  } else if (pageId === 'saved' && pageSavedInvoices) {
    pageSavedInvoices.style.display = 'flex'; // Use flex for new layout
    renderSavedInvoices();
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.textContent = 'Analyse';
    }
  } else if (pageId === 'customers' && pageCustomers) {
    pageCustomers.style.display = 'flex'; // Use flex for new layout
    renderCustomerList();
  } else if (pageId === 'calculator' && pageCalculator) {
    pageCalculator.style.display = 'flex'; // Show calculator
  } else if (pageId === 'reminders' && pageReminders) {
    pageReminders.style.display = 'flex'; // Show reminders
    renderReminders(); // Render reminders when the page is shown
  } else if (pageId === 'settings' && pageSettings) {
    pageSettings.style.display = 'flex';
  } else if (pageId === 'invoiceSettings' && pageInvoiceSettings) {
    pageInvoiceSettings.style.display = 'flex';
  } else if (pageId === 'calculatorSettings' && pageCalculatorSettings) {
    pageCalculatorSettings.style.display = 'flex';
  } else { // Standardfall ist 'invoices'
    if(pageInvoices) {
        pageInvoices.style.display = 'flex'; // Use flex for new layout
        updateInvoiceFormDisplay(); // Set initial form display for invoice type
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const invoiceTypeSelector = document.getElementById('invoiceTypeSelector');
    if (invoiceTypeSelector) {
        // This listener handles changes to the invoice type radio buttons
        invoiceTypeSelector.addEventListener('change', () => {
            updateInvoiceFormDisplay();
            updatePreview(); // Update preview when type changes
        });
    }
});
if(navButtons.home) navButtons.home.onclick = () => showPage('home');
if(navButtons.saved) navButtons.saved.onclick = () => showPage('saved');
if(navButtons.reminders) navButtons.reminders.onclick = () => showPage('reminders'); // New event listener

if(navButtons.settings) {
    navButtons.settings.onclick = () => {
        showPage('settings');
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = 'Einstellungen';
        }
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
    };
}

const navInvoiceSettings = document.getElementById('navInvoiceSettings');
if(navInvoiceSettings) {
    navInvoiceSettings.onclick = () => {
        showPage('invoiceSettings');
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = 'Einstellungen der Rechnung';
        }
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
    };
}

const navCalculatorSettings = document.getElementById('navCalculatorSettings');
if(navCalculatorSettings) {
    navCalculatorSettings.onclick = () => {
        showPage('calculatorSettings');
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = 'Einstellungen der Rechner';
        }
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
    };
}

const navCustomersSettings = document.getElementById('navCustomersSettings');
if(navCustomersSettings) {
    navCustomersSettings.onclick = () => {
        showPage('customers');
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = 'Kundenverwaltung';
        }
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
    };
}

const fabNewInvoice = document.getElementById('fabNewInvoice');
const fabDropdown = document.getElementById('fabDropdown');
const dropdownNewInvoice = document.getElementById('dropdownNewInvoice');
const dropdownCalculator = document.getElementById('dropdownCalculator');

if(fabNewInvoice) {
    fabNewInvoice.onclick = (event) => {
        event.stopPropagation(); // Prevent the document click listener from immediately closing it
        fabDropdown.classList.toggle('show');
    };
}

if(dropdownNewInvoice) {
    dropdownNewInvoice.onclick = () => {
        showPage('invoices');
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = 'Rechnungserstellung';
        }
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
        fabDropdown.classList.remove('show'); // Hide dropdown after selection
    };
}

if(dropdownCalculator) {
    dropdownCalculator.onclick = () => {
        showPage('calculator');
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = 'Rechner';
        }
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
        fabDropdown.classList.remove('show'); // Hide dropdown after selection
    };
}

const dropdownCustomers = document.getElementById('dropdownCustomers');
if(dropdownCustomers) {
    dropdownCustomers.onclick = () => {
        showPage('customers');
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = 'Kundenverwaltung';
        }
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
        fabDropdown.classList.remove('show'); // Hide dropdown after selection
    };
}

// Hide dropdown when clicking anywhere else on the document
document.addEventListener('click', (event) => {
    if (fabDropdown && fabDropdown.classList.contains('show') && !fabDropdown.contains(event.target) && !fabNewInvoice.contains(event.target)) {
        fabDropdown.classList.remove('show');
    }
});

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
const enableVatEl = document.getElementById('enableVat');
const vatRateEl = document.getElementById('vatRate');
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
  return s || {prefix: sequencePrefix.value || 'UR2025-', next: Number(sequenceStart.value)||1}
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
  const pref = sequencePrefix.value || 'UR2025-'
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
  headingColorEl.value = '#556B2F';
  applyBackgroundSettings(); updatePreview();
}

// NEU: Helferfunktion für Zahlungsdetails
function toggleBankDetails() {
  const paymentMethodEl = document.getElementById('paymentMethod');
  const bankDetailsEl = document.getElementById('bankDetails');
  if (!paymentMethodEl || !bankDetailsEl) return;
  
  if (paymentMethodEl.value === 'Überweisung') {
    bankDetailsEl.style.display = 'flex'; // 'flex' because form-group is display: flex
  } else {
    bankDetailsEl.style.display = 'none';
  }
}

// NEU: Event-Listener für Zahlungsmethode
if(document.getElementById('paymentMethod')) {
    document.getElementById('paymentMethod').onchange = () => {
        toggleBankDetails();
        updatePreview(); // Aktualisiere die Vorschau bei Änderung
    };
}

// ========== START: KOMPLETT NEUES GEPÄCK-SYSTEM ==========

// GELÖSCHT: updateBaggageWeightInputs (alte Funktion)

// NEU: Fügt ein einzelnes Gepäckstück zur UI hinzu
function addBaggagePiece(listElement, type, weight = '23') {
    const div = document.createElement('div');
    div.className = 'baggage-piece';
    div.dataset.type = type;

    let options = '';
    for (let i = 0; i <= 100; i++) {
        options += `<option value="${i}" ${i == weight ? 'selected' : ''}>${i} kg</option>`;
    }

    div.innerHTML = `
        <span>${escapeHtml(type)}:</span>
        <select class="bag-weight">${options}</select>
        <button class="btn btn-icon danger remove-bag" title="Gepäckstück entfernen">
            <i data-lucide="x"></i>
        </button>
    `;

    div.querySelector('.remove-bag').onclick = () => {
        div.remove();
        updatePreview();
    };
    div.querySelector('select').oninput = updatePreview;
    
    listElement.appendChild(div);
    if (window.lucide) window.lucide.createIcons();
}

// NEU: Fügt einen Passagier (mit neuem Gepäck-Editor) hinzu
function addPassenger(name = '', dob = '', baggage = null) {
    if (!passengerBody) return;

    // Haupt-TR für Passagierdaten
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><input class="pname" value="${escapeHtml(name)}"></td>
        <td><input class="pdob" type="date" value="${dob}"></td>
        <td><button class="btn btn-icon danger remove"><i data-lucide="trash-2"></i></button></td>
    `;
    
    // Zweiter TR für den Gepäck-Editor
    const trBaggage = document.createElement('tr');
    trBaggage.className = 'baggage-row';
    
    const returnStyle = document.getElementById('returnSection') ? 'display: block;' : 'display: none;';

    trBaggage.innerHTML = `
        <td colspan="3">
            <div class="baggage-editor">
                <div class="baggage-section" data-flight="outbound">
                    <h5>Hinflug</h5>
                    <div class="baggage-controls">
                        <button class="btn btn-secondary btn-sm add-bag" data-type="Aufgabegepäck"><i data-lucide="plus"></i>Aufgabegepäck</button>
                        <button class="btn btn-secondary btn-sm add-bag" data-type="Handgepäck"><i data-lucide="plus"></i>Handgepäck</button>
                    </div>
                    <div class="baggage-list"></div>
                </div>
                <div class="baggage-section" data-flight="return" style="${returnStyle}">
                    <h5>Rückflug</h5>
                    <div class="baggage-controls">
                        <button class="btn btn-secondary btn-sm add-bag" data-type="Aufgabegepäck"><i data-lucide="plus"></i>Aufgabegepäck</button>
                        <button class="btn btn-secondary btn-sm add-bag" data-type="Handgepäck"><i data-lucide="plus"></i>Handgepäck</button>
                    </div>
                    <div class="baggage-list"></div>
                </div>
            </div>
        </td>
    `;

    // Event Listeners
    tr.querySelector('.remove').onclick = () => {
        tr.remove();
        trBaggage.remove();
        updatePreview();
    };
    tr.querySelectorAll('input').forEach(i => i.oninput = updatePreview);

    const outboundList = trBaggage.querySelector('[data-flight="outbound"] .baggage-list');
    const returnList = trBaggage.querySelector('[data-flight="return"] .baggage-list');

    trBaggage.querySelectorAll('.add-bag').forEach(btn => {
        btn.onclick = (e) => {
            const type = e.currentTarget.dataset.type;
            const section = e.currentTarget.closest('.baggage-section');
            const list = section.querySelector('.baggage-list');
            const defaultWeight = (type === 'Handgepäck') ? '8' : '23';
            addBaggagePiece(list, type, defaultWeight);
            updatePreview();
        };
    });

    // Lade vorhandene Gepäckdaten (beim Laden einer Rechnung)
    if (baggage) {
        (baggage.outbound || []).forEach(b => addBaggagePiece(outboundList, b.type, b.weight));
        (baggage.return || []).forEach(b => addBaggagePiece(returnList, b.type, b.weight));
    }

    passengerBody.appendChild(tr);
    passengerBody.appendChild(trBaggage);
    
    if (window.lucide) window.lucide.createIcons();
    updatePreview();
}
if(addPassengerBtn) addPassengerBtn.onclick=()=>addPassenger()

// NEU: Helferfunktion zum Sammeln der Gepäckdaten eines Passagiers
function collectBaggageData(passengerRow) {
    const baggageRow = passengerRow.nextElementSibling;
    if (!baggageRow || !baggageRow.classList.contains('baggage-row')) {
        return { outbound: [], return: [] };
    }

    const collectFromList = (list) => {
        return [...list.querySelectorAll('.baggage-piece')].map(piece => ({
            type: piece.dataset.type,
            weight: piece.querySelector('.bag-weight').value
        }));
    };

    const outboundList = baggageRow.querySelector('[data-flight="outbound"] .baggage-list');
    const returnList = baggageRow.querySelector('[data-flight="return"] .baggage-list');

    return {
        outbound: collectFromList(outboundList),
        return: collectFromList(returnList)
    };
}

// NEU: Helferfunktion zum Formatieren von Gepäckdaten für die Vorschau
function formatBaggage(baggageArray) {
    if (!baggageArray || baggageArray.length === 0) return '';
    const counts = {};
    baggageArray.forEach(b => {
        // Schlüssel ist "Typ (Gewicht kg)"
        const key = `${b.type} (${b.weight} kg)`;
        counts[key] = (counts[key] || 0) + 1;
    });
    // Erzeugt "2x Aufgabegepäck (23 kg), 1x Handgepäck (8 kg)"
    return Object.entries(counts).map(([key, count]) => `${count}x ${key}`).join(', ');
}
// ========== ENDE: KOMPLETT NEUES GEPÄCK-SYSTEM ==========


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
      
      // ========== START: GEPÄCK-ÄNDERUNG ==========
      // Verstecke alle Rückflug-Gepäck-Sektionen und leere sie
      document.querySelectorAll('.baggage-section[data-flight="return"]').forEach(el => {
          el.style.display = 'none';
          el.querySelector('.baggage-list').innerHTML = '';
      });
      // ========== ENDE: GEPÄCK-ÄNDERUNG ==========
      
      if (window.lucide) window.lucide.createIcons();
      updatePreview();
  }
  
  // ========== START: GEPÄCK-ÄNDERUNG ==========
  // Zeige alle Rückflug-Gepäck-Sektionen an
  document.querySelectorAll('.baggage-section[data-flight="return"]').forEach(el => {
      el.style.display = 'block';
  });
  // ========== ENDE: GEPÄCK-ÄNDERUNG ==========
  
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
  
  const paymentMethod = document.getElementById('paymentMethod').value;
  let paymentHtml = '';
  if (paymentMethod === 'Überweisung') {
      const payment=document.getElementById('payment').value.replace("Rechnungsnummer", number);
      if (payment) paymentHtml = `<h3>Zahlungsinformationen</h3><p>${escapeHtml(payment).replace(/\n/g,"<br>")}</p>`;
  } else if (paymentMethod === 'Barzahlung') {
      paymentHtml = `<h3>Zahlungsinformationen</h3><p>Zahlungsmethode: Barzahlung</p>`;
  }
  
  let netto=0
  
  // NEU: VAT Einstellungen
  const enableVat = enableVatEl ? enableVatEl.checked : false;
  const vatRate = vatRateEl ? parseFloat(vatRateEl.value) / 100 : 0.19; // Default 19%
  let vatAmount = 0;
  let totalGross = 0;
  
  // ========== START: GEPÄCK-ÄNDERUNG (Vorschau-Logik) ==========
  const invoiceType = document.querySelector('input[name="invoiceType"]:checked') ? document.querySelector('input[name="invoiceType"]:checked').value : 'full';
  let passengers = '';
  let outboundFlights = [];
  let returnFlights = [];

  if (invoiceType === 'full') {
      passengers = [...document.querySelectorAll('#passengerBody > tr:not(.baggage-row)')].map(r=>{
        const name = r.querySelector('.pname').value;
        const dob = r.querySelector('.pdob').value;
        
        // Sammle und formatiere Gepäck
        const baggageData = collectBaggageData(r);
        const outBaggage = formatBaggage(baggageData.outbound);
        const retBaggage = formatBaggage(baggageData.return);

        let baggageInfo = '';
        if (outBaggage) {
            baggageInfo += `<br><small style="color: #555;"><b>Hinflug:</b> ${escapeHtml(outBaggage)}</small>`;
        }
        // Zeige Rückflug-Gepäck nur an, wenn die Rückflug-Sektion existiert
        if (retBaggage && document.getElementById('returnSection')) {
            baggageInfo += `<br><small style="color: #555;"><b>Rückflug:</b> ${escapeHtml(retBaggage)}</small>`;
        }
        
        return `<li>${escapeHtml(name)} (${dob})${baggageInfo}</li>`;
      }).join("");

      outboundFlights = collectFlights('outboundBody');
      returnFlights = document.getElementById('returnBody') ? collectFlights('returnBody') : [];
  }
  
  applyBackgroundSettings()

  function renderFlights(title, flights) {
    if (flights.length === 0) return "";
    let rowsHtml = "";
    for (let i = 0; i < flights.length; i++) {
        const f = flights[i];
        if (f.airline || f.pnr) { rowsHtml += `<tr class="layover-row" style="text-align:left; font-style:normal;"><td colspan="5" style="padding: 6px 8px;"><b>${escapeHtml(f.airline || "")}</b> ${f.pnr ? `— PNR: ${escapeHtml(f.pnr)}` : ""}</td></tr>`; }
        rowsHtml += `<tr><td>${escapeHtml(f.fromCity)}</td><td>${escapeHtml(f.toCity)}</td><td>${f.depDate}<br>${f.depTime}</td><td>${f.arrDate}<br>${f.arrTime}</td><td>${f.duration}</td></tr>`;
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

    if (enableVat) {
        vatAmount = netto * vatRate;
        totalGross = netto + vatAmount;
    } else {
        totalGross = netto;
    }

    const vatRow = enableVat ? `
        <tr class="vat-row">
            <td colspan="4" style="text-align:right; padding-right: 20px;">Mehrwertsteuer (${(vatRate * 100).toFixed(1)}%)</td>
            <td class="center">${format(vatAmount)} €</td>
        </tr>
    ` : '';

    const vatDisclaimer = enableVat ? '' : `<p style="margin-top:20px;font-size:13px;color:#555">Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>`;

    const contactEmail = document.getElementById('contactEmail') ? document.getElementById('contactEmail').value : 'urlaubsde@gmail.com';
    const contactPhone = document.getElementById('contactPhone') ? document.getElementById('contactPhone').value : '+4917664957576';

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
    ${invoiceType === 'full' ? `
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
    ` : ''}
    <div class="pdf-block invoice-payment-block">
        <h3>Leistungen</h3>
        <table>
          <thead><tr><th>Option</th><th>Beschreibung</th><th class="center">Menge</th><th class="center">Preis (€ / Stück)</th><th class="center">Gesamt (€)</th></tr></thead>
          <tbody>${items}</tbody>
          <tfoot>
            ${vatRow}
            <tr class="total-row"><td colspan="4" style="text-align:right; padding-right: 20px;">Gesamtsumme</td><td class="center">${format(totalGross)} €</td></tr>
          </tfoot>
        </table>
        ${vatDisclaimer}
        ${note ? `<h3>Notiz</h3><p>${escapeHtml(note).replace(/\n/g,"<br>")}</p>` : ""}
        ${paymentHtml}
    </div>
    <div class="pdf-block" style="border-top: 1px solid #ccc; margin-top: 40px; padding-top: 10px; text-align: center; font-size: 0.8rem; color: #555;">
        Email: ${escapeHtml(contactEmail)} | Telefon: ${escapeHtml(contactPhone)}
    </div>`;
}

// Event-Listener für den neuen Aktualisierungsbutton
if (updatePreviewBtn) {
    updatePreviewBtn.onclick = updatePreview;
}

document.addEventListener('DOMContentLoaded', () => {
  loadInvoiceSettings(); // Load invoice settings on startup
  if (document.getElementById('pageInvoices')) {
    // Füge Passagiere ohne Gepäck-Daten hinzu (die UI wird erstellt)
    addPassenger("Max Mustermann","1985-05-10");
    addPassenger("Erika Mustermann","1987-07-21");
    
    addFlightRow('outboundBody',"Hamburg","Rom","2025-09-12","08:15","2025-09-12","11:05", "Lufthansa LH24", "ABCDE1");
    addItem("Hotel 7 Nächte",1,560);
    updatePreview();
  }
  toggleBankDetails();
});

// PDF EXPORT
if (downloadPDFBtn) downloadPDFBtn.onclick = async () => {
    saveInvoice();
    updatePreview();
    
    const previewPane = document.querySelector('.preview-pane');
    const wasHidden = previewPane.style.display === 'none';
    if (wasHidden) {
        previewPane.style.display = 'flex'; // Temporarily show the preview pane
    }

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

    if (wasHidden) {
        previewPane.style.display = 'none'; // Hide it again if it was hidden initially
    }
};


// Save/Load
function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function collectInvoiceData(){
  const totalOutboundEl = document.getElementById('totalOutboundDuration');
  const totalReturnEl = document.getElementById('totalReturnDuration');
  const invoiceType = document.querySelector('input[name="invoiceType"]:checked') ? document.querySelector('input[name="invoiceType"]:checked').value : 'full';

  const data = {
    number: invoiceNumberEl.value, date: invoiceDateEl.value,
    from: document.getElementById('from').value, to: document.getElementById('to').value,
    customerEmail: document.getElementById('customerEmail').value,
    customerPhone: document.getElementById('customerPhone').value,
    note: document.getElementById('note').value, payment: document.getElementById('payment').value,
    paymentMethod: document.getElementById('paymentMethod').value, 
    items: [...document.querySelectorAll('#itemsBody tr')].map(r=>({ option: r.querySelector('.opt').value, desc: r.querySelector('.desc').value, qty: r.querySelector('.qty').value, price: r.querySelector('.price').value })),
    logo: logoData,
    bgSettings: { enabled: bgToggle.checked, size: bgSize.value, opacity: bgOpacity.value, color: bgColor.value, colorOpacity: bgColorOpacity.value, headingColor: headingColorEl.value },
    vatSettings: { enableVat: enableVatEl.checked, vatRate: vatRateEl.value },
    createdAt: new Date().toISOString(),
    invoiceType: invoiceType // Save the type
  };

  if (invoiceType === 'full') {
    data.passengers = [...document.querySelectorAll('#passengerBody > tr:not(.baggage-row)')].map(r=>({ 
        name: r.querySelector('.pname').value, 
        dob: r.querySelector('.pdob').value,
        baggage: collectBaggageData(r)
    }));
    data.outbound = collectFlights('outboundBody');
    data.returns = document.getElementById('returnBody') ? collectFlights('returnBody') : [];
    data.totalOutboundDuration = totalOutboundEl ? totalOutboundEl.value : '';
    data.totalReturnDuration = totalReturnEl ? totalReturnEl.value : '';
  } else {
    data.passengers = [];
    data.outbound = [];
    data.returns = [];
    data.totalOutboundDuration = '';
    data.totalReturnDuration = '';
  }

  return data;
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

  // NEU: Kundeninformationen speichern
  const customerNameFull = (data.to || '').split('\n')[0].trim();
  let firstName = '';
  let lastName = '';
  const nameParts = customerNameFull.split(' ');
  if (nameParts.length > 1) {
      firstName = nameParts.slice(0, -1).join(' ');
      lastName = nameParts[nameParts.length - 1];
  } else {
      firstName = customerNameFull;
  }

  const customerData = {
      firstName: firstName,
      lastName: lastName,
      phone: data.customerPhone || '',
      email: data.customerEmail || '',
      // Add other relevant fields if available in invoice data
      id: `cust_${Date.now()}` // Temporärer ID, falls noch keiner existiert
  };

  if (customerData.firstName) { // Nur speichern, wenn ein Name vorhanden ist
      let customers = getCustomers();
      const existingCustomer = customers.find(c => 
          (c.email && c.email === customerData.email && customerData.email !== '') ||
          (c.phone && c.phone === customerData.phone && customerData.phone !== '') ||
          (c.firstName === customerData.firstName && c.lastName === customerData.lastName && customerData.firstName !== '')
      );

      if (!existingCustomer) {
          customers.push(customerData);
          saveCustomers(customers);
          renderCustomerList(); // Aktualisiere die Kundenliste in der UI
      }
  }
  
  createInvoiceReminders(data); // NEU: Erinnerungen erstellen
}

// NEU: Funktion zum Erstellen von Rechnungserinnerungen
function createInvoiceReminders(invoiceData) {
    const customerName = (invoiceData.to || '').split('\n')[0];
    const customerContact = [];
    if (invoiceData.customerEmail) customerContact.push(`E-Mail: ${invoiceData.customerEmail}`);
    if (invoiceData.customerPhone) customerContact.push(`Telefon: ${invoiceData.customerPhone}`);
    const customerNote = customerContact.length > 0 ? `Kunde: ${customerName}\n${customerContact.join('\n')}` : `Kunde: ${customerName}`;

    const allReminders = getReminders();

    // Erinnerungen für Hinflüge
    invoiceData.outbound.forEach(flight => {
        if (flight.depDate && flight.depTime) {
            const departureDateTime = new Date(`${flight.depDate}T${flight.depTime}`);
            const reminderDateTime = new Date(departureDateTime);
            reminderDateTime.setDate(reminderDateTime.getDate() - 1); // 1 Tag vor Abflug

            const reminderDate = reminderDateTime.toISOString().split('T')[0];
            const reminderTime = reminderDateTime.toTimeString().slice(0, 5);

            const reminderText = `Rechnung ${invoiceData.number}: Hinflug ${flight.fromCity} nach ${flight.toCity}`;
            const reminderNote = `Flugdetails: ${flight.airline || ''} PNR: ${flight.pnr || ''}\n${customerNote}`;

            const newReminder = {
                id: `inv_rem_${invoiceData.number}_outbound_${flight.depDate}_${flight.depTime}`,
                type: 'Erinnerung',
                text: reminderText,
                note: reminderNote,
                date: reminderDate,
                time: reminderTime,
                notifications: [{ id: `notif_${Date.now()}_${Math.random()}`, type: 'at_due_date', value: '', triggered: false }],
                completed: false
            };
            // Vermeide doppelte Erinnerungen
            if (!allReminders.some(r => r.id === newReminder.id)) {
                allReminders.push(newReminder);
            }
        }
    });

    // Erinnerungen für Rückflüge (falls vorhanden)
    invoiceData.returns.forEach(flight => {
        if (flight.depDate && flight.depTime) {
            const departureDateTime = new Date(`${flight.depDate}T${flight.depTime}`);
            const reminderDateTime = new Date(departureDateTime);
            reminderDateTime.setDate(reminderDateTime.getDate() - 1); // 1 Tag vor Abflug

            const reminderDate = reminderDateTime.toISOString().split('T')[0];
            const reminderTime = reminderDateTime.toTimeString().slice(0, 5);

            const reminderText = `Rechnung ${invoiceData.number}: Rückflug ${flight.fromCity} nach ${flight.toCity}`;
            const reminderNote = `Flugdetails: ${flight.airline || ''} PNR: ${flight.pnr || ''}\n${customerNote}`;

            const newReminder = {
                id: `inv_rem_${invoiceData.number}_return_${flight.depDate}_${flight.depTime}`,
                type: 'Erinnerung',
                text: reminderText,
                note: reminderNote,
                date: reminderDate,
                time: reminderTime,
                notifications: [{ id: `notif_${Date.now()}_${Math.random()}`, type: 'at_due_date', value: '', triggered: false }],
                completed: false
            };
            // Vermeide doppelte Erinnerungen
            if (!allReminders.some(r => r.id === newReminder.id)) {
                allReminders.push(newReminder);
            }
        }
    });

    saveReminders(allReminders);
    // Optional: updateReminderNotificationUI(); if you want to immediately reflect new reminders in the dropdown
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

function renderUnpaidInvoices() {
    const unpaidInvoicesSection = document.querySelector('#unpaidInvoicesSection .home-grid');
    if (!unpaidInvoicesSection) return;

    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const unpaidInvoices = invoices.filter(inv => inv.status === 'Unbezahlt' && inv.date);

    // Sort by date, oldest first
    unpaidInvoices.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (unpaidInvoices.length === 0) {
        unpaidInvoicesSection.innerHTML = '<div class="card" style="grid-column: 1 / -1;"><div class="card-content" style="text-align: center;">Keine unbezahlten Rechnungen gefunden. Gut gemacht!</div></div>';
        return;
    }

    unpaidInvoicesSection.innerHTML = unpaidInvoices.map(inv => {
        const total = getInvoiceTotal(inv);
        const invoiceDate = new Date(inv.date);
        const today = new Date();
        const daysOld = Math.floor((today - invoiceDate) / (1000 * 60 * 60 * 24));

        let level = 1;
        if (daysOld >= 61) level = 5;
        else if (daysOld >= 31) level = 4;
        else if (daysOld >= 15) level = 3;
        else if (daysOld >= 8) level = 2;

        return `
            <div class="card unpaid-invoice-card unpaid-level-${level}" data-id="${inv.number}">
                <div class="card-content">
                    <div class="unpaid-invoice-card-header">
                        <span>${escapeHtml(inv.number)}</span>
                        <span class="date">${escapeHtml(inv.date)} (${daysOld} Tage)</span>
                    </div>
                    <div class="unpaid-invoice-card-body">
                        <div class="amount">${format(total)} €</div>
                        <h4 class="customer">${escapeHtml((inv.to || '').split('\n')[0])}</h4>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary load-inv" title="Laden"><i data-lucide="edit"></i>Laden</button>
                    <button class="btn btn-secondary pdf-inv" title="PDF anzeigen"><i data-lucide="file-text"></i>PDF</button>
                    <button class="btn btn-icon danger delete-inv" title="Löschen"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();

    // Attach event listeners
    pageHome.querySelectorAll('.load-inv').forEach(b => b.onclick = (e) => { loadInvoice(e.currentTarget.closest('.card').dataset.id); showPage('invoices'); });
    pageHome.querySelectorAll('.pdf-inv').forEach(b => b.onclick = (e) => loadInvoiceAndDownload(e.currentTarget.closest('.card').dataset.id));
    pageHome.querySelectorAll('.delete-inv').forEach(b => {
        b.onclick = (e) => {
            const number = e.currentTarget.closest('.card').dataset.id;
            if (confirm(`Soll die Rechnung ${number} wirklich gelöscht werden?`)) {
                let allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
                allInvoices = allInvoices.filter(i => i.number !== number);
                localStorage.setItem('invoices', JSON.stringify(allInvoices));
                renderUnpaidInvoices(); // Re-render the home page
            }
        };
    });
}

function renderUpcomingReminders() {
    const upcomingRemindersSection = document.querySelector('#upcomingRemindersSection .home-grid');
    if (!upcomingRemindersSection) return;

    const allReminders = getReminders();
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize 'now' to start of today for date comparison

    const upcomingReminders = allReminders.filter(rem => {
        if (rem.completed) return false;
        const reminderDateTime = new Date(`${rem.date}T${rem.time}`);
        // Only show reminders that are due today or in the future
        return reminderDateTime >= now;
    });

    // Sort by due date, closest first
    upcomingReminders.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    let remindersHtml = '';
    if (upcomingReminders.length === 0) {
        upcomingRemindersSection.innerHTML = '<div class="card" style="grid-column: 1 / -1;"><div class="card-content" style="text-align: center;">Keine anstehenden Erinnerungen oder Aufgaben.</div></div>';
    } else {
        remindersHtml = upcomingReminders.map(rem => {
            const reminderDueDate = new Date(`${rem.date}T${rem.time}`);
            const timeDiff = reminderDueDate.getTime() - now.getTime();
            const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Days until due, rounded up

            let level = 1; // Default lightest color
            if (daysUntilDue <= 0) level = 5; // Due today or in the past (but not completed)
            else if (daysUntilDue <= 3) level = 4; // Due within 1-3 days
            else if (daysUntilDue <= 7) level = 3; // Due within 4-7 days
            else if (daysUntilDue <= 14) level = 2; // Due within 8-14 days

            const typeIcon = rem.type === 'Aufgabe' ? 'clipboard-check' : 'bell';
            const dueDateText = daysUntilDue <= 0 ? 'Heute fällig' : `Fällig in ${daysUntilDue} Tagen`;

            return `
                <div class="card reminder-card reminder-level-${level}" data-id="${rem.id}">
                    <div class="card-content">
                        <div class="reminder-card-header">
                            <i data-lucide="${typeIcon}" class="type-icon"></i>
                            <span>${escapeHtml(rem.text)}</span>
                        </div>
                        <div class="reminder-card-body">
                            <small class="due-date">${dueDateText} (${escapeHtml(rem.date)} ${escapeHtml(rem.time)})</small>
                            ${rem.note ? `<p class="reminder-note">${escapeHtml(rem.note)}</p>` : ''}
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-secondary edit-reminder" data-id="${rem.id}" title="Bearbeiten"><i data-lucide="edit"></i>Bearbeiten</button>
                        <button class="btn btn-icon btn-primary toggle-complete-reminder" data-id="${rem.id}" title="Als erledigt markieren"><i data-lucide="check"></i></button>
                    </div>
                </div>
            `;
        }).join('');
    }

    upcomingRemindersSection.innerHTML = remindersHtml;

    if (window.lucide) window.lucide.createIcons();

    // Attach event listeners for reminders
    upcomingRemindersSection.querySelectorAll('.edit-reminder').forEach(b => b.onclick = (e) => { loadReminderForEdit(e.currentTarget.closest('.card').dataset.id); showPage('reminders'); });
    upcomingRemindersSection.querySelectorAll('.toggle-complete-reminder').forEach(b => {
        b.onclick = (e) => {
            const id = e.currentTarget.closest('.card').dataset.id;
            let allReminders = getReminders();
            const index = allReminders.findIndex(rem => rem.id === id);
            if (index > -1) {
                allReminders[index].completed = true; // Mark as completed
                saveReminders(allReminders);
                renderUpcomingReminders(); // Re-render reminders
                renderReminders(); // Also update the main reminders page
            }
        };
    });
}

function renderUpcomingReminders() {
    if (!pageHome) return;

    const allReminders = getReminders();
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize 'now' to start of today for date comparison

    const upcomingReminders = allReminders.filter(rem => {
        if (rem.completed) return false;
        const reminderDateTime = new Date(`${rem.date}T${rem.time}`);
        // Only show reminders that are due today or in the future
        return reminderDateTime >= now;
    });

    // Sort by due date, closest first
    upcomingReminders.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    let remindersHtml = '';
    if (upcomingReminders.length === 0) {
        remindersHtml = '<div class="card" style="grid-column: 1 / -1;"><div class="card-content" style="text-align: center;">Keine anstehenden Erinnerungen oder Aufgaben.</div></div>';
    } else {
        remindersHtml = upcomingReminders.map(rem => {
            const reminderDueDate = new Date(`${rem.date}T${rem.time}`);
            const timeDiff = reminderDueDate.getTime() - now.getTime();
            const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Days until due, rounded up

            let level = 1; // Default lightest color
            if (daysUntilDue <= 0) level = 5; // Due today or in the past (but not completed)
            else if (daysUntilDue <= 3) level = 4; // Due within 1-3 days
            else if (daysUntilDue <= 7) level = 3; // Due within 4-7 days
            else if (daysUntilDue <= 14) level = 2; // Due within 8-14 days

            const typeIcon = rem.type === 'Aufgabe' ? 'clipboard-check' : 'bell';
            const dueDateText = daysUntilDue <= 0 ? 'Heute fällig' : `Fällig in ${daysUntilDue} Tagen`;

            return `
                <div class="card reminder-card reminder-level-${level}" data-id="${rem.id}">
                    <div class="card-content">
                        <div class="reminder-card-header">
                            <i data-lucide="${typeIcon}" class="type-icon"></i>
                            <span>${escapeHtml(rem.text)}</span>
                        </div>
                        <div class="reminder-card-body">
                            <small class="due-date">${dueDateText} (${escapeHtml(rem.date)} ${escapeHtml(rem.time)})</small>
                            ${rem.note ? `<p class="reminder-note">${escapeHtml(rem.note)}</p>` : ''}
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-secondary edit-reminder" data-id="${rem.id}" title="Bearbeiten"><i data-lucide="edit"></i>Bearbeiten</button>
                        <button class="btn btn-icon btn-primary toggle-complete-reminder" data-id="${rem.id}" title="Als erledigt markieren"><i data-lucide="check"></i></button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Create a container for reminders if it doesn't exist
    let remindersSection = document.getElementById('upcomingRemindersSection');
    if (!remindersSection) {
        remindersSection = document.createElement('div');
        remindersSection.id = 'upcomingRemindersSection';
        remindersSection.className = 'home-section'; // Use a class for styling
        pageHome.appendChild(remindersSection);
    }
    remindersSection.innerHTML = `<h3>Anstehende Erinnerungen</h3><div class="home-grid">${remindersHtml}</div>`;

    if (window.lucide) window.lucide.createIcons();

    // Attach event listeners for reminders
    remindersSection.querySelectorAll('.edit-reminder').forEach(b => b.onclick = (e) => { loadReminderForEdit(e.currentTarget.closest('.card').dataset.id); showPage('reminders'); });
    remindersSection.querySelectorAll('.toggle-complete-reminder').forEach(b => {
        b.onclick = (e) => {
            const id = e.currentTarget.closest('.card').dataset.id;
            let allReminders = getReminders();
            const index = allReminders.findIndex(rem => rem.id === id);
            if (index > -1) {
                allReminders[index].completed = true; // Mark as completed
                saveReminders(allReminders);
                renderUpcomingReminders(); // Re-render reminders
                renderReminders(); // Also update the main reminders page
            }
        };
    });
}


function getInvoiceTotal(invoice) {
    return (invoice.items || []).reduce((sum, item) => sum + (toNum(item.qty) * toNum(item.price)), 0);
}

function getUpcomingRemindersCount() {
    const allReminders = getReminders();
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize 'now' to start of today

    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const upcomingReminders = allReminders.filter(rem => {
        if (rem.completed) return false;
        const reminderDueDate = new Date(`${rem.date}T${rem.time}`);
        return reminderDueDate >= now && reminderDueDate <= sevenDaysFromNow;
    });
    return upcomingReminders.length;
}

function getOverdueInvoicesCount() {
    const allInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize 'now' to start of today

    const overdueInvoices = allInvoices.filter(inv => {
        if (inv.status === 'Bezahlt' || !inv.date) return false;
        const invoiceDate = new Date(inv.date);
        const daysOld = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24));
        return daysOld > 14;
    });
    return overdueInvoices.length;
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

  // Set invoice type radio button
  const invoiceType = inv.invoiceType || 'full';
  const radioBtn = document.querySelector(`input[name="invoiceType"][value="${invoiceType}"]`);
  if (radioBtn) radioBtn.checked = true;
  
  // Update form display based on type. Call this before populating fields.
  updateInvoiceFormDisplay();

  invoiceNumberEl.value = inv.number; invoiceDateEl.value = inv.date
  document.getElementById('from').value = inv.from || ''; document.getElementById('to').value = inv.to || ''
  document.getElementById('note').value = inv.note || ''; document.getElementById('payment').value = inv.payment || ''
  
  const paymentMethodEl = document.getElementById('paymentMethod');
  if (paymentMethodEl) {
      paymentMethodEl.value = inv.paymentMethod || 'Überweisung'; 
  }
  
  passengerBody.innerHTML = ''; outboundBody.innerHTML = ''; itemsBody.innerHTML = ''
  
  returnSectionContainer.innerHTML = `<button class="btn btn-text" id="addReturnSection"><i data-lucide="corner-down-left"></i>Rückflug-Option hinzufügen</button>`;
  document.getElementById('addReturnSection').onclick = addReturnSectionBtn.onclick;
  if(window.lucide) window.lucide.createIcons();
  
  // ========== START: GEPÄCK-ÄNDERUNG (Laden) ==========
  // Rufe die NEUE addPassenger-Funktion auf, die das Gepäck-Objekt verarbeiten kann
  (inv.passengers||[]).forEach(p=>addPassenger(p.name, p.dob, p.baggage))
  // ========== ENDE: GEPÄCK-ÄNDERUNG (Laden) ==========
  
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
    headingColorEl.value = inv.bgSettings.headingColor || '#556B2F';
  }
  if (inv.vatSettings) {
    enableVatEl.checked = inv.vatSettings.enableVat;
    vatRateEl.value = inv.vatSettings.vatRate;
  }
  applyBackgroundSettings(); 
  toggleBankDetails(); 
  updatePreview()
}
// --- Invoice Settings Save/Load ---
const INVOICE_SETTINGS_KEY = 'invoiceSettings';

function saveInvoiceSettings() {
    const settings = {
        note: document.getElementById('note').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        payment: document.getElementById('payment').value,
        logoData: logoData, // Use the global logoData
        bgSettings: {
            enabled: bgToggle.checked,
            size: bgSize.value,
            opacity: bgOpacity.value,
            color: bgColor.value,
            colorOpacity: bgColorOpacity.value,
            headingColor: headingColorEl.value
        },
        sequence: {
            enableSequence: enableSequence.checked,
            prefix: sequencePrefix.value,
            start: sequenceStart.value
        },
        vatSettings: {
            enableVat: enableVatEl.checked,
            vatRate: vatRateEl.value
        },
        contactEmail: document.getElementById('contactEmail').value,
        contactPhone: document.getElementById('contactPhone').value
    };
    localStorage.setItem(INVOICE_SETTINGS_KEY, JSON.stringify(settings));
    alert('Rechnungseinstellungen gespeichert!');
}

function loadInvoiceSettings() {
    const settings = JSON.parse(localStorage.getItem(INVOICE_SETTINGS_KEY) || '{}');

    // Apply Note & Payment settings
    if (settings.note) document.getElementById('note').value = settings.note;
    if (settings.paymentMethod) document.getElementById('paymentMethod').value = settings.paymentMethod;
    if (settings.payment) document.getElementById('payment').value = settings.payment;

    // Apply Branding & Design settings
    if (settings.logoData) {
        logoData = settings.logoData; // Restore global logoData
    }
    if (settings.bgSettings) {
        bgToggle.checked = settings.bgSettings.enabled;
        bgSize.value = settings.bgSettings.size;
        bgOpacity.value = settings.bgSettings.opacity;
        bgColor.value = settings.bgSettings.color;
        bgColorOpacity.value = settings.bgSettings.colorOpacity;
        headingColorEl.value = settings.bgSettings.headingColor || '#0277bd';
    }

    // Apply Sequence settings
    if (settings.sequence) {
        enableSequence.checked = settings.sequence.enableSequence;
        sequencePrefix.value = settings.sequence.prefix;
        sequenceStart.value = settings.sequence.start;
    }

    // Apply VAT settings
    if (settings.vatSettings) {
        enableVatEl.checked = settings.vatSettings.enableVat;
        vatRateEl.value = settings.vatSettings.vatRate;
    }

    // Apply Contact Info settings
    if (settings.contactEmail && document.getElementById('contactEmail')) {
        document.getElementById('contactEmail').value = settings.contactEmail;
    }
    if (settings.contactPhone && document.getElementById('contactPhone')) {
        document.getElementById('contactPhone').value = settings.contactPhone;
    }
    
    applyBackgroundSettings(); // Re-apply background settings after loading
    toggleBankDetails(); // Update bank details visibility
}

// Attach event listener for the new save button
const saveInvoiceSettingsBtn = document.getElementById('saveInvoiceSettings');
if (saveInvoiceSettingsBtn) {
    saveInvoiceSettingsBtn.onclick = saveInvoiceSettings;
}

if (enableVatEl) {
    enableVatEl.onchange = () => { updatePreview(); saveInvoiceSettings(); };
}
if (vatRateEl) {
    vatRateEl.oninput = () => { updatePreview(); saveInvoiceSettings(); };
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
        addPassenger(`${cust.firstName} ${cust.lastName}`, cust.dob); // Fügt Passagier ohne Gepäck hinzu
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
    // const appLayout = document.querySelector('.app-layout'); // No longer needed

    if (togglePreviewBtn && previewPane) { // Removed appLayout from condition
        // Initial state: preview is hidden
        previewPane.style.display = 'none';
        // appLayout.classList.remove('show-preview'); // No longer needed

        togglePreviewBtn.addEventListener('click', () => {
            const isHidden = previewPane.style.display === 'none';
            if (isHidden) {
                previewPane.style.display = 'flex'; // Use flex to center content
                // appLayout.classList.add('show-preview'); // No longer needed
                updatePreview(); // Update preview when shown
                // previewPane.scrollIntoView({ behavior: 'smooth' }); // No longer needed, as it's part of the scrollable content
            } else {
                previewPane.style.display = 'none';
                // appLayout.classList.remove('show-preview'); // No longer needed
            }
        });
    }
});

// --- PERCENTAGE CALCULATOR LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('pageCalculatorSettings')) return;

    const defaultPercentages = {
        '0-150': 20,
        '151-300': 17.833333,
        '301-450': 15.666667,
        '451-600': 13.5,
        '601-750': 11.333333,
        '751-900': 9.166667,
        '901-1050': 7,
        '1051+': 6
    };

    const calcInput = document.getElementById('calcInput');
    const clearCalcInputBtn = document.getElementById('clearCalcInput');
    const resultWrapper = document.getElementById('calcResultWrapper');
    const resultEl = document.getElementById('calcResult');
    const percentageNoteEl = document.getElementById('calcPercentageNote');
    const copyBtn = document.getElementById('copyCalcResult');
    const settingsGrid = document.getElementById('percentageSettingsGrid');
    const resetBtn = document.getElementById('resetPercentages');

    let percentageInputs = {};

    // --- Main Calculation Logic ---
    function calculate() {
        const rawValue = parseFloat(calcInput.value);

        if (isNaN(rawValue) || rawValue <= 0) {
            resultWrapper.style.display = 'none';
            clearCalcInputBtn.style.display = 'none';
            return;
        }

        clearCalcInputBtn.style.display = 'block';
        resultWrapper.style.display = 'block';

        let percentage = 0;
        let appliedTier = '';

        const tiers = Object.keys(percentageInputs).sort((a, b) => {
            return parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]);
        });

        for (const tier of tiers) {
            const currentPercentage = parseFloat(percentageInputs[tier].value) || 0;
            if (tier.includes('+')) {
                const lower = parseInt(tier.replace('+', ''));
                if (rawValue >= lower) {
                    percentage = currentPercentage;
                    appliedTier = tier;
                }
            } else {
                const [lower, upper] = tier.split('-').map(Number);
                if (rawValue >= lower && rawValue <= upper) {
                    percentage = currentPercentage;
                    appliedTier = tier;
                }
            }
        }

        const finalValue = rawValue + (rawValue * (percentage / 100));

        const formatter = new Intl.NumberFormat('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        resultEl.textContent = formatter.format(finalValue);
        percentageNoteEl.textContent = `${formatter.format(percentage)}% hinzugefügt (Stufe: ${appliedTier})`;
    }

    // --- Setup and Event Listeners ---
    function setupCalculator() {
        // 1. Populate settings grid
        settingsGrid.innerHTML = '';
        Object.entries(defaultPercentages).forEach(([tier, value]) => {
            const item = document.createElement('div');
            item.className = 'percentage-item';
            
            const label = document.createElement('label');
            label.textContent = `Stufe ${tier}`;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.value = value;
            input.dataset.tier = tier;
            input.addEventListener('input', calculate);

            item.appendChild(label);
            item.appendChild(input);
            settingsGrid.appendChild(item);

            percentageInputs[tier] = input;
        });

        // 2. Attach event listeners
        calcInput.addEventListener('input', calculate);
        clearCalcInputBtn.addEventListener('click', () => {
            calcInput.value = '';
            calculate();
        });

        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(resultEl.textContent).then(() => {
                showToast('Ergebnis erfolgreich kopiert!');
            }).catch(err => {
                showToast('Kopieren fehlgeschlagen!');
                console.error('Failed to copy: ', err);
            });
        });

        resetBtn.addEventListener('click', () => {
            Object.entries(defaultPercentages).forEach(([tier, value]) => {
                percentageInputs[tier].value = value;
            });
            calculate();
            showToast('Standardwerte wiederhergestellt.');
        });

        // Initial calculation
        calculate();
    }

    setupCalculator();
});


// --- REMINDER LOGIC (V3) ---
const reminderTextEl = document.getElementById('reminderText');
const reminderNoteEl = document.getElementById('reminderNote');
const reminderDateEl = document.getElementById('reminderDate');
const reminderTimeEl = document.getElementById('reminderTime');
const addReminderBtn = document.getElementById('addReminderBtn');
const remindersListEl = document.getElementById('remindersList');
const addNotificationRuleBtn = document.getElementById('addNotificationRuleBtn');
const notificationRulesContainer = document.getElementById('notificationRulesContainer');

// Notification elements
const reminderNotificationBtn = document.getElementById('reminderNotificationBtn');
const reminderCountEl = document.getElementById('reminderCount');
const reminderNotificationDropdown = document.getElementById('reminderNotificationDropdown');
const notificationRemindersListEl = document.getElementById('notificationRemindersList');
const closeReminderDropdownBtn = document.getElementById('closeReminderDropdown');
const goToRemindersPageBtn = document.getElementById('goToRemindersPage');

// --- Storage Keys ---
const REMINDERS_KEY = 'reminders_v3';
const TRIGGERED_NOTIFICATIONS_KEY = 'triggeredNotifications_v3';

// --- Data Access ---
function getReminders() {
    return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]');
}

function saveReminders(reminders) {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    // No direct UI update here, the checker loop handles notifications
}

function getTriggeredNotifications() {
    return JSON.parse(localStorage.getItem(TRIGGERED_NOTIFICATIONS_KEY) || '[]');
}

function saveTriggeredNotifications(notifications) {
    localStorage.setItem(TRIGGERED_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    updateReminderNotificationUI(); // Update UI whenever triggered notifications change
}


// --- UI Functions ---

function addNotificationRule(type = 'at_due_date', value = '') {
    if (!notificationRulesContainer) return;

    const ruleDiv = document.createElement('div');
    ruleDiv.className = 'notification-rule';

    const typeSelect = document.createElement('select');
    typeSelect.className = 'rule-type';
    typeSelect.innerHTML = `
        <option value="at_due_date">Zum Fälligkeitsdatum</option>
        <option value="hours_before">Stunden vorher</option>
        <option value="days_before">Tage vorher</option>
    `;
    typeSelect.value = type;

    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.className = 'value-input';
    valueInput.style.display = 'none';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-icon danger remove-notification-rule';
    removeBtn.innerHTML = '<i data-lucide="x"></i>';
    removeBtn.onclick = () => {
        if (notificationRulesContainer.children.length > 1) {
            ruleDiv.remove();
            // After removal, if only one rule remains, hide its remove button
            if (notificationRulesContainer.children.length === 1) {
                notificationRulesContainer.querySelector('.remove-notification-rule').style.display = 'none';
            }
        } else {
            showToast('Es muss mindestens eine Benachrichtigungsregel vorhanden sein.');
        }
    };

    const handleTypeChange = () => {
        const selectedType = typeSelect.value;
        if (selectedType === 'hours_before') {
            valueInput.style.display = 'block';
            valueInput.min = 1;
            valueInput.max = 12;
            valueInput.placeholder = '1-12';
        } else if (selectedType === 'days_before') {
            valueInput.style.display = 'block';
            valueInput.min = 1;
            valueInput.max = 7;
            valueInput.placeholder = '1-7';
        } else {
            valueInput.style.display = 'none';
        }
    };

    typeSelect.onchange = handleTypeChange;
    
    ruleDiv.appendChild(typeSelect);
    ruleDiv.appendChild(valueInput);
    ruleDiv.appendChild(removeBtn);
    notificationRulesContainer.appendChild(ruleDiv);
    
    if (value) valueInput.value = value;
    handleTypeChange();

    // Update visibility of all remove buttons
    const allRemoveButtons = notificationRulesContainer.querySelectorAll('.remove-notification-rule');
    if (allRemoveButtons.length > 1) {
        allRemoveButtons.forEach(btn => btn.style.display = 'inline-flex');
    } else {
        // If there's only one rule, hide its remove button
        allRemoveButtons.forEach(btn => btn.style.display = 'none');
    }

    if (window.lucide) window.lucide.createIcons();
}

if (addNotificationRuleBtn) {
    addNotificationRuleBtn.onclick = () => addNotificationRule();
}

function renderReminders() {
    if (!remindersListEl) return;

    const reminders = getReminders().sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    if (reminders.length === 0) {
        remindersListEl.innerHTML = '<p>Keine Einträge vorhanden.</p>';
        return;
    }

    remindersListEl.innerHTML = reminders.map(rem => {
        const isAufgabe = rem.type === 'Aufgabe';
        const typeIcon = isAufgabe ? 'clipboard-check' : 'bell';
        
        const notificationsHtml = rem.notifications.map(n => {
            let text = 'Zum Fälligkeitsdatum';
            if (n.type === 'hours_before') text = `${n.value} Stunde(n) vorher`;
            if (n.type === 'days_before') text = `${n.value} Tag(e) vorher`;
            return `<li><i data-lucide="bell-ring" class="icon-sm"></i> ${escapeHtml(text)}</li>`;
        }).join('');

        return `
        <div class="saved-inv ${rem.completed ? 'completed-reminder' : ''}" data-id="${rem.id}">
            <div class="reminder-details">
                <div class="reminder-header">
                    <i data-lucide="${typeIcon}" class="type-icon"></i>
                    <b>${escapeHtml(rem.text)}</b>
                </div>
                <small class="due-date">Fällig am: ${escapeHtml(rem.date)} um ${escapeHtml(rem.time)} Uhr</small>
                ${rem.note ? `<p class="reminder-note">${escapeHtml(rem.note)}</p>` : ''}
                <ul class="notification-list-display">
                    ${notificationsHtml}
                </ul>
            </div>
            <div class="card-actions">
                <button class="btn btn-icon btn-secondary edit-reminder" data-id="${rem.id}" title="Eintrag bearbeiten">
                    <i data-lucide="edit"></i>
                </button>
                <button class="btn btn-icon ${rem.completed ? 'btn-secondary' : 'btn-primary'} toggle-complete-reminder" data-id="${rem.id}" title="${rem.completed ? 'Als unerledigt markieren' : 'Als erledigt markieren'}">
                    <i data-lucide="${rem.completed ? 'rotate-ccw' : 'check'}"></i>
                </button>
                <button class="btn btn-icon danger delete-reminder" data-id="${rem.id}" title="Eintrag löschen">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `}).join('');

    if (window.lucide) window.lucide.createIcons();

    remindersListEl.querySelectorAll('.delete-reminder').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.currentTarget.dataset.id;
            if (confirm('Soll dieser Eintrag wirklich gelöscht werden?')) {
                saveReminders(getReminders().filter(rem => rem.id !== id));
                renderReminders();
            }
        };
    });

    remindersListEl.querySelectorAll('.toggle-complete-reminder').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.currentTarget.dataset.id;
            const reminders = getReminders();
            const index = reminders.findIndex(rem => rem.id === id);
            if (index > -1) {
                reminders[index].completed = !reminders[index].completed;
                saveReminders(reminders);
                renderReminders();
            }
        };
    });

    remindersListEl.querySelectorAll('.edit-reminder').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.currentTarget.dataset.id;
            loadReminderForEdit(id);
        };
    });
}

let editingReminderId = null; // Global variable to store the ID of the reminder being edited

function loadReminderForEdit(id) {
    const reminders = getReminders();
    const reminderToEdit = reminders.find(rem => rem.id === id);

    if (!reminderToEdit) {
        alert('Erinnerung nicht gefunden.');
        return;
    }

    editingReminderId = id;
    reminderTextEl.value = reminderToEdit.text;
    reminderNoteEl.value = reminderToEdit.note;
    reminderDateEl.value = reminderToEdit.date;
    reminderTimeEl.value = reminderToEdit.time;

    // Set radio button for type
    document.querySelector(`input[name="entryType"][value="${reminderToEdit.type}"]`).checked = true;

    // Clear existing notification rules and load the ones from the reminder
    notificationRulesContainer.innerHTML = '';
    if (reminderToEdit.notifications && reminderToEdit.notifications.length > 0) {
        reminderToEdit.notifications.forEach(rule => {
            addNotificationRule(rule.type, rule.value);
        });
    } else {
        addNotificationRule(); // Ensure at least one rule is present
    }
    

    // Change button text and icon
    addReminderBtn.querySelector('span').textContent = 'Änderungen speichern';
    addReminderBtn.querySelector('i').setAttribute('data-lucide', 'save');
    if(window.lucide) window.lucide.createIcons();

    addReminderBtn.classList.remove('btn-primary');
    addReminderBtn.classList.add('btn-secondary');
    document.getElementById('cancelEditReminderBtn').style.display = 'inline-flex'; // Show cancel button

    // Scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// NEU: Event-Listener für den Abbrechen-Button
const cancelEditReminderBtn = document.getElementById('cancelEditReminderBtn');
if (cancelEditReminderBtn) {
    cancelEditReminderBtn.onclick = () => {
        resetReminderForm();
    };
}

if (addReminderBtn) {
    addReminderBtn.addEventListener('click', () => {
        const type = document.querySelector('input[name="entryType"]:checked').value;
        const text = reminderTextEl.value.trim();
        const note = reminderNoteEl.value.trim();
        const date = reminderDateEl.value;
        const time = reminderTimeEl.value;

        if (!text || !date || !time) {
            showToast('Bitte füllen Sie Titel, Fälligkeitsdatum und -zeit aus.', 'error');
            return;
        }

        const notificationRules = [];
        notificationRulesContainer.querySelectorAll('.notification-rule').forEach(ruleEl => {
            const type = ruleEl.querySelector('.rule-type').value;
            const valueInput = ruleEl.querySelector('.value-input');
            const value = valueInput.style.display === 'block' ? valueInput.value : '';

            // Basic validation for value inputs
            if ((type === 'hours_before' || type === 'days_before') && (!value || parseInt(value) <= 0)) {
                showToast('Bitte geben Sie einen gültigen Wert für die Benachrichtigungsregel ein.', 'error');
                return; // Stop processing and alert user
            }
            
            // Assign a unique ID to each rule for tracking
            notificationRules.push({ id: `notif_${Date.now()}_${Math.random()}`, type, value, triggered: false });
        });
        
        if (notificationRules.length === 0) {
            showToast('Bitte fügen Sie mindestens eine Benachrichtigungsregel hinzu.', 'error');
            return;
        }

        let currentReminders = getReminders();
        if (editingReminderId) {
            // Update existing reminder
            const index = currentReminders.findIndex(rem => rem.id === editingReminderId);
            if (index > -1) {
                // This block updates the existing reminder with the new form data.
                currentReminders[index] = {
                    ...currentReminders[index], // Keep existing properties like 'completed'
                    type,
                    text,
                    note,
                    date,
                    time,
                    notifications: notificationRules
                };
                showToast('Erinnerung aktualisiert!');
            }
            editingReminderId = null; // Reset editing state
        } else {
            // Add new reminder
            const newEntry = {
                id: `rem_${Date.now()}`,
                type,
                text,
                note,
                date,
                time,
                notifications: notificationRules,
                completed: false
            };
            currentReminders.push(newEntry);
            showToast(`${type} hinzugefügt!`);
        }
        
        saveReminders(currentReminders);
        resetReminderForm();
        renderReminders();
    });
}

// NEU: Funktion zum Zurücksetzen des Erinnerungsformulars
function resetReminderForm() {
    editingReminderId = null;
    reminderTextEl.value = '';
    reminderNoteEl.value = '';
    reminderDateEl.value = '';
    reminderTimeEl.value = '';
    notificationRulesContainer.innerHTML = '';
    addNotificationRule(); // Add one default rule
    
    addReminderBtn.querySelector('span').textContent = 'Eintrag hinzufügen';
    addReminderBtn.querySelector('i').setAttribute('data-lucide', 'plus');
    if(window.lucide) window.lucide.createIcons();

    addReminderBtn.classList.remove('btn-secondary');
    addReminderBtn.classList.add('btn-primary');
    document.getElementById('cancelEditReminderBtn').style.display = 'none'; // Hide cancel button
}

// --- Notification Logic ---

function checkRemindersDue() {
    const now = new Date();
    const allReminders = getReminders();
    let remindersModified = false;

    allReminders.forEach(rem => {
        if (rem.completed) return;

        const dueDate = new Date(`${rem.date}T${rem.time}`);

        rem.notifications.forEach(rule => {
            if (rule.triggered) return;

            let triggerTime = new Date(dueDate);
            if (rule.type === 'hours_before') {
                triggerTime.setHours(triggerTime.getHours() - parseInt(rule.value, 10));
            } else if (rule.type === 'days_before') {
                triggerTime.setDate(triggerTime.getDate() - parseInt(rule.value, 10));
            }

            if (now >= triggerTime) {
                console.log(`Triggering notification for: ${rem.text}`);
                // Show system notification
                new Notification(rem.type, {
                    body: rem.text,
                    icon: './favicon.ico' // Optional: Add an icon
                });

                // Add to triggered list
                const triggered = getTriggeredNotifications();
                triggered.push({
                    id: `trig_${Date.now()}`,
                    text: rem.text,
                    type: rem.type,
                    due: `${rem.date} ${rem.time}`
                });
                saveTriggeredNotifications(triggered);

                // Mark as triggered in original reminder
                rule.triggered = true;
                remindersModified = true;
            }
        });
    });

    if (remindersModified) {
        saveReminders(allReminders);
    }
}

function updateReminderNotificationUI() {
    if (!reminderCountEl || !notificationRemindersListEl) return;

    const triggeredNotifications = getTriggeredNotifications();
    
    reminderCountEl.textContent = triggeredNotifications.length;
    reminderCountEl.style.display = triggeredNotifications.length > 0 ? 'flex' : 'none';

    if (triggeredNotifications.length === 0) {
        notificationRemindersListEl.innerHTML = '<p class="no-reminders">Keine neuen Benachrichtigungen.</p>';
    } else {
        notificationRemindersListEl.innerHTML = triggeredNotifications.map(n => `
            <div class="notification-item" data-id="${n.id}">
                <div class="notification-item-text">
                    <b>${escapeHtml(n.type)}: ${escapeHtml(n.text)}</b>
                    <small>Fällig: ${escapeHtml(n.due)}</small>
                </div>
            </div>
        `).join('');
    }
    
    // Add "Clear All" button if not present
    let clearBtn = reminderNotificationDropdown.querySelector('.clear-all-notifications');
    if (!clearBtn) {
        clearBtn = document.createElement('button');
        clearBtn.className = 'btn btn-text danger clear-all-notifications';
        clearBtn.textContent = 'Alle löschen';
        clearBtn.onclick = (e) => {
            e.stopPropagation();
            saveTriggeredNotifications([]);
        };
        // Insert it in the footer
        const footer = reminderNotificationDropdown.querySelector('.notification-footer');
        if(footer) footer.prepend(clearBtn);
    }
}


// --- Event Listeners & Initial Load ---

if (reminderNotificationBtn) {
    reminderNotificationBtn.onclick = (e) => {
        e.stopPropagation();
        updateReminderNotificationUI(); // Ensure list is up-to-date before showing
        reminderNotificationDropdown.classList.toggle('show');
    };
}

if (closeReminderDropdownBtn) {
    closeReminderDropdownBtn.onclick = () => reminderNotificationDropdown.classList.remove('show');
}

if (goToRemindersPageBtn) {
    goToRemindersPageBtn.onclick = () => {
        showPage('reminders');
        reminderNotificationDropdown.classList.remove('show');
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = 'Erinnerungen';
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
        document.getElementById('navReminders')?.classList.add('active');
    };
}

document.addEventListener('click', (e) => {
    if (reminderNotificationDropdown && !reminderNotificationDropdown.contains(e.target) && !reminderNotificationBtn.contains(e.target)) {
        reminderNotificationDropdown.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Request permission for notifications
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    if(document.getElementById('pageReminders')) {
        resetReminderForm(); // Initialize form with a default rule and reset state
    }
    
    renderReminders();
    updateReminderNotificationUI();

    // Start the reminder checker
    setInterval(checkRemindersDue, 60000); // Check every minute
    checkRemindersDue(); // Also check once on load
});
