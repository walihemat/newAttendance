export const hideAlert = (type) => {
  const alertEl = document.querySelector(".alert");
  window.setTimeout(() => {
    alertEl.classList.add("d-none");
    alertEl.classList.remove(`alert-${type}`);
  }, 5000);
};

export const showAlert = (type, msg) => {
  const alertEl = document.querySelector(".alert");
  alertEl.classList.add(`alert-${type}`);
  alertEl.textContent = msg;
  hideAlert(type);
  alertEl.classList.remove("d-none");
};
