/**
 * @jest-environment jsdom
 */

import React from 'react'
import ForecastForm from '../taskpane/components/ForecastForm';
import { render, fireEvent, waitFor } from '@testing-library/react';


it('Forecast Form renders correctly', () => {
  const { queryByLabelText, getByLabelText, findByDisplayValue } = render(
    <ForecastForm
      location={{ lat: '', lon: '', text: '' }}
      numOfDays={5}
      startDate={null}
    />,
  );

  expect(queryByLabelText('Location')).toBeTruthy();
  expect(findByDisplayValue('Generate Report')).toBeTruthy();
  expect(findByDisplayValue('Reset Filters')).toBeTruthy();
  expect(findByDisplayValue('Forecast Start Date')).toBeTruthy();
  expect(findByDisplayValue('Number of Days')).toBeTruthy();

});

it('Forecast Form shows error if value not correct after submit', async () => {
  const { container } = render(
    <ForecastForm
      location={{ lat: '', lon: '', text: '' }}
      numOfDays={5}
      startDate={null}
      onSubmit={() => { }}
    />)

  const locationinput = container.querySelector('#location-combobox-input')
  const button = container.querySelector('#generate-report')
  locationinput.value = "Mannheim"
  fireEvent.change(locationinput);

  await waitFor(() => {
    expect(locationinput.value).toBe("Mannheim")
  })

  const locationError = container.querySelector('#location-combobox-error')
  expect(locationError).toBeFalsy()

  fireEvent.click(button)

  await waitFor(() => {
    const locationError = container.querySelector('#location-combobox-error')
    expect(locationError).toBeTruthy()
  })
});