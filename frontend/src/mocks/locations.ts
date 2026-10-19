import type { LocalizedNames, LocationName, TravelLocation } from '@/types/location';
import { EXTRA_CITIES, EXTRA_COUNTRIES } from './worldGeo';

/*
 * Demo location data. Compact "seed" lists are expanded into TravelLocation objects below.
 * A real location/airport API will replace this file.
 */

interface RegionSeed {
  id: string;
  name: string;
  names: LocalizedNames;
  parentId?: string;
}

interface CountrySeed {
  code: string;
  name: string;
  names: LocalizedNames;
  /** Sub-region first (shown as context), then broader regions. */
  regionIds: string[];
  keywords?: string[];
}

interface CitySeed {
  code: string;
  name: string;
  names?: LocalizedNames;
  countryCode: string;
  airports: Array<[iata: string, name: string]>;
  keywords?: string[];
}

const REGIONS: RegionSeed[] = [
  { id: 'europe', name: 'Europe', names: { fi: 'Eurooppa', ru: 'Европа', de: 'Europa' } },
  {
    id: 'northern-europe',
    name: 'Northern Europe',
    names: {
      fi: 'Pohjois-Eurooppa',
      ru: 'Северная Европа',
      de: 'Nordeuropa',
      fr: 'Europe du Nord',
    },
    parentId: 'europe',
  },
  {
    id: 'western-europe',
    name: 'Western Europe',
    names: {
      fi: 'Länsi-Eurooppa',
      ru: 'Западная Европа',
      de: 'Westeuropa',
      fr: "Europe de l'Ouest",
    },
    parentId: 'europe',
  },
  {
    id: 'southern-europe',
    name: 'Southern Europe',
    names: { fi: 'Etelä-Eurooppa', ru: 'Южная Европа', de: 'Südeuropa', fr: 'Europe du Sud' },
    parentId: 'europe',
  },
  { id: 'asia', name: 'Asia', names: { fi: 'Aasia', ru: 'Азия', de: 'Asien', fr: 'Asie' } },
  {
    id: 'southeast-asia',
    name: 'Southeast Asia',
    names: {
      fi: 'Kaakkois-Aasia',
      ru: 'Юго-Восточная Азия',
      de: 'Südostasien',
      fr: 'Asie du Sud-Est',
    },
    parentId: 'asia',
  },
  {
    id: 'east-asia',
    name: 'East Asia',
    names: { fi: 'Itä-Aasia', ru: 'Восточная Азия', de: 'Ostasien', fr: "Asie de l'Est" },
    parentId: 'asia',
  },
  {
    id: 'middle-east',
    name: 'Middle East',
    names: { fi: 'Lähi-itä', ru: 'Ближний Восток', de: 'Naher Osten', fr: 'Moyen-Orient' },
    parentId: 'asia',
  },
  {
    id: 'africa',
    name: 'Africa',
    names: { fi: 'Afrikka', ru: 'Африка', de: 'Afrika', fr: 'Afrique' },
  },
  {
    id: 'north-africa',
    name: 'North Africa',
    names: {
      fi: 'Pohjois-Afrikka',
      ru: 'Северная Африка',
      de: 'Nordafrika',
      fr: 'Afrique du Nord',
    },
    parentId: 'africa',
  },
  {
    id: 'north-america',
    name: 'North America',
    names: {
      fi: 'Pohjois-Amerikka',
      ru: 'Северная Америка',
      de: 'Nordamerika',
      fr: 'Amérique du Nord',
    },
  },
  {
    id: 'caribbean',
    name: 'Caribbean',
    names: { fi: 'Karibia', ru: 'Карибский бассейн', de: 'Karibik', fr: 'Caraïbes' },
    parentId: 'north-america',
  },
  {
    id: 'south-america',
    name: 'South America',
    names: {
      fi: 'Etelä-Amerikka',
      ru: 'Южная Америка',
      de: 'Südamerika',
      fr: 'Amérique du Sud',
    },
  },
  {
    id: 'oceania',
    name: 'Oceania',
    names: { fi: 'Oseania', ru: 'Океания', de: 'Ozeanien', fr: 'Océanie' },
  },
  {
    id: 'antarctica',
    name: 'Antarctica',
    names: { fi: 'Antarktis', ru: 'Антарктида', de: 'Antarktis', fr: 'Antarctique' },
  },
];

const COUNTRIES: CountrySeed[] = [
  {
    code: 'FI',
    name: 'Finland',
    names: { fi: 'Suomi', ru: 'Финляндия', de: 'Finnland', fr: 'Finlande' },
    regionIds: ['northern-europe', 'europe'],
  },
  {
    code: 'SE',
    name: 'Sweden',
    names: { fi: 'Ruotsi', ru: 'Швеция', de: 'Schweden', fr: 'Suède' },
    regionIds: ['northern-europe', 'europe'],
  },
  {
    code: 'NO',
    name: 'Norway',
    names: { fi: 'Norja', ru: 'Норвегия', de: 'Norwegen', fr: 'Norvège' },
    regionIds: ['northern-europe', 'europe'],
  },
  {
    code: 'DK',
    name: 'Denmark',
    names: { fi: 'Tanska', ru: 'Дания', de: 'Dänemark', fr: 'Danemark' },
    regionIds: ['northern-europe', 'europe'],
  },
  {
    code: 'EE',
    name: 'Estonia',
    names: { fi: 'Viro', ru: 'Эстония', de: 'Estland', fr: 'Estonie' },
    regionIds: ['northern-europe', 'europe'],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    names: {
      fi: 'Iso-Britannia',
      ru: 'Великобритания',
      de: 'Vereinigtes Königreich',
      fr: 'Royaume-Uni',
    },
    regionIds: ['northern-europe', 'europe'],
    keywords: ['UK', 'England', 'Great Britain'],
  },
  {
    code: 'DE',
    name: 'Germany',
    names: { fi: 'Saksa', ru: 'Германия', de: 'Deutschland', fr: 'Allemagne' },
    regionIds: ['western-europe', 'europe'],
  },
  {
    code: 'FR',
    name: 'France',
    names: { fi: 'Ranska', ru: 'Франция', de: 'Frankreich' },
    regionIds: ['western-europe', 'europe'],
  },
  {
    code: 'ES',
    name: 'Spain',
    names: { fi: 'Espanja', ru: 'Испания', de: 'Spanien', fr: 'Espagne' },
    regionIds: ['southern-europe', 'europe'],
  },
  {
    code: 'IT',
    name: 'Italy',
    names: { fi: 'Italia', ru: 'Италия', de: 'Italien', fr: 'Italie' },
    regionIds: ['southern-europe', 'europe'],
  },
  {
    code: 'PT',
    name: 'Portugal',
    names: { fi: 'Portugali', ru: 'Португалия' },
    regionIds: ['southern-europe', 'europe'],
  },
  {
    code: 'GR',
    name: 'Greece',
    names: { fi: 'Kreikka', ru: 'Греция', de: 'Griechenland', fr: 'Grèce' },
    regionIds: ['southern-europe', 'europe'],
  },
  {
    code: 'TR',
    name: 'Turkey',
    names: { fi: 'Turkki', ru: 'Турция', de: 'Türkei', fr: 'Turquie' },
    regionIds: ['middle-east', 'asia', 'europe'],
    keywords: ['Türkiye'],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    names: {
      fi: 'Arabiemiirikunnat',
      ru: 'Объединённые Арабские Эмираты',
      de: 'Vereinigte Arabische Emirate',
      fr: 'Émirats arabes unis',
    },
    regionIds: ['middle-east', 'asia'],
    keywords: ['UAE', 'ОАЭ'],
  },
  {
    code: 'TH',
    name: 'Thailand',
    names: { fi: 'Thaimaa', ru: 'Таиланд', fr: 'Thaïlande' },
    regionIds: ['southeast-asia', 'asia'],
  },
  {
    code: 'VN',
    name: 'Vietnam',
    names: { ru: 'Вьетнам', fr: 'Viêt Nam' },
    regionIds: ['southeast-asia', 'asia'],
  },
  {
    code: 'ID',
    name: 'Indonesia',
    names: { ru: 'Индонезия', de: 'Indonesien', fr: 'Indonésie' },
    regionIds: ['southeast-asia', 'asia'],
  },
  {
    code: 'SG',
    name: 'Singapore',
    names: { ru: 'Сингапур', de: 'Singapur', fr: 'Singapour' },
    regionIds: ['southeast-asia', 'asia'],
  },
  {
    code: 'JP',
    name: 'Japan',
    names: { fi: 'Japani', ru: 'Япония', fr: 'Japon' },
    regionIds: ['east-asia', 'asia'],
  },
  {
    code: 'US',
    name: 'United States',
    names: { fi: 'Yhdysvallat', ru: 'США', de: 'Vereinigte Staaten', fr: 'États-Unis' },
    regionIds: ['north-america'],
    keywords: ['USA', 'America', 'Соединённые Штаты'],
  },
  {
    code: 'CA',
    name: 'Canada',
    names: { fi: 'Kanada', ru: 'Канада', de: 'Kanada' },
    regionIds: ['north-america'],
  },
  {
    code: 'MX',
    name: 'Mexico',
    names: { fi: 'Meksiko', ru: 'Мексика', de: 'Mexiko', fr: 'Mexique' },
    regionIds: ['north-america', 'caribbean'],
  },
  {
    code: 'DO',
    name: 'Dominican Republic',
    names: {
      fi: 'Dominikaaninen tasavalta',
      ru: 'Доминиканская Республика',
      de: 'Dominikanische Republik',
      fr: 'République dominicaine',
    },
    regionIds: ['caribbean', 'north-america'],
  },
  {
    code: 'EG',
    name: 'Egypt',
    names: { fi: 'Egypti', ru: 'Египет', de: 'Ägypten', fr: 'Égypte' },
    regionIds: ['north-africa', 'africa'],
  },
  {
    code: 'MA',
    name: 'Morocco',
    names: { fi: 'Marokko', ru: 'Марокко', de: 'Marokko', fr: 'Maroc' },
    regionIds: ['north-africa', 'africa'],
  },
  {
    code: 'AU',
    name: 'Australia',
    names: { ru: 'Австралия', de: 'Australien', fr: 'Australie' },
    regionIds: ['oceania'],
  },
  {
    code: 'BR',
    name: 'Brazil',
    names: { fi: 'Brasilia', ru: 'Бразилия', de: 'Brasilien', fr: 'Brésil' },
    regionIds: ['south-america'],
  },
];

const CITIES: CitySeed[] = [
  {
    code: 'HEL',
    name: 'Helsinki',
    names: { ru: 'Хельсинки' },
    countryCode: 'FI',
    airports: [['HEL', 'Helsinki Airport']],
    keywords: ['Helsingfors', 'Vantaa'],
  },
  {
    code: 'TMP',
    name: 'Tampere',
    names: { ru: 'Тампере' },
    countryCode: 'FI',
    airports: [['TMP', 'Tampere–Pirkkala Airport']],
  },
  {
    code: 'TKU',
    name: 'Turku',
    names: { ru: 'Турку' },
    countryCode: 'FI',
    airports: [['TKU', 'Turku Airport']],
    keywords: ['Åbo'],
  },
  {
    code: 'OUL',
    name: 'Oulu',
    names: { ru: 'Оулу' },
    countryCode: 'FI',
    airports: [['OUL', 'Oulu Airport']],
  },
  {
    code: 'RVN',
    name: 'Rovaniemi',
    names: { ru: 'Рованиеми' },
    countryCode: 'FI',
    airports: [['RVN', 'Rovaniemi Airport']],
    keywords: ['Lapland', 'Lappi'],
  },
  {
    code: 'STO',
    name: 'Stockholm',
    names: { fi: 'Tukholma', ru: 'Стокгольм' },
    countryCode: 'SE',
    airports: [
      ['ARN', 'Stockholm Arlanda Airport'],
      ['BMA', 'Stockholm Bromma Airport'],
    ],
  },
  {
    code: 'OSL',
    name: 'Oslo',
    names: { ru: 'Осло' },
    countryCode: 'NO',
    airports: [['OSL', 'Oslo Gardermoen Airport']],
  },
  {
    code: 'CPH',
    name: 'Copenhagen',
    names: { fi: 'Kööpenhamina', ru: 'Копенгаген', de: 'Kopenhagen', fr: 'Copenhague' },
    countryCode: 'DK',
    airports: [['CPH', 'Copenhagen Airport']],
  },
  {
    code: 'TLL',
    name: 'Tallinn',
    names: { ru: 'Таллин' },
    countryCode: 'EE',
    airports: [['TLL', 'Tallinn Airport']],
  },
  {
    code: 'LON',
    name: 'London',
    names: { fi: 'Lontoo', ru: 'Лондон', fr: 'Londres' },
    countryCode: 'GB',
    airports: [
      ['LHR', 'Heathrow Airport'],
      ['LGW', 'Gatwick Airport'],
      ['STN', 'Stansted Airport'],
    ],
  },
  {
    code: 'BER',
    name: 'Berlin',
    names: { fi: 'Berliini', ru: 'Берлин' },
    countryCode: 'DE',
    airports: [['BER', 'Berlin Brandenburg Airport']],
  },
  {
    code: 'MUC',
    name: 'Munich',
    names: { fi: 'München', ru: 'Мюнхен', de: 'München' },
    countryCode: 'DE',
    airports: [['MUC', 'Munich Airport']],
  },
  {
    code: 'FRA',
    name: 'Frankfurt',
    names: { ru: 'Франкфурт' },
    countryCode: 'DE',
    airports: [['FRA', 'Frankfurt Airport']],
  },
  {
    code: 'PAR',
    name: 'Paris',
    names: { fi: 'Pariisi', ru: 'Париж' },
    countryCode: 'FR',
    airports: [
      ['CDG', 'Paris Charles de Gaulle Airport'],
      ['ORY', 'Paris Orly Airport'],
    ],
  },
  {
    code: 'NCE',
    name: 'Nice',
    names: { fi: 'Nizza', ru: 'Ницца', de: 'Nizza' },
    countryCode: 'FR',
    airports: [['NCE', "Nice Côte d'Azur Airport"]],
  },
  {
    code: 'BCN',
    name: 'Barcelona',
    names: { ru: 'Барселона', fr: 'Barcelone' },
    countryCode: 'ES',
    airports: [['BCN', 'Barcelona–El Prat Airport']],
  },
  {
    code: 'MAD',
    name: 'Madrid',
    names: { ru: 'Мадрид' },
    countryCode: 'ES',
    airports: [['MAD', 'Madrid–Barajas Airport']],
  },
  {
    code: 'AGP',
    name: 'Málaga',
    names: { ru: 'Малага' },
    countryCode: 'ES',
    airports: [['AGP', 'Málaga Airport']],
    keywords: ['Costa del Sol'],
  },
  {
    code: 'ROM',
    name: 'Rome',
    names: { fi: 'Rooma', ru: 'Рим', de: 'Rom' },
    countryCode: 'IT',
    airports: [
      ['FCO', 'Rome Fiumicino Airport'],
      ['CIA', 'Rome Ciampino Airport'],
    ],
    keywords: ['Roma'],
  },
  {
    code: 'MIL',
    name: 'Milan',
    names: { fi: 'Milano', ru: 'Милан', de: 'Mailand' },
    countryCode: 'IT',
    airports: [
      ['MXP', 'Milan Malpensa Airport'],
      ['LIN', 'Milan Linate Airport'],
    ],
  },
  {
    code: 'LIS',
    name: 'Lisbon',
    names: { fi: 'Lissabon', ru: 'Лиссабон', de: 'Lissabon', fr: 'Lisbonne' },
    countryCode: 'PT',
    airports: [['LIS', 'Lisbon Airport']],
    keywords: ['Lisboa'],
  },
  {
    code: 'ATH',
    name: 'Athens',
    names: { fi: 'Ateena', ru: 'Афины', de: 'Athen', fr: 'Athènes' },
    countryCode: 'GR',
    airports: [['ATH', 'Athens International Airport']],
  },
  {
    code: 'IST',
    name: 'Istanbul',
    names: { ru: 'Стамбул' },
    countryCode: 'TR',
    airports: [
      ['IST', 'Istanbul Airport'],
      ['SAW', 'Sabiha Gökçen Airport'],
    ],
  },
  {
    code: 'AYT',
    name: 'Antalya',
    names: { ru: 'Анталья' },
    countryCode: 'TR',
    airports: [['AYT', 'Antalya Airport']],
  },
  {
    code: 'DXB',
    name: 'Dubai',
    names: { ru: 'Дубай', fr: 'Dubaï' },
    countryCode: 'AE',
    airports: [['DXB', 'Dubai International Airport']],
  },
  {
    code: 'BKK',
    name: 'Bangkok',
    names: { ru: 'Бангкок' },
    countryCode: 'TH',
    airports: [
      ['BKK', 'Suvarnabhumi Airport'],
      ['DMK', 'Don Mueang International Airport'],
    ],
  },
  {
    code: 'HKT',
    name: 'Phuket',
    names: { ru: 'Пхукет' },
    countryCode: 'TH',
    airports: [['HKT', 'Phuket International Airport']],
  },
  {
    code: 'HAN',
    name: 'Hanoi',
    names: { ru: 'Ханой' },
    countryCode: 'VN',
    airports: [['HAN', 'Noi Bai International Airport']],
  },
  {
    code: 'SGN',
    name: 'Ho Chi Minh City',
    names: { ru: 'Хошимин', fr: 'Hô Chi Minh-Ville' },
    countryCode: 'VN',
    airports: [['SGN', 'Tan Son Nhat International Airport']],
    keywords: ['Saigon', 'Сайгон'],
  },
  {
    code: 'DPS',
    name: 'Denpasar (Bali)',
    names: { ru: 'Денпасар (Бали)' },
    countryCode: 'ID',
    airports: [['DPS', 'Ngurah Rai International Airport']],
    keywords: ['Bali', 'Бали'],
  },
  {
    code: 'SIN',
    name: 'Singapore',
    names: { ru: 'Сингапур', de: 'Singapur', fr: 'Singapour' },
    countryCode: 'SG',
    airports: [['SIN', 'Singapore Changi Airport']],
  },
  {
    code: 'TYO',
    name: 'Tokyo',
    names: { fi: 'Tokio', ru: 'Токио', de: 'Tokio' },
    countryCode: 'JP',
    airports: [
      ['HND', 'Tokyo Haneda Airport'],
      ['NRT', 'Narita International Airport'],
    ],
  },
  {
    code: 'NYC',
    name: 'New York',
    names: { ru: 'Нью-Йорк' },
    countryCode: 'US',
    airports: [
      ['JFK', 'John F. Kennedy International Airport'],
      ['EWR', 'Newark Liberty International Airport'],
    ],
  },
  {
    code: 'LAX',
    name: 'Los Angeles',
    names: { ru: 'Лос-Анджелес' },
    countryCode: 'US',
    airports: [['LAX', 'Los Angeles International Airport']],
  },
  {
    code: 'YTO',
    name: 'Toronto',
    names: { ru: 'Торонто' },
    countryCode: 'CA',
    airports: [['YYZ', 'Toronto Pearson International Airport']],
  },
  {
    code: 'CUN',
    name: 'Cancún',
    names: { ru: 'Канкун' },
    countryCode: 'MX',
    airports: [['CUN', 'Cancún International Airport']],
  },
  {
    code: 'PUJ',
    name: 'Punta Cana',
    names: { ru: 'Пунта-Кана' },
    countryCode: 'DO',
    airports: [['PUJ', 'Punta Cana International Airport']],
  },
  {
    code: 'CAI',
    name: 'Cairo',
    names: { fi: 'Kairo', ru: 'Каир', de: 'Kairo', fr: 'Le Caire' },
    countryCode: 'EG',
    airports: [['CAI', 'Cairo International Airport']],
  },
  {
    code: 'HRG',
    name: 'Hurghada',
    names: { ru: 'Хургада' },
    countryCode: 'EG',
    airports: [['HRG', 'Hurghada International Airport']],
  },
  {
    code: 'RAK',
    name: 'Marrakesh',
    names: { fi: 'Marrakech', ru: 'Марракеш', de: 'Marrakesch', fr: 'Marrakech' },
    countryCode: 'MA',
    airports: [['RAK', 'Marrakesh Menara Airport']],
  },
  {
    code: 'SYD',
    name: 'Sydney',
    names: { ru: 'Сидней' },
    countryCode: 'AU',
    airports: [['SYD', 'Sydney Airport']],
  },
  {
    code: 'RIO',
    name: 'Rio de Janeiro',
    names: { ru: 'Рио-де-Жанейро' },
    countryCode: 'BR',
    airports: [['GIG', 'Rio de Janeiro–Galeão International Airport']],
    keywords: ['Rio'],
  },
];

const existingCountryCodes = new Set(COUNTRIES.map((country) => country.code));
const ALL_COUNTRIES: CountrySeed[] = [
  ...COUNTRIES,
  ...EXTRA_COUNTRIES.filter(([code]) => !existingCountryCodes.has(code)).map(
    ([code, name, continentId]) => ({
      code,
      name,
      names: {},
      regionIds: [continentId],
    }),
  ),
];

const existingCityCodes = new Set(CITIES.map((city) => city.code));
const ALL_CITIES: CitySeed[] = [
  ...CITIES,
  ...EXTRA_CITIES.filter(([code]) => !existingCityCodes.has(code)).map(
    ([code, name, countryCode]) => ({
      code,
      name,
      countryCode,
      airports: [],
    }),
  ),
];

/* ---------- Expand seeds into TravelLocation objects ---------- */

function toName(seed: { name: string; names?: LocalizedNames }): LocationName {
  return { name: seed.name, localizedNames: seed.names };
}

const regionById = new Map(REGIONS.map((region) => [region.id, region]));
const countryByCode = new Map(ALL_COUNTRIES.map((country) => [country.code, country]));

function regionNames(ids: string[]): LocationName[] {
  return ids.flatMap((id) => {
    const region = regionById.get(id);
    return region ? [toName(region)] : [];
  });
}

const regionLocations: TravelLocation[] = REGIONS.map((region) => ({
  id: `region-${region.id}`,
  type: 'region',
  ...toName(region),
  parents: region.parentId ? regionNames([region.parentId]) : undefined,
}));

const countryLocations: TravelLocation[] = ALL_COUNTRIES.map((country) => ({
  id: `country-${country.code}`,
  type: 'country',
  code: country.code,
  countryCode: country.code,
  ...toName(country),
  parents: regionNames(country.regionIds),
  keywords: country.keywords,
}));

const cityAndAirportLocations: TravelLocation[] = ALL_CITIES.flatMap((city) => {
  const country = countryByCode.get(city.countryCode);
  const countryName = country ? [toName(country)] : [];
  const cityName = toName(city);

  const cityLocation: TravelLocation = {
    id: `city-${city.code}`,
    type: 'city',
    code: city.code,
    countryCode: city.countryCode,
    ...cityName,
    parents: countryName,
    keywords: city.keywords,
  };

  const airportLocations: TravelLocation[] = city.airports.map(([iata, name]) => ({
    id: `airport-${iata}`,
    type: 'airport',
    code: iata,
    countryCode: city.countryCode,
    name,
    parents: [cityName, ...countryName],
    keywords: city.keywords,
  }));

  return [cityLocation, ...airportLocations];
});

export const MOCK_LOCATIONS: TravelLocation[] = [
  ...regionLocations,
  ...countryLocations,
  ...cityAndAirportLocations,
];

/** Empty selector: every continent, then every country. Cities appear only after typing. */
export function getBrowseLocations(): TravelLocation[] {
  const continents = regionLocations.filter((region) => !region.parents?.length);
  const countries = [...countryLocations].sort((a, b) => a.name.localeCompare(b.name));
  return [...continents, ...countries];
}
