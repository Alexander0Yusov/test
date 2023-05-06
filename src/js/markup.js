export function firstWay(country) {
  const { name, flags, capital, population, languages } = country;
  const langs = Object.values(languages).join(', ');

  const markup = `<div>
  
  <div class='container'>  
  <img src=${flags.svg} alt='flag image'/>
  <p class='name'>${name.official}</p>
  </div> 

  <p class='capital'><span>Capital:</span> ${capital}</p>
  <p class='population'><span>Population:</span> ${population}</p>
  <p class='population'><span>Languages:</span> ${langs}</p>
  
  </div>`;

  return markup;
}

export function secondWay(countryAr) {
  const markup = countryAr
    .map(({ name, flags }) => {
      return `<li>
      <img src=${flags.svg} alt='flag image' />
      <p class='name'>${name.official}</p>
    </li>`;
    })
    .join('');

  return markup;
}

export function clearEl(el) {
  el.innerHTML = '';
}
