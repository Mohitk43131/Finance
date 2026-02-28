// --- 1. FIREBASE SETUP & IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA45woJ-QeDGpk7KkS_jkSaXuBTnqkzcQ8",
  authDomain: "next-streaming-645b2.firebaseapp.com",
  databaseURL: "https://next-streaming-645b2-default-rtdb.firebaseio.com",
  projectId: "next-streaming-645b2",
  storageBucket: "next-streaming-645b2.firebasestorage.app",
  messagingSenderId: "353530200083",
  appId: "1:353530200083:web:f82a1534b65ac4bbe5ffe6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// 🔴 ADD YOUR ADMIN EMAILS HERE 🔴
const ADMIN_EMAILS = ["mohitk43131@gmail.com"]; 

let allTransactions = []; // Holds the real-time data locally
let profitChartInst, expenseChartInst;
const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// --- 2. AUTHENTICATION LOGIC ---
document.getElementById('googleSignInBtn').addEventListener('click', () => {
    signInWithPopup(auth, provider).catch(error => alert("Login Failed: " + error.message));
});

document.getElementById('guestBtn').addEventListener('click', () => {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('userInfo').innerHTML = `Guest <span class="badge" style="background: #718096;">VISITOR</span>`;
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    signOut(auth).then(() => {
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('adminForm').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('userInfo').innerHTML = '';
    });
});

// Listen for Login State Changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';

        const isAdmin = ADMIN_EMAILS.includes(user.email);
        
        if (isAdmin) {
            document.getElementById('adminForm').style.display = 'block'; 
            document.getElementById('userInfo').innerHTML = `${user.displayName} <span class="badge">ADMIN</span>`;
        } else {
            document.getElementById('adminForm').style.display = 'none'; 
            document.getElementById('userInfo').innerHTML = `${user.displayName} <span class="badge" style="background: #718096;">VISITOR</span>`;
        }
    }
});


// --- 3. UI CONTROLS & DATE HELPERS ---
document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const html = document.documentElement;
    html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

function setDateTimeDefaults() {
    document.getElementById('transactionDate').valueAsDate = new Date();
    document.getElementById('transactionTime').value = new Date().toTimeString().slice(0,5);
}
setDateTimeDefaults();


// --- 4. REAL-TIME DATABASE FETCHING ---
// This runs automatically whenever data is added, changed, or deleted in Firebase!
const financesRef = ref(db, 'finances');
onValue(financesRef, (snapshot) => {
    const data = snapshot.val();
    allTransactions = []; // Reset array
    
    if (data) {
        // Convert Firebase object into an array and sort by date
        allTransactions = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        allTransactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
    }
    
    updateDashboardUI(); // Redraw charts with new data
});


// --- 5. DASHBOARD RENDERING ---
function updateDashboardUI() {
    const days = parseInt(document.getElementById('timeFilter').value);
    const selectedChartType = document.getElementById('chartType').value;
    
    // Update text showing the date range
    const infoEl = document.getElementById('daysInfo');
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);
    
    if(days === 9999) infoEl.innerText = "Showing All Time Data";
    else infoEl.innerText = `Showing data from ${pastDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})} to ${today.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}`;

    // Filter transactions based on date
    const filteredTransactions = allTransactions.filter(t => {
        if (days === 9999) return true;
        const tDate = new Date(t.transactionDate);
        return tDate >= pastDate;
    });

    let runningProfit = 0;
    let incomeTotal = 0;
    let expenseTotal = 0;
    let dates = [];
    let profitData = [];

    filteredTransactions.forEach(t => {
        const amt = parseFloat(t.amount);
        if(t.type === 'INCOME') { runningProfit += amt; incomeTotal += amt; } 
        else { runningProfit -= amt; expenseTotal += amt; }
        
        dates.push(t.transactionDate);
        profitData.push(runningProfit);
    });

    // Update Top Cards
    document.getElementById('totalRevenue').innerText = formatter.format(incomeTotal);
    document.getElementById('totalExpense').innerText = formatter.format(expenseTotal);
    const netProfit = incomeTotal - expenseTotal;
    const profitEl = document.getElementById('netProfit');
    profitEl.innerText = formatter.format(netProfit);
    profitEl.className = netProfit >= 0 ? 'profit-positive' : 'profit-negative';

    // Draw Profit Chart
    if(profitChartInst) profitChartInst.destroy();
    profitChartInst = new Chart(document.getElementById('profitChart'), {
        type: selectedChartType,
        data: {
            labels: dates.length > 0 ? dates : ['No Data'],
            datasets: [{ label: 'Net Profit ($)', data: profitData.length > 0 ? profitData : [0], backgroundColor: '#4318FF', borderColor: '#4318FF', tension: 0.3 }]
        }
    });

    // Draw Expense Chart
    if(expenseChartInst) expenseChartInst.destroy();
    expenseChartInst = new Chart(document.getElementById('expenseChart'), {
        type: 'doughnut',
        data: {
            labels: ['Total Income', 'Total Expense'],
            datasets: [{ data: [incomeTotal, expenseTotal], backgroundColor: ['#01B574', '#EE5D50'], borderWidth: 0 }]
        }
    });
}

// Redraw when filters change
document.getElementById('timeFilter').addEventListener('change', updateDashboardUI);
document.getElementById('chartType').addEventListener('change', updateDashboardUI);


// --- 6. FORM SUBMISSION (WRITE TO FIREBASE) ---
document.getElementById('financeForm').addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    // Create a new reference with an auto-generated ID in the 'finances' node
    const newTransactionRef = push(ref(db, 'finances'));
    
    const transactionData = {
        title: document.getElementById('title').value,
        type: document.getElementById('type').value,
        amount: parseFloat(document.getElementById('amount').value),
        transactionDate: document.getElementById('transactionDate').value,
        transactionTime: document.getElementById('transactionTime').value
    };

    // Save the data
    set(newTransactionRef, transactionData)
        .then(() => {
            document.getElementById('financeForm').reset();
            setDateTimeDefaults();
            // Note: We don't need to call updateDashboardUI() here because the 'onValue' listener at the top will trigger automatically!
        })
        .catch((error) => {
            alert("Error saving data: " + error.message);
        });
});
