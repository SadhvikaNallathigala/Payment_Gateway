<div align="center">

<img src="https://img.shields.io/badge/BizTab-Internship%20Assignment-0f172a?style=for-the-badge&labelColor=1e293b" />

# 💳 Payment Gateway Simulator

**A fully client-side payment gateway simulation built for the BizTab Consulting Internship.**  
Covers authentication, multi-method payment processing, OTP verification, and transaction handling — zero dependencies, zero backend.

<br/>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Fonts](https://img.shields.io/badge/Google%20Fonts-4285F4?style=for-the-badge&logo=google&logoColor=white)

<br/>

![Status](https://img.shields.io/badge/Status-Complete-22c55e?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)
![PRs](https://img.shields.io/badge/PRs-Welcome-f59e0b?style=flat-square)
![No Dependencies](https://img.shields.io/badge/Dependencies-None-ec4899?style=flat-square)

</div>

---

## 📖 Overview

This project simulates a production-style payment gateway experience — built entirely on the frontend without any frameworks or backend services. It was developed as the **Payment Processing** module demo for the BizTab O2D (Order-to-Delivery) internship assignment.

The simulator walks users through a complete payment lifecycle: from login and method selection to field validation, OTP authentication, and transaction result display.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication
- Dedicated login page
- Credential validation before portal access

### 💳 Payment Methods
- **Card** — Number, name, expiry, CVV
- **UPI** — ID input + Google Pay / PhonePe / Paytm quick-select
- **Net Banking** — SBI, HDFC, ICICI, Axis Bank

### ✅ Real-Time Validation
- Card number auto-formatted in groups of 4
- Expiry auto-formatted as MM/YY
- CVV capped at 3 digits
- UPI ID pattern check
- All required fields enforced

</td>
<td width="50%">

### 🔑 OTP Verification
- 4-digit OTP with auto-focus flow
- Demo OTP: `1234`
- Invalid OTP error feedback
- Resend OTP placeholder

### 📊 Transaction Results
- ✅ **Success modal** — auto-generated Transaction ID + receipt
- ❌ **Failure modal** — contextual error reason + retry

### 🎨 UX Details
- Responsive for desktop & mobile
- Security badges (SSL, PCI DSS, Bank Grade, 24/7)
- Order summary panel with live total
- Smooth modal transitions

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Tool | Purpose |
|---|---|---|
| ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat&logo=html5&logoColor=white) | **HTML5** | Page structure, forms, modals |
| ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat&logo=css3&logoColor=white) | **CSS3** | Styling, layout, animations, responsiveness |
| ![JS](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | **Vanilla JS (ES6)** | Validation logic, OTP flow, modal control |
| ![Google Fonts](https://img.shields.io/badge/-Poppins-4285F4?style=flat&logo=google&logoColor=white) | **Google Fonts — Poppins** | Clean, modern typography |

> No npm. No build step. No frameworks. Open `login.html` and it works.

---

## 📂 Project Structure

```
Payment_Gateway/
│
├── 📄 login.html        → Authentication page (entry point)
├── 📄 index.html        → Main payment interface
├── 🎨 style.css         → All styles, responsive layout, modal animations
├── ⚙️  script.js         → Validation, OTP logic, modal control, transaction flow
└── 📘 README.md
```

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/SadhvikaNallathigala/Payment_Gateway.git

# 2. Navigate into the folder
cd Payment_Gateway

# 3. Open in browser — no build needed
open login.html          # macOS
start login.html         # Windows
xdg-open login.html      # Linux
```

### 🧪 Demo Credentials

| Field | Value |
|---|---|
| OTP | `1234` |
| Payment Amount | ₹1,999 (fixed demo order) |

---

## 🔄 Payment Flow

```
┌─────────────────────┐
│      Login Page      │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Payment Dashboard   │  ← Order summary + method selection
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   Fill Payment Form  │  ← Card / UPI / Net Banking
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Validation Check    │
└──────┬────────┬─────┘
       │ pass   │ fail
       ↓        ↓
┌──────────┐  ┌────────────────────┐
│ OTP Modal│  │ ❌ Failure Modal    │
└────┬─────┘  │   (error + retry)  │
     │        └────────────────────┘
  ┌──┴──┐
  │1234 │
  └──┬──┘
     ↓
┌────────────────────┐
│ ✅ Success Modal    │
│  (TXN ID + receipt) │
└────────────────────┘
```

---

## 🗺️ O2D Business Context

This project implements the ⭐ **Payment Processing** stage of a full Order-to-Delivery workflow:

```
Customer Places Order
        ↓
  Order Validation
        ↓
 Inventory Stock Check
        ↓
  Order Confirmation
        ↓
  ★ Payment Processing  ← This project
        ↓
  Order Fulfillment
        ↓
 Shipment Initiation
        ↓
 Logistics / Transport
        ↓
  Delivery to Customer
        ↓
 Delivery Confirmation
```

---

## 🔮 Future Enhancements

| Enhancement | Tech |
|---|---|
| Real backend processing | Node.js / FastAPI |
| Actual OTP delivery | Twilio SMS / SendGrid Email |
| Payment API integration | Razorpay / Stripe / PayU |
| Auth system | JWT + bcrypt |
| Transaction history | MongoDB / PostgreSQL |
| Admin dashboard | React + Chart.js |

---

## 📎 Resources

- 🎥 [Google Drive — PPT + Demo Videos](https://drive.google.com/drive/folders/16uSAPNxYbXHtlH6PzIY0Gcvv_6kZs_ON?usp=sharing)
- 💻 [GitHub Repository](https://github.com/SadhvikaNallathigala/Payment_Gateway)

---

## 👩‍💻 Author

<div align="center">

**Sadhvika Nallathigala**

[![GitHub](https://img.shields.io/badge/GitHub-SadhvikaNallathigala-181717?style=for-the-badge&logo=github)](https://github.com/SadhvikaNallathigala)

Student ID: `23STUCHH011375`

</div>

---

<div align="center">

*Built for the BizTab Consulting Internship Assignment · Demonstrating payment gateway architecture, O2D business process modeling, and frontend development.*

</div>
