import { startSpinner } from './loader';

export default class ApiService {
  constructor() {}

  async fetchCountries(name) {
    startSpinner();
    await new Promise(r => setTimeout(r, 200));

    const queryString = `https://restcountries.com/v3.1/name/${name}?fields=name,capital,population,flags,languages`;
    return fetch(queryString).then(r => r.json());
  }
}
