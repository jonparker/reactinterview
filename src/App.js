import "./App.css"
import React, { useState, useEffect } from "react"
import axios from "axios"

const fetchData = () => {
	return axios.get("https://randomuser.me/api/?results=20")
}

const getSortAscCompareFunction = (sortColumn) => (a, b) =>
	a[sortColumn] > b[sortColumn] ? 1 : a[sortColumn] < b[sortColumn] ? -1 : 0

const getSortDescCompareFunction = (sortColumn) => (a, b) =>
	-getSortAscCompareFunction(sortColumn)(a, b)

const getCompareFunction = (sortDirection, sortColumn) => {
	if (sortDirection === "none") {
		return (a, b) => 0
	}
	if (sortDirection === "asc") {
		return getSortAscCompareFunction(sortColumn)
	}
	return getSortDescCompareFunction(sortColumn)
}

const sortLocations = (locations, sort) => {
	locations.sort(getCompareFunction(sort.direction, sort.column))
}

function App() {
	const [locations, setLocations] = useState([])
	const [headers, setHeaders] = useState([])
	const [sort, setSort] = useState({ direction: "none", column: "" })
	const [filter, setFilter] = useState("")

	useEffect(() => {
		fetchData().then((result) => {
			const { results } = result.data
			const flattenedLocations = results.map(({ location }) => ({
				"Street No": location.street.number,
				"Street Name": location.street.name,
				city: location.city,
				state: location.state,
				country: location.country,
				"Post Code": location.postcode,
				latitude: location.coordinates.latitude,
				longitude: location.coordinates.longitude,
				"Timezone Offset": location.timezone.offset,
				"Timezone Description": location.timezone.description,
			}))

			const headers = Object.keys(flattenedLocations[0])
			setHeaders(headers)
			const filteredLocations =
				filter === ""
					? flattenedLocations
					: flattenedLocations.filter((loc) =>
							headers.some(
								(header) =>
									("" + loc[header])
										.toLowerCase()
										.search(new RegExp(filter, "i")) > -1
							)
					  )
			if (sort.direction !== "none") {
				sortLocations(filteredLocations, sort)
			}
			setLocations(filteredLocations)
		})
	}, [sort, filter])

	return (
		<div className="App">
			<div>
				<h1>Locations </h1>
				<label htmlFor="filter">Find:</label>
				<input
					id="filter"
					type="text"
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
				/>
				<div>
					<table>
						<thead>
							<tr>
								{headers.map((header, headerIdx) => (
									<th
										key={headerIdx}
										onClick={(_) => {
											setSort({
												direction: sort.direction !== "asc" ? "asc" : "desc",
												column: header,
											})
										}}
									>
										{header}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{locations.length > 0 ? (
								locations.map((location, locationIdx) => (
									<tr key={locationIdx}>
										{headers.map((header, headerIdx) => (
											<td key={headerIdx}>{location[header]}</td>
										))}
									</tr>
								))
							) : (
								<tr>
									<td colSpan={headers.length}>No results found</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

export default App
