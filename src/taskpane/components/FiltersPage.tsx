import { 
	ActionButton, ComboBox, Slider, DefaultButton, IComboBoxOption, IButtonStyles, IIconProps, 
	IconButton, IComboBoxStyles 
} from '@fluentui/react'
import React, { Fragment, useState } from 'react'
import styled from 'styled-components'
import { columnKeyText } from '../utils'
import { SliderStyles } from './App'
import { IFiltersPage } from '../interfaces'

const sliderValueFormat = (value: number) => `${value}%`;

export function FiltersPage(props: IFiltersPage) {
	const { conditionOptions, onClickBack } = props;
	const [selectedCondition, setSelectedCondition] = useState<number | string>(0)
	const [cloudCoverRange, setCloudCoverRange] = useState<[number, number]>([0, 100])

	const filterByConditions = async (_, option: IComboBoxOption) => {
		setSelectedCondition(option.key)
		await Excel.run(async (context) => {
			const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
			const expensesTable = currentWorksheet.tables.getItem('ForecastReport');
			const conditionFilter = expensesTable.columns.getItem(columnKeyText['conditions']).filter;
			if (option.text === 'Show All') {
				conditionFilter.clear()
			} else {
				conditionFilter.applyCustomFilter(`=*${option.text}*`);
			}
			await context.sync();
		}).catch(function (error) {
			console.log("Error: " + error);
			if (error instanceof OfficeExtension.Error) {
				console.log("Debug info: " + JSON.stringify(error.debugInfo));
			}
		});
	}

	const filterByCloudCover = async () => {
		await Excel.run(async (context) => {
			const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
			const expensesTable = currentWorksheet.tables.getItem('ForecastReport');
			const conditionFilter = expensesTable.columns.getItem(columnKeyText['cloudcover']).filter;
			conditionFilter.applyCustomFilter(`<=${cloudCoverRange[1]}`, `>=${cloudCoverRange[0]}`, "And");
			await context.sync();
		}).catch(function (error) {
			console.log("Error: " + error);
			if (error instanceof OfficeExtension.Error) {
				console.log("Debug info: " + JSON.stringify(error.debugInfo));
			}
		});
	}

	const resetFilters = async () => {
		await Excel.run(async (context) => {
			const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
			const expensesTable = currentWorksheet.tables.getItem('ForecastReport');
			expensesTable.clearFilters()
			await context.sync();
		}).then(() => {
			setSelectedCondition(0)
			setCloudCoverRange([0,100])
		}).catch(function (error) {
			console.log("Error: " + error);
			if (error instanceof OfficeExtension.Error) {
				console.log("Debug info: " + JSON.stringify(error.debugInfo));
			}
		});
	}

	return (
		<Fragment>
			<ActionButton 
				text='Back' primary styles={ActionButtonStyles} iconProps={ActionButtonIconProps} 
				onClick={onClickBack} 
			/>
			<ComboBox 
				label="Filter By Conditions" options={conditionOptions} styles={ComboboxStyles}
				placeholder="Show All" defaultSelectedKey={selectedCondition} defaultValue={selectedCondition}
				selectedKey={selectedCondition} onChange={filterByConditions}
			/>
			<SliderContainer>
				<Slider
					styles={SliderStyles} label="Filter by Cloud Cover" min={0} max={100} step={10}
					lowerValue={cloudCoverRange[0]}
					value={cloudCoverRange[1]}
					valueFormat={sliderValueFormat}
					onChange={(_, r) => setCloudCoverRange(r)}
					ranged
				/>
				<IconButton 
					title='Apply Cloud Cover Filter' styles={RoundButtonStyles} 
					iconProps={FilterIcon} 
					onClick={filterByCloudCover} 
				/>
			</SliderContainer>
			<ResetBtnContainer>
				<DefaultButton 
					iconProps={{ iconName: 'ClearFilter' }} 
					text='Reset Filters' 
					onClick={resetFilters} 
					styles={ResetButtonStyle}
					primary
				/>
			</ResetBtnContainer>
		</Fragment>
	)
}

const ResetButtonStyle: IButtonStyles = { root: { marginTop: '32px' }}
const ActionButtonStyles: IButtonStyles = { label: { fontWeight: '500', marginTop: '1px' }, flexContainer: { alignItems: 'unset' } }
const ActionButtonIconProps: IIconProps = { iconName: 'Back' }
const FilterIcon: IIconProps = { iconName: 'FilterSolid' }
const ComboboxStyles: Partial<IComboBoxStyles> = { container: { marginTop: '8px', marginBottom: '16px' } }

const RoundButtonStyles = { 
	icon: { fontSize: '14px' }, 
	flexContainer: { height: '16px', width: '16px', padding: '8px', borderRadius: '20px', background: 'rgb(134 138 134 / 6%);' }, 
	root: { padding: 0, borderRadius: '20px', top: '5px'}
}

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 18px;
`

const ResetBtnContainer = styled.div`
  display: flex;
  justify-content: center;
`

