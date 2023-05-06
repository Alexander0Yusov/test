import './css/styles.css';
import Notiflix from 'notiflix';
const debounce = require('lodash.debounce');
import apiService from './js/fetchCountries';
import { firstWay, secondWay, clearEl } from './js/markup';

const api = new apiService();
const DEBOUNCE_DELAY = 300;

const rfs = {
  inputEl: document.querySelector('#search-box'),
  singleCountryEl: document.querySelector('.country-info'),
  multiCountryEl: document.querySelector('.country-list'),
};

rfs.inputEl.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

function onInput(e) {
  e.preventDefault;

  const inputValue = e.target.value.trim(' ');

  // особый синтаксис типа if...
  inputValue === '' && clearEl(rfs.singleCountryEl);
  inputValue === '' && clearEl(rfs.multiCountryEl);

  inputValue !== '' &&
    api
      .fetchCountries(inputValue)
      .then(ar => {
        if (ar.length === 1) {
          rfs.singleCountryEl.innerHTML = firstWay(ar[0]);
          clearEl(rfs.multiCountryEl);
        } else if (ar.length > 1 && ar.length <= 10) {
          rfs.multiCountryEl.innerHTML = secondWay(ar);
          clearEl(rfs.singleCountryEl);
        } else if (ar.length > 10) {
          Notiflix.Notify.info(
            'Too many matches found. Please enter a more specific name.'
          );

          clearEl(rfs.singleCountryEl);
          clearEl(rfs.multiCountryEl);
        }

        return ar;
      })
      .then(data => {
        console.log(data);
        if (data.message) {
          Notiflix.Notify.failure('Oops, there is no country with that name');
          clearEl(rfs.singleCountryEl);
          clearEl(rfs.multiCountryEl);
        }
      })
      .catch(e => {
        console.log(e.message);
      })
      .finally(() => {});
}
