import './css/styles.css';
import Notiflix from 'notiflix';
const debounce = require('lodash.debounce');
import apiService from './js/fetchCountries';
import { firstWay, secondWay, clearEl } from './js/markup';
import { startSpinner, stopSpinner } from './js/loader';
import {
  Api,
  countriesStore,
  genresStore,
  languagesStore,
  searchData,
} from './js/api';

//=========================================================
/*
***
за базу берется название (или год или название+год), остальное - фильтры
***
если нет страны и года, тогда показаны [новинки недели]. фильтр жанр работает только
'https://api.themoviedb.org/3/trending/all/week?api_key=225e339996bc91260b33199c383c8881'
***
если есть название и год, то делается два запроса:
первый умный - для рендера и отбора всех жанров и точных дат релиза
второй глупый - для бредневого запроса multi на выявление стран по смежным айди
в результате существующие фильтры засветятся
***
если есть только название - тоже самое. существующие фильтры засветятся
***
если есть только год - открытие фильтра по жанрам
***

или все нахрен в одном запросе страна косвенно получена через язык
https://api.themoviedb.org/3/configuration/languages?api_key=225e339996bc91260b33199c383c8881
https://api.themoviedb.org/3/configuration/countries?api_key=225e339996bc91260b33199c383c8881
https://api.themoviedb.org/3/genre/movie/list?api_key=225e339996bc91260b33199c383c8881

**весь запрос по одной строке: страна образуется как в дз 10 варианты в выпадающем списке
**жанр тоже образуется из вариантов при запросе. при остальных пустых запрос не слать
**год - список смежных вариантов от инпута
**название - просто что угодно и не пустое

{ "iso_639_1": "lv", "english_name": "Latvian", "name": "Latviešu" }
{ AD: 'Andorra' }

*/

const form = document.querySelector('.filmForm');
const formFilmStorage = {};

form.addEventListener('submit', onSubmit);

form.title.addEventListener('input', e => {
  // console.log('find by Title: ', e.target.value);
  searchData.query = e.target.value;
});

form.year.addEventListener('input', e => {
  // console.log('filter by Year: ', e.target.value);
  searchData.year = e.target.value;
});

form.genre.addEventListener('input', e => {
  // console.log('filter by Genre: ', e.target.value);
  const tmp = findGenreId(e.target.value);
  if (tmp) {
    console.log(tmp);
    searchData.genre = tmp;
  }
});

form.country.addEventListener('input', e => {
  console.log('filter by Country: ', e.target.value);
  const str = `https://restcountries.com/v3.1/name/${e.target.value}?fields=name,capital,population,flags,languages`;
  fetch(str)
    .then(r => r.json())
    .then(r => {
      if (r.length === 1) {
        searchData.code = findLanguageCode(findObjFirstValue(r[0].languages));
        searchData.CODE = findCountryCode(r[0].name.common);

        console.log(searchData);
        console.log(r[0].name.common);
      }
    });
});

// SUBMIT
function onSubmit(e) {
  searchData.CODE =
    searchData.code =
    searchData.genre =
    searchData.query =
    searchData.year =
      null;

  e.preventDefault();
  const a = new Api();
  startSpinner();

  if (form.title.value !== '' || form.year.value !== '') {
    a.searhByNameYearCountry({
      query: searchData.query,
      year: searchData.year,
      language: `${searchData.code}-${searchData.CODE}`,
    })
      .then(res => {
        console.log(res);
      })
      .finally(() => {
        stopSpinner();
      });
  }

  // getAllGenres();
  // getAllCountries();
  // console.log(form.film.value);
}

function getAllGenres() {
  const a = new Api();
  a.getGenres()
    .then(res => {
      formFilmStorage.genres = res.genres;
      // console.log(formFilmStorage.genres);
    })
    .finally(() => {});
}
function getAllCountries() {
  const a = new Api();
  a.getCountries()
    .then(res => {
      formFilmStorage.countries = res;
      console.log(formFilmStorage.countries);
    })
    .finally(() => {});
}

function findCountryCode(country) {
  const codes = Object.keys(countriesStore);
  for (const code of codes) {
    if (countriesStore[code] === country) return code;
  }
}

function findObjFirstValue(obj) {
  const keys = Object.keys(obj);
  return obj[keys[0]];
}

function findLanguageCode(language) {
  return languagesStore.find(
    item => item.english_name.toLowerCase() === language.toLowerCase()
  ).iso_639_1;
}

function findGenreId(genre) {
  const result = genresStore.find(
    item => item.name.toLowerCase() === genre.toLowerCase()
  );
  if (result) return result.id;
}

function nme(params) {}

//=========================================================

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
        // console.log(data);
        if (data.message) {
          Notiflix.Notify.failure('Oops, there is no country with that name');
          clearEl(rfs.singleCountryEl);
          clearEl(rfs.multiCountryEl);
        }
      })
      .catch(e => {
        console.log(e.message);
      })
      .finally(() => {
        stopSpinner();
      });
}

// console.log('hi');
// window.addEventListener('load', stopSpinner);
