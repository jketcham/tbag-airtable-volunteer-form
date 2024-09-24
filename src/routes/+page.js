import { fetchAirtableData } from '$lib/airtable.js';

export async function load() {
	const eventsTableId = 'tblczGtiFeVYyhpkV';
	const shiftsTableId = 'tblR0am5IwtJNR1vC';

	const allEvents = await fetchAirtableData(eventsTableId);

	// Filter out only active records
	const activeEvents = allEvents

		.filter((record) => record.fields.Active === true)
		.sort((a, b) => new Date(a.fields.Date) - new Date(b.fields.Date))
		.map((item) => ({ ...item, selectedShifts: [] }));

	const allShifts = await fetchAirtableData(shiftsTableId);

	return {
		activeEvents,
		allShifts
	};
}
