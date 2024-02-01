// Automatically remove the alert message after a few seconds
const alertElement = document.getElementById("alert");
if (alertElement) {
  setTimeout(() => {
    alertElement.style.display = "none";
  }, 5000); // 5000 milliseconds (5 seconds)
}
