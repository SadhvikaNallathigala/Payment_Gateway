function login(){

const email =
document.getElementById("email").value.trim();

const password =
document.getElementById("password").value.trim();

const message =
document.getElementById("loginMessage");

if(
email==="admin@biztab.com" &&
password==="1234"
){

message.innerHTML="✅ Login Successful";

setTimeout(()=>{
window.location.href="index.html";
},1000);

}else{

message.innerHTML="❌ Invalid Credentials";

}

}

function startPayment(){

  if(paymentMethod === "card"){

    const name =
    document.getElementById("cardName").value.trim();

    const card =
    document.getElementById("cardNumber")
    .value.replace(/\s/g,'');

    const exp =
    document.getElementById("expiry").value.trim();

    const cvv =
    document.getElementById("cvv").value.trim();

   if(!/^[A-Za-z ]+$/.test(name)){

  alert(
  "Cardholder Name should contain letters only"
  );

  return;
}

    if(!/^\d{16}$/.test(card)){

      alert("Card Number must be 16 digits");
      return;
    }

    if(!/^\d{2}\/\d{2}$/.test(exp)){

  alert("Use MM/YY format");

  return;
}

const parts = exp.split("/");

const month = parseInt(parts[0]);

const year = parseInt(parts[1]);

if(month < 1 || month > 12){

  alert("Invalid Expiry Month");

  return;
}

const currentYear =
new Date().getFullYear() % 100;

if(year < currentYear){

  alert("Card Expired");

  return;
}

    if(!/^\d{3}$/.test(cvv)){

      alert("CVV must be 3 digits");
      return;
    }
  }

  if(paymentMethod === "upi"){

    const upi =
    document.getElementById("upiId").value.trim();

    if(upi === ""){

      alert("Enter UPI ID");
      return;
    }

    if(!upi.includes("@")){

      alert("Enter Valid UPI ID");
      return;
    }
  }

  if(paymentMethod === "bank"){

    const bank =
    document.getElementById("bankName").value;

    const account =
    document.getElementById("accountNumber")
    .value.trim();

    if(bank === ""){

      alert("Select Bank");
      return;
    }

    if(account.length < 8){

      alert("Enter Valid Account Number");
      return;
    }
  }

  document.getElementById("otpModal")
  .style.display = "flex";
}

function verifyOTP(){

  const otp =
  document.getElementById("o1").value +
  document.getElementById("o2").value +
  document.getElementById("o3").value +
  document.getElementById("o4").value;

  if(otp === "1234"){

    document.getElementById("otpModal")
    .style.display = "none";

    const txnId =
    "TXN" +
    Math.floor(
      100000 + Math.random()*900000
    );

    document.getElementById(
"txnId"
).innerText = txnId;

document.getElementById(
"successModal"
).style.display = "flex";

  }else{

    document.getElementById("otpModal")
    .style.display = "none";

    showFailure(
"Invalid OTP Entered"
);
  }
}

function formatCard(input){

  let value =
  input.value.replace(/\D/g,'');

  value =
  value.substring(0,16);

  value =
  value.match(/.{1,4}/g)?.join(' ') || value;

  input.value = value;
}

function formatExpiry(input){

  let value =
  input.value.replace(/\D/g,'');

  if(value.length > 4){

    value =
    value.substring(0,4);
  }

  if(value.length >= 3){

    value =
    value.substring(0,2)
    + "/"
    + value.substring(2);
  }

  input.value = value;
}

function formatCVV(input){

  input.value =
  input.value
  .replace(/\D/g,'')
  .substring(0,3);
}

function nextOTP(current,next){

  if(current.value.length === 1){

    document
    .getElementById(next)
    .focus();
  }
}

let paymentMethod = "card";

function showMethod(type, element){

paymentMethod = type;

document
.querySelectorAll(".method-box")
.forEach(box =>
box.classList.remove("active")
);

element.classList.add("active");

document.getElementById(
"cardSection"
).style.display="none";

document.getElementById(
"upiSection"
).style.display="none";

document.getElementById(
"bankSection"
).style.display="none";

if(type==="card"){

document.getElementById(
"cardSection"
).style.display="block";

}

if(type==="upi"){

document.getElementById(
"upiSection"
).style.display="block";

}

if(type==="bank"){

document.getElementById(
"bankSection"
).style.display="block";

}
}

function closeSuccess(){

  document.getElementById(
  "successModal"
  ).style.display = "none";

  document
  .querySelectorAll("input")
  .forEach(input => {

    input.value = "";
  });

  document
  .querySelectorAll("select")
  .forEach(select => {

    select.selectedIndex = 0;
  });

  document.getElementById(
  "cardSection"
  ).style.display = "block";

  document.getElementById(
  "upiSection"
  ).style.display = "none";

  document.getElementById(
  "bankSection"
  ).style.display = "none";

  paymentMethod = "card";

  document
  .querySelectorAll(".method-box")
  .forEach(box => {

    box.classList.remove("active");
  });

  document
  .querySelector(".method-box")
  .classList.add("active");
}

function showFailure(reason){

  document.getElementById(
  "failureReason"
  ).innerText = reason;

  document.getElementById(
  "failedModal"
  ).style.display = "flex";
}

function closeFailed(){

  document.getElementById(
  "failedModal"
  ).style.display = "none";
}

