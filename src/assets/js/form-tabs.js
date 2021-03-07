let isCCPaymentAvaliable = true;
let defaultUserAction =
  'lf'; /* lf - leadform, pp, paypal, cc - credit card terminal, no - no useraction (for articles) */
const isPaymentTabDefault = false;

const basket = {
  basketAvailable: false,
  productButtonTextBefore: 'в корзину',
  productButtonTextAfter: 'добавлено',
  productUnavailabilityText: 'нет в наличии',
};

// Логика показа и переключения табов в форме
const formWrapper = document.querySelector('#form__wrapper');
const tabsWrapper = document.querySelector('.tabs');

const tabs = document.querySelectorAll('.tab');
const consultantTab = document.querySelector('.pay_call__tab');
const creditCardTab = document.querySelector('.pay_card__tab');

const tabsContent = document.querySelectorAll('.tab_item');
const consultant = document.querySelector('#consultant_payment');
const creditCard = document.querySelector('#cc_payment');

// Show(1) / Hide(0) tabs && tabs content
function setParams(consultTab, creditTab) {
  if (consultTab) {
    consultantTab.classList.add('active');
    consultant.style.display = 'block';
  } else {
    consultantTab.classList.remove('active');
    consultant.style.display = 'none';
  }
  if (creditTab) {
    creditCardTab.classList.add('active');
    creditCard.style.display = 'block';
  } else {
    creditCardTab.classList.remove('active');
    creditCard.style.display = 'none';
  }
}

function formTabsLogic() {
  /**
   * * Tabs switching
   */
  tabs.forEach((tab) => {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      for (let i = 0; i < tabs.length; i += 1) {
        tabs[i].classList.remove('active');
        if (this.dataset.tab !== tabsContent[i].id) {
          tabsContent[i].style.display = 'none';
        } else {
          tabsContent[i].style.display = 'block';
        }
      }
      this.classList.add('active');
    });
  });

  if (formWrapper && tabsWrapper) {
    if (isCCPaymentAvaliable === false) {
      defaultUserAction = 'lf';
      tabsWrapper.style.display = 'none';
    }

    switch (window.lang) {
      case 'ru':
        if (isCCPaymentAvaliable !== false) {
          tabsWrapper.style.display = 'flex';
          setParams(1, 0);
          if (basket.basketAvailable === true) {
            tabsWrapper.style.display = 'none';
          }
        }
        break;
      case 'il':
        if (isCCPaymentAvaliable !== false) {
          tabsWrapper.style.display = 'flex';
          setParams(1, 0);
          if (basket.basketAvailable === true) {
            tabsWrapper.style.display = 'none';
            setParams(1, 0);
          }
        } else {
          setParams(1, 0);
        }
        break;
      case 'ar':
        if (isCCPaymentAvaliable !== false) {
          tabsWrapper.style.display = 'flex';
          setParams(1, 0);
          if (basket.basketAvailable === true) {
            tabsWrapper.style.display = 'none';
            setParams(1, 0);
          }
        } else {
          setParams(1, 0);
        }
        break;
      default:
        setParams(1, 0);
        break;
    }

    if (window.location.host === 'www.naymarkus.com') {
      isCCPaymentAvaliable = false;
      defaultUserAction = 'lf';
      tabsWrapper.style.display = 'none';
      consultant.style.display = 'block';
      creditCard.style.display = 'none';
      document.querySelector('.tab_content').style = 'border:none';
    }
  }

  if (consultantTab) {
    if (isPaymentTabDefault) {
      setParams(0, 1);
    } else {
      setParams(1, 0);
    }
  }
}

formTabsLogic();
