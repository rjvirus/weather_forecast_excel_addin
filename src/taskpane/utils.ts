import { IComboBoxOption } from "@fluentui/react";

export function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

export function addDaysToDate(date: Date, days: number) {
    let _date = new Date();
    return new Date(_date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)))
}

export function formatDate(date: Date) {
    return (
        [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join('-')
    );
}

export function formatDateDisplay(_date: string) {
    const date = new Date(_date)
    return `${date.getDate()} ${month[date.getMonth()]}, ${date.getFullYear()}`
}

export function FahrenheitToCelcius(value) {
    return Math.round(((value - 32) * .5556) * 10) / 10;
}

export function splitAndPushData(options: IComboBoxOption[], newJoinedValue: string) {
    const conditionValueUnique = newJoinedValue.split(', ')
    conditionValueUnique.forEach(uV => {
        const fIndex = options.findIndex(v => v.text === uV)
        if (fIndex < 0) {
            options.push({ key: options.length, text: uV })
        }
    })
}

export const debounce = (func, delay) => {
	let timer;
	return function (...args) {
		let context = this;
		clearTimeout(timer);
		timer = setTimeout(() => func.apply(context, args), delay);
	};
};

export const FormatDateKeys = ['datetime']

export const FormatTimeKeys = ['sunset', 'sunrise']

export const FormatTempKeys = ['tempmax', 'tempmin', 'temp']

export const columnKeys = [
    'datetime', 'conditions', 'temp', 'humidity', 'precipprob', 'precip', 'windspeed', 'cloudcover',
    'tempmax', 'tempmin', 'description', 'pressure', 'visibility', 'uvindex', 'sunrise', 'sunset'
]

export const columnKeyText = {
    'datetime': 'Date',
    'conditions': 'Conditions    ',
    'temp': 'Avg Temp. (°C)',
    'humidity': 'Humidity (%)',
    'precipprob': 'Precip Prob. (%)',
    'precip': 'Precip (in.)',
    'windspeed': 'Wind (km\\hr)',
    'cloudcover': 'Cloud Cover (%)',
    'description': 'Description',
    'tempmax': 'Max Temp. (°C)',
    'tempmin': 'Min Temp. (°C)',
    'pressure': 'Pressure (mbar)',
    'visibility': 'Visibility (km)',
    'uvindex': 'UV Index',
    'sunrise': 'Sunrise',
    'sunset': 'Sunset',
}

export const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]