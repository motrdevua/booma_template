const ua = navigator.userAgent;
const clickEvent =
  ua.match(/iPad/i) || ua.match(/iPhone/) ? 'touchstart' : 'click';
const paddingOffset = `${window.innerWidth - document.body.offsetWidth}px`;

const buttonOpenModal = document.querySelectorAll('.modal__open');
const modalContent = document.querySelectorAll('[data-windowid]');
let contentHTML = '';

class Modal {
  constructor(content) {
    const wrapper = document.querySelector('.wrapper');
    const modal = this;

    modal.create = function () {
      modal.overlay = document.createElement('div');
      modal.window = document.createElement('div');
      modal.content = document.createElement('div');
      modal.closeButton = document.createElement('div');

      modal.overlay.classList.add('modal-overlay');
      modal.window.classList.add('modal');
      modal.content.classList.add('modal__content');
      modal.closeButton.classList.add('modal__close');

      document.body.insertBefore(modal.overlay, wrapper);
      document.body.insertBefore(modal.window, wrapper);
      modal.window.appendChild(modal.content);
    };

    modal.open = function () {
      modal.overlay.classList.add('modal-overlay-active');
      modal.window.classList.add('modal-active');
      modal.closeButton.classList.add('modal__close-active');

      modal.content.innerHTML = content;

      console.log(modal.content);

      modal.content.children[0].appendChild(modal.closeButton);

      document.querySelector('.header').style.paddingRight = paddingOffset;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = paddingOffset;
      document.body.style.background = '#1c1c1c';

      return modal;
    };

    modal.close = function () {
      modal.overlay.classList.remove('modal-overlay-active');
      modal.modal.classList.remove('modal-active');
      modal.closeButton.classList.remove('modal__close-active');

      modal.content.innerHTML = '';

      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
      document.body.style.background = 'none';
      document.querySelector('.header').style.paddingRight = '0';

      return modal;
    };

    modal.create();
    modal.overlay.onclick = modal.close;
    modal.closeButton.onclick = modal.close;
  }
}

const modal = new Modal(contentHTML);

function addingContent(elem) {
  for (let i = 0; i < modalContent.length; i += 1) {
    if (modalContent[i].dataset.windowid === elem.dataset.buttonid) {
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
