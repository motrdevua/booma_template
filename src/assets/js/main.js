const ua = navigator.userAgent;
const clickEvent =
  ua.match(/iPad/i) || ua.match(/iPhone/) ? 'touchstart' : 'click';
const paddingOffset = `${window.innerWidth - document.body.offsetWidth}px`;

const buttonOpenModal = document.querySelectorAll('.button-open-modal');
const modalContent = document.querySelectorAll('.modal');
let contentHTML = '';
console.log(modalContent);

class Modal {
  constructor(content) {
    const wrapper = document.querySelector('.wrapper');
    const popup = this;

    popup.popOverlay = document.createElement('div');
    popup.modal = document.createElement('div');
    popup.content = document.createElement('div');
    popup.clsBtn = document.createElement('div');

    popup.popOverlay.classList.add('popup-overlay');
    popup.modal.classList.add('popup-modal');
    popup.modal.classList.add('popup-modal-form');
    popup.content.classList.add('popup-content');
    popup.clsBtn.classList.add('modal__close');

    document.body.insertBefore(popup.popOverlay, wrapper);
    document.body.insertBefore(popup.modal, wrapper);
    popup.modal.appendChild(popup.content);

    popup.open = function () {
      popup.popOverlay.classList.add('popup-overlay-active');
      popup.modal.classList.add('popup-modal-active');
      popup.clsBtn.classList.add('modal__close--active');

      popup.content.innerHTML = content;

      popup.content.children[0].appendChild(popup.clsBtn);

      document.querySelector('.header').style.paddingRight = paddingOffset;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = paddingOffset;
      document.body.style.background = '#1c1c1c';

      return popup;
    };

    popup.close = function () {
      popup.popOverlay.classList.remove('popup-overlay-active');
      popup.modal.classList.remove('popup-modal-active');
      popup.clsBtn.classList.remove('modal__close--active');

      popup.content.innerHTML = '';
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
      document.body.style.background = 'none';
      document.querySelector('.header').style.paddingRight = '0';
      return popup;
    };

    popup.popOverlay.onclick = popup.close;
    popup.clsBtn.onclick = popup.close;
  }
}

const modal = new Modal(contentHTML);

function addingContent(element) {
  for (let i = 0; i < modalContent.length; i += 1) {
    if (modalContent[i].dataset.id === element.dataset.modal) {
      contentHTML = modalContent[i].innerHTML;
    }
  }
}

window.addEventListener('load', () => {
  buttonOpenModal.forEach((button) => {
    button.addEventListener(clickEvent, (e) => {
      e.preventDefault();

      addingContent(button);
      modal.open();
    });
  });
});
