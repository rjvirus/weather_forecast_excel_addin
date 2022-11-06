import React, { useRef, useState } from "react";
import { IComboBoxOption } from "@fluentui/react";
import styled from "styled-components";
import * as Utils from "../utils";
import ForecastForm from "./ForecastForm";
import { FiltersPage } from "./FiltersPage";
import { AppConfig } from "../config";
import { ILocationData } from "../interfaces";

interface AppProps {
  isOfficeInitialized: boolean;
}

const DefaultLocationValue = { lat: '', lon: '', text: '' }
const startingRow = 3 // starting row for the data table

export default function App(props: AppProps) {
  const [location, setLocation] = useState<ILocationData>(DefaultLocationValue)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [numOfDays, setNumOfDays] = useState<number>(1);
  const [isFilterPageOpen, setIsFilterPageOpen] = useState(false)
  const [conditionOptions, setConditionOptions] = useState<IComboBoxOption[] | null>(null);
  const locationNameRef = useRef('');
  // used to keep the location name if the location input is changed with invalid input and 
  // user wants to filter and generate sheet on existing report in excel. 

  const generateSheet = async (daysData: Array<any>, initialRun: boolean) => {
    await Excel.run(async (context) => {
      const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
      currentWorksheet.getRange().clear(); // clear all previous data after every submission

      const columnCount = Utils.columnKeys.length // get weather data attributes of a day to create columns from key name
      const columnKeyLabels = Utils.columnKeys.map(ele => {
        return Utils.columnKeyText[ele] // get Column display labels for the key names
      })

      const forecastReportTable = currentWorksheet.tables.add(currentWorksheet.getRangeByIndexes(startingRow, 0, 1, columnCount), true);
      forecastReportTable.name = "ForecastReport";
      forecastReportTable.getHeaderRowRange().values = [columnKeyLabels];
      const columnRange = forecastReportTable.getHeaderRowRange();
      columnRange.format.autofitColumns();
      columnRange.format.fill.color = '9fcdb3'
      columnRange.format.font.bold = true
      columnRange.format.font.size = 11
      columnRange.format.font.color = '004b1c'

      const conditionOptions: IComboBoxOption[] = [];
      conditionOptions.push({ key: 0, text: "Show All" })
      daysData.forEach((day) => {
        const valueForRow = []
        Utils.columnKeys.forEach((key) => {
          if (Utils.FormatDateKeys.includes(key)) {
            valueForRow.push("'" + Utils.formatDateDisplay(day[key] as string))
          } else if (Utils.FormatTempKeys.includes(key)) {
            valueForRow.push(Utils.FahrenheitToCelcius(day[key]))
          } else if (Utils.FormatTimeKeys.includes(key)) {
            valueForRow.push("'" + day[key])
          } else if (key === 'conditions') {
            const conditionValue = day[key] as string;
            if (initialRun) {
              Utils.splitAndPushData(conditionOptions, conditionValue)
            }
            valueForRow.splice(1, 0, conditionValue);
          } else {
            valueForRow.push(day[key])
          }
        })
        forecastReportTable.rows.add(null, [valueForRow])
      })
      const tableDataRange = forecastReportTable.getDataBodyRange()
      tableDataRange.format.fill.color = 'e9f5ee'
      tableDataRange.format.font.bold = false
      tableDataRange.format.autofitColumns();
      tableDataRange.format.font.size = 10
      columnRange.format.font.color = 'black'
      if (initialRun) {
        locationNameRef.current = location.text
        setConditionOptions(conditionOptions)
      }

      const headingRange = currentWorksheet.getRange("A1")
      headingRange.load()
      headingRange.values = [[locationNameRef.current]]
      headingRange.format.font.bold = true
      headingRange.format.font.size = 16
      headingRange.format.font.color = "0e5c2f"

      const subheadingRange = currentWorksheet.getRange("A2")
      subheadingRange.load()
      subheadingRange.values = [['Weather Forecast Report from ' + Utils.formatDateDisplay(startDate.toDateString()) + ' to ' + Utils.formatDateDisplay(Utils.addDaysToDate(startDate, numOfDays).toDateString())]]
      subheadingRange.format.font.bold = true
      subheadingRange.format.font.size = 14
      subheadingRange.format.font.color = "0e5c2f"

      forecastReportTable.style = 'TableStyleMedium25'
      forecastReportTable.load('tableStyle')
      await context.sync();
    }).catch(function (error) {
      console.log("Error: " + error);
      if (error instanceof OfficeExtension.Error) {
        console.log("Debug info: " + JSON.stringify(error.debugInfo));
      }
    });
  }

  const onSubmitSettings = () => {
    const { lat, lon } = location;
    if (lat && lon && startDate) {
      const endDate = Utils.addDaysToDate(startDate, numOfDays)
      const prom = fetch(`${AppConfig.TimeWeatherApiURL}${lat},${lon}/${Utils.formatDate(startDate)}/${Utils.formatDate(endDate)}?key=${AppConfig.TimeWeatherApiKey}&elements=${Object.keys(Utils.columnKeyText).join(",")}`)
      prom.then(response => response.json()).then((data) => {
        generateSheet(data.days, true);
      }).catch((e) => {
        console.error(e)
      })
    }
  }

  const onClickBack = async () => {
    await Excel.run(async (context) => {
      const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
      const expensesTable = currentWorksheet.tables.getItem('ForecastReport');
      expensesTable.clearFilters()
      await context.sync();
    }).catch(function (error) {
      console.log("Error: " + error);
      if (error instanceof OfficeExtension.Error) {
        console.log("Debug info: " + JSON.stringify(error.debugInfo));
      }
    });
    setIsFilterPageOpen(false)
  }

  if (!props.isOfficeInitialized) {
    return 'Loading....'
  }

  return (
    <AppContainer>
      <Card>
        {!isFilterPageOpen ? (
          <ForecastForm
            location={location}
            numOfDays={numOfDays}
            startDate={startDate}
            onChangeLocation={setLocation}
            onChangeNumOfDays={setNumOfDays}
            onChangeStartDate={setStartDate}
            onSubmit={onSubmitSettings}
            toggleFilter={conditionOptions && setIsFilterPageOpen}
          />
        ) : (
          <FiltersPage
            conditionOptions={conditionOptions}
            onClickBack={onClickBack}
          />
        )}
      </Card>
    </AppContainer>
  );
}

const Card = styled.div`
  display: block;
  padding: 24px;
  border: 1px solid #4e9668;
  border-radius: 20px;
  background-color: #e9f5ee;
  min-width: 75%;
`

const AppContainer = styled.div`
  background: linear-gradient(138deg, rgba(0,75,28,1) 0%, rgba(63,129,89,1) 39%, rgba(159,205,179,1) 82%);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const SliderStyles = { titleLabel: { marginBottom: '8px' }, root: { width: '100%' } }
