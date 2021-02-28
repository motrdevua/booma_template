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
      modal.wrapper = document.createElement('div');
      modal.window = document.createElement('div');
      modal.content = document.createElement('div');
      modal.closeButton = document.createElement('div');

      modal.wrapper.classList.add('modal__wrapper');
      modal.window.classList.add('modal');
      modal.content.classList.add('modal__content');
      modal.closeButton.classList.add('modal__close');

      document.body.insertBefore(modal.wrapper, wrapper);
      modal.wrapper.appendChild(modal.window);
      modal.window.appendChild(modal.closeButton);
      modal.window.appendChild(modal.content);
    };

    modal.open = function () {
      modal.wrapper.classList.add('modal__wrapper-active');
      modal.window.classList.add('modal-active');
      modal.closeButton.classList.add('modal__close-active');

      modal.content.innerHTML = content;

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = paddingOffset;
      document.querySelector('.header').style.paddingRight = paddingOffset;

      return modal;
    };

    modal.close = function () {
      modal.wrapper.classList.remove('modal__wrapper-active');
      modal.window.classList.remove('modal-active');
      modal.closeButton.classList.remove('modal__close-active');

      modal.content.innerHTML = '';

      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
      document.querySelector('.header').style.paddingRight = '0';

      return modal;
    };

    modal.create();
    document.addEventListener(clickEvent, (e) => {
      if (e.target === modal.wrapper || e.target === modal.closeButton) {
        modal.close();
      }
    });
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
