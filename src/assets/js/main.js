import $ from 'jquery';
import Popup from './popup';

const content = 'asdjkhaskldhkasjjdhashkljd';
window.addEventListener('load', () => {
  const popup = new Popup(content);
  popup.open();
});
