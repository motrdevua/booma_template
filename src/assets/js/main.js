import $ from 'jquery';
import Popup from './popup';

window.addEventListener('load', () => {
  const popup = new Popup();
  popup.open();
});
