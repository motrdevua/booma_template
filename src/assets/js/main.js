const ua = navigator.userAgent;
const clickEvent =
  ua.match(/iPad/i) || ua.match(/iPhone/) ? 'touchstart' : 'click';

const openModal = document.querySelectorAll('.button-open-modal');
const modalContent = document.querySelectorAll('.modal-content');
const contentHTML = '';

const modal = new Modal();

function addingContent(element) {
  for (let i = 0; i < modalContent.length; i += 1) {
    if (modalContent[i].dataset.id === element.dataset.modal) {
      contentHTML = modalContent[i].innerHTML;
    }
  }
}

window.addEventListener('load', () => {
  buttonOpenModal.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      const form = $(button).closest('form');

      addingContent(button);

      if (button.dataset.modal === 'access') {
        if ($(form).parsley().validate()) {
          // chechUserInLs(form);
          formModal.open();
        }
      } else {
        formModal.open();
      }
    });
  });
});
