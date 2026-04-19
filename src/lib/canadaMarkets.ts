export type CanadaProvinceOption = {
  code: string;
  name: string;
  cities: string[];
};

export const CANADA_MARKET_OPTIONS: CanadaProvinceOption[] = [
  { code: 'AB', name: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Fort McMurray'] },
  { code: 'BC', name: 'British Columbia', cities: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria', 'Kelowna'] },
  { code: 'MB', name: 'Manitoba', cities: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson'] },
  { code: 'NB', name: 'New Brunswick', cities: ['Moncton', 'Saint John', 'Fredericton', 'Miramichi'] },
  { code: 'NL', name: 'Newfoundland and Labrador', cities: ["St. John's", 'Mount Pearl', 'Corner Brook', 'Happy Valley-Goose Bay'] },
  { code: 'NS', name: 'Nova Scotia', cities: ['Halifax', 'Sydney', 'Dartmouth', 'Truro'] },
  { code: 'NT', name: 'Northwest Territories', cities: ['Yellowknife', 'Inuvik', 'Hay River'] },
  { code: 'NU', name: 'Nunavut', cities: ['Iqaluit', 'Rankin Inlet', 'Cambridge Bay'] },
  { code: 'ON', name: 'Ontario', cities: ['Toronto', 'Mississauga', 'Brampton', 'Hamilton', 'Ottawa', 'London', 'Kitchener', 'Windsor'] },
  { code: 'PE', name: 'Prince Edward Island', cities: ['Charlottetown', 'Summerside', 'Stratford'] },
  { code: 'QC', name: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke'] },
  { code: 'SK', name: 'Saskatchewan', cities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw'] },
  { code: 'YT', name: 'Yukon', cities: ['Whitehorse', 'Dawson City', 'Watson Lake'] },
];

export function formatMarketLabel(city: string, provinceCode: string) {
  return `${city}, ${provinceCode}`;
}

export function getProvinceByCode(code: string) {
  return CANADA_MARKET_OPTIONS.find((province) => province.code === code);
}
