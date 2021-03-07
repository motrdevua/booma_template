function installmentPlan() {
  const ccLocalParams = '&cred_type=8&maxpay=12';
  const locationLang = window.location.pathname.split('/')[1];
  const installmentPlanBox = document.querySelector('.installment-plan');
  const installmentPlanMonths = ccLocalParams.split('=')[2];
  const credType = +ccLocalParams.split('=')[1].split('&')[0];

  if (credType !== 1) {
    switch (locationLang) {
      case 'ru':
        installmentPlanBox.innerHTML = `(до <span>${installmentPlanMonths}</span> платежей без %)`;
        break;
      case 'he':
        installmentPlanBox.innerHTML = `(עד <span>${installmentPlanMonths}</span> תשלומים ללא ריבית)`;
        break;
      case 'ar':
        installmentPlanBox.innerHTML = `(حتى <span>${installmentPlanMonths}</span> أقساط بدون ربا)`;
        break;

      default:
        installmentPlanBox.innerHTML = `(до <span>${installmentPlanMonths}</span> платежей без %)`;
        break;
    }
  } else {
    installmentPlanBox.innerHTML = '';
  }
}

installmentPlan();
