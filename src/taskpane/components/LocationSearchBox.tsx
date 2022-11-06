import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ComboBox, IComboBox, IComboBoxOption } from '@fluentui/react';
import { debounce } from '../utils';
import { AppConfig } from '../config';
import { ILocationSearchBox } from '../interfaces';

export default function LocationSearchBox(props: ILocationSearchBox) {
	const { showError } = props;
	const [options, setOptions] = useState<IComboBoxOption[]>()
	const [isLoading, setIsLoading] = useState(false);
	const [matchNotFound, setMatchNotFound] = useState(false);
	const comboBoxRef = useRef<IComboBox>(null);
	const selectedKey = useRef('');
	const menuBoxControl = useCallback((data) => comboBoxRef.current?.focus(data), []);

	useEffect(() => {
		if(showError) { // priority given to for validation error when there is a change 
			setMatchNotFound(false)
		}
	}, [showError])

	const onChangeLocationInput = (text: string) => {
		if(text !== '') {
			setIsLoading(true)
		}
		selectedKey.current = ''
		setOptions([])
		menuBoxControl(false)
		props.onChange(undefined, undefined, undefined, text)
		fetchLocationOptionsDebounced(text)
	}

	function fetchLocationOptions(query: string) {
		if (query != '') {
			const fetchDataPromise = fetch(`${AppConfig.OpenWeatherGeocodeURL}${query}&limit=8&appid=${AppConfig.OpenWeatherApiKey}`)
			fetchDataPromise.then(response => response.json()).then((data) => {
				let options: IComboBoxOption[] = []
				if (data.length) {
					setMatchNotFound(false)
					data.forEach((element, index) => {
						options.push({
							key: index,
							data: {
								lat: element.lat,
								lon: element.lon
							},
							text: `${element.name}${element.state ? (', ' + element.state) : ''}, ${element.country}`
						})
					});
					setOptions(options)
					menuBoxControl(true)
				} else {
					throw new Error("Not a valid input")
				}
			}).catch(e => {
				console.error("No matches found")
				setMatchNotFound(true);
				console.error(e)
			})
		}
		setIsLoading(false)
	}

	const fetchLocationOptionsDebounced = useCallback(debounce(fetchLocationOptions, 1000), [])

	const checkValidationError = props.showError ? 'Required. Make sure to select from the option' : undefined
	const checkIfNoMatchFound = matchNotFound ? 'No matches found, Please try again.' :  checkValidationError

	return (
		<ComboBox
			componentRef={comboBoxRef}
			styles={{ container: { marginBottom: '12px' }}}
			label="Location"
			placeholder="Enter and select location from suggestion"
			id='location-combobox'
			allowFreeform={true}
			autoComplete={'on'}
			options={options}
			selectedKey={selectedKey.current}
			onInputValueChange={onChangeLocationInput}
			onItemClick={props.onChange}
			onChange={props.onChange}
			useComboBoxAsMenuWidth={true}
			errorMessage={isLoading ? 'Finding matches...' : checkIfNoMatchFound}
			required
			text={props.text}
		/>
	)
}

