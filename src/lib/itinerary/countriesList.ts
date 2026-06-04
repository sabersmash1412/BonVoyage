import { getNames } from 'country-list';

const countryList: string[] = getNames();

export const countryRegex = new RegExp(`^(${countryList.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i');