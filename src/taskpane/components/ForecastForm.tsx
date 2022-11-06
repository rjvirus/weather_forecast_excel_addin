import { DatePicker, DayOfWeek, Slider, DefaultButton, IComboBoxOption } from '@fluentui/react'
import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import { SliderStyles } from './App';
import LocationSearchBox from './LocationSearchBox'
import * as Utils from "../utils";
import { IForecastForm } from '../interfaces';

export default function ForecastForm(props: IForecastForm) {
	const {
		startDate, onChangeStartDate, location, onChangeLocation, numOfDays,
		onChangeNumOfDays, toggleFilter
	} = props;
	const [isSubmitted, setIsSubmitted] = useState(false);
	const datePickerErrMsg = { errorMessage: (isSubmitted && !startDate) && 'Required', required: true }

	function _onChangeLocation(_e, option?: IComboBoxOption, _index?: number, _text?: string) {
		onChangeLocation({
			lat: option?.data?.lat || '',
			lon: option?.data?.lon || '',
			text: option ? option.text : _text
		})
	}

	function onSubmit() {
		setIsSubmitted(true)
		props.onSubmit()
	}


	return (
		<Fragment>
			<FormContainer>
				<LocationSearchBox
					text={location.text}
					showError={isSubmitted && (location.lat === '')}
					onChange={_onChangeLocation}
				/>
				<DatePicker
					firstDayOfWeek={DayOfWeek.Monday}
					role='form-date-picker'
					initialPickerDate={new Date()}
					styles={DatePickerStyle}
					value={startDate}
					minDate={new Date()}
					maxDate={Utils.addDaysToDate(new Date(), 9)}
					disableAutoFocus label="Forecast Start Date"
					placeholder="Select a date..."
					onSelectDate={onChangeStartDate}
					isMonthPickerVisible={false}
					openOnClick
					textField={datePickerErrMsg}
				/>
				<Slider
					label="Number of Days"
					max={5} min={1}
					value={numOfDays}
					styles={SliderStyles}
					showValue
					onChange={onChangeNumOfDays}
				/>
			</FormContainer>
			<CenteredDiv>
				<DefaultButton
					text="Generate Report"
					styles={ButtonStyle}
					iconProps={{ iconName: "CRMReport" }}
					id="generate-report"
					onClick={onSubmit}
					primary
				/>
				<DefaultButton
					text="Filter Data"
					iconProps={{ iconName: "Filter" }}
					onClick={() => toggleFilter(true)}
					title={"Filter generated data by columns. Enabled if forecast report is generated."}
					disabled={!toggleFilter}
					primary
				/>
			</CenteredDiv>
		</Fragment>
	)
}

const FormContainer = styled.div`
	margin-bottom: 32px;
`
const ButtonStyle = { root: { marginBottom: '12px' } }

const DatePickerStyle = { root: { marginBottom: '18px' }}

const CenteredDiv = styled.div`
	display: flex;
	flex-direction: column;
`