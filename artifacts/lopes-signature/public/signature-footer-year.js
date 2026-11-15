const signatureYear = new Intl.DateTimeFormat("pt-BR", {
  year: "numeric",
  timeZone: "America/Sao_Paulo",
}).format();

document.querySelectorAll("[data-signature-footer-year]").forEach((element) => {
  element.textContent = signatureYear;
});
