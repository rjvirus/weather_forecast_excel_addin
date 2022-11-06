import { IComboBox, IComboBoxOption } from "@fluentui/react"

export interface IForecastForm {
	location: ILocationData
	startDate: Date
	numOfDays: number
	onChangeLocation: React.Dispatch<React.SetStateAction<ILocationData>>
	onChangeStartDate: React.Dispatch<React.SetStateAction<Date>>
	onChangeNumOfDays: React.Dispatch<React.SetStateAction<number>>
	onSubmit: () => void
	toggleFilter: React.Dispatch<React.SetStateAction<boolean>>
}

export interface ILocationData {
	lat: string;
	lon: string;
	text: string;
}

export interface IFiltersPage {
	conditionOptions: IComboBoxOption[]
	onClickBack: () => void
}

export interface ILocationSearchBox {
	text: string
	showError: boolean
	onChange: (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, _index?: number, value?: string) => void
}