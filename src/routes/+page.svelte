<script>
	import { ListBox, ListBoxItem, ProgressBar } from '@skeletonlabs/skeleton';
	import { faBicycle, faThumbsUp, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { insertAirtableRecord } from '$lib/airtable.js';

	export let data;
	let { activeEvents, allShifts } = data;

	const formatDate = (dateStr) => {
		const [year, month, day] = dateStr.split('-');
		const date = new Date(year, month - 1, day); // Months are 0-indexed in JavaScript Date
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	// Form
	let firstName = '';
	let lastName = '';
	let email = '';
	let phone = '';
	let formProcessing = false;
	let formSubmitted = false;
	let formError = false;

	async function handleSubmit(event) {
		event.preventDefault();
		// Basic validation
		if (firstName && lastName && email && phone) {
			formProcessing = true;

			let submissionData = {
				records: []
			};

			for (const event of activeEvents) {
				// Check if the selectedShifts array has more than 1 element
				if (event.selectedShifts && event.selectedShifts.length > 0) {
					// Create the newEventVolunteer object with updated values
					const newEventVolunteer = {
						fields: {
							fldydbjrOHByPgqXD: firstName,
							fldjTwWTXoUOxNBM6: lastName,
							fldUuVfJ1XcN7A6mj: email,
							fldaRgf4oD3cYVHg4: phone,
							Shifts: event.selectedShifts,
							Event: [event.id]
						}
					};
					submissionData.records.push(newEventVolunteer);
					console.log(submissionData);
				}
			}

			// Insert the new record into Airtable
			try {
				const insertedRecord = await insertAirtableRecord('tblwv8clUixsxO722', submissionData);
			} catch (error) {
				formError = true;
				formProcessing = false;
				console.error('Error inserting record:', error);
				return;
			}

			formSubmitted = true;
			activeEvents = activeEvents.map((item) => ({ ...item, selectedShifts: [] }));
			firstName = '';
			lastName = '';
			email = '';
			phone = '';
			formProcessing = false;
			formError = false;
		} else {
			formError = true;
		}
	}
</script>

<div class="container h-full mx-auto flex justify-center items-center max-w-screen-lg">
	<div class="space-y-5 m-8">
		<a href="https://biketempe.org" target="_blank"
			><img src="/images/TBAG.jpg" alt="Tempe Bicycle Action Group" class="max-w-60 mx-auto" /></a
		>
		<h1 class="h1 text-center">Tempe Bike Volunteer Signup</h1>
		<div class="card p-4 variant-filled-surface max-w-prose mx-auto text-lg">
			<p class="mb-4">
				Welcome to our Volunteer Sign-Up page — where you help make the community more
				bike-friendly! Pick your event(s), drop your name, email, and phone number below, and and
				let’s start a positive chain reaction!
			</p>
			<p class="mb-4">
				We’ll send a follow-up email 10 days before the event, along with reminders as the big day
				pedals closer. We can't wait to ride with you and make these events wheelie great!
			</p>
			<p>
				Questions? Reach out to us at
				<a href="mailto:volunteers@biketempe.org" class="anchor"> volunteers@biketempe.org </a>.
			</p>
		</div>
		{#each activeEvents as event}
			<div class="card p-4 variant-ghost-primary">
				<div class="card-body grid gap-2 grid-cols-1">
					<h3 class="card-title h3">{event.fields.Name}</h3>
					<p class="">
						{#if event.fields.Date}
							<span class="mr-4"
								><strong>Date:</strong>
								{formatDate(event.fields.Date)}
							</span>
						{/if}
						{#if event.fields.Time}
							<strong>Time:</strong>
							{event.fields.Time}
						{/if}
					</p>
					{#if event.fields.Location}
						<p class="">
							<strong>Location:</strong>
							<a
								href="https://www.google.com/maps/search/?api=1&query={event.fields.Location}"
								class="anchor"
								target="_blank">{event.fields.Location}</a
							>
						</p>
					{/if}
					{#if event.fields.Description}
						<p class="">
							{event.fields.Description}
						</p>
					{/if}
					{#if event.fields.Shifts}
						<h5 class="h5 mt-4">
							Choose How You Can Assist <span class="text-sm">(select all that apply)</span>
						</h5>
						<ListBox multiple class="variant-ghost-tertiary !rounded-none">
							{#each allShifts.filter((shift) => shift.fields.Event.includes(event.id)) as shift}
								<ListBoxItem
									bind:group={event.selectedShifts}
									name={event.fields.Name}
									value={shift.id}
									class="!rounded-none text-lg"
									hover="hover:variant-ghost-primary"
								>
									<svelte:fragment slot="lead"
										>{#if event.selectedShifts.includes(shift.id)}<FontAwesomeIcon
												icon={faThumbsUp}
											/>{:else}<FontAwesomeIcon icon={faBicycle} />{/if}</svelte:fragment
									>
									{shift.fields.Name}
								</ListBoxItem>
							{/each}
						</ListBox>
					{/if}
				</div>
			</div>
		{/each}
		<form
			class="card variant-ghost-tertiary form max-w-xl mx-auto px-4 py-2"
			on:submit={handleSubmit}
		>
			<div class="mb-4">
				<label for="firstName">First Name</label>
				<input
					id="firstName"
					type="text"
					bind:value={firstName}
					placeholder="Enter your first name"
					class="input"
					required
				/>
			</div>

			<div class="mb-4">
				<label for="lastName">Last Name</label>
				<input
					id="lastName"
					type="text"
					bind:value={lastName}
					placeholder="Enter your last name"
					class="input"
					required
				/>
			</div>

			<div class="mb-4">
				<label for="email">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="Enter your email"
					class="input"
					required
				/>
			</div>

			<div class="mb-4">
				<label for="phone">Phone</label>
				<input
					id="phone"
					type="tel"
					bind:value={phone}
					placeholder="Enter your phone number"
					class="input"
					required
				/>
			</div>

			{#if formError}
				<aside class="alert variant-filled-error">
					All fields are required. Please fill in all fields.
				</aside>
			{/if}

			{#if activeEvents.filter((item) => item.selectedShifts.length > 0).length > 0}
				<h4 class="h4 mt-4 mb-2">Selected Shifts</h4>
				{#each activeEvents as event}
					{#if event.selectedShifts.length > 0}
						<div class="card py-2 px-4 mb-4 variant-ghost-primary">
							<div class="card-body grid gap-2 grid-cols-1">
								<p class="">
									<strong>{event.fields.Name}</strong> | {formatDate(event.fields.Date)} | {event
										.fields.Time}<br />
								</p>
								<ul>
									{#each event.selectedShifts as shift}
										<li class="ml-4 flex items-center">
											<button
												class="btn-icon btn-icon-sm text-lg hover:text-warning-500"
												type="button"
												on:click={() => {
													event.selectedShifts = event.selectedShifts.filter(
														(item) => item !== shift
													);
												}}
											>
												<FontAwesomeIcon icon={faCircleXmark} class="" />
											</button>
											<strong class=""
												>{allShifts.find((item) => item.id === shift).fields.Name}</strong
											>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					{/if}
				{/each}
			{/if}

			{#if formProcessing}
				<ProgressBar value={undefined} meter="bg-tertiary-500" track="bg-tertiary-500/30" />
			{:else if formSubmitted}
				<aside class="alert variant-filled-success my-4">Thanks for volunteering!</aside>
			{:else}
				<button type="submit" class="btn variant-filled-primary w-full my-4">
					Sign-up To Volunteer!
				</button>
			{/if}
		</form>
	</div>
</div>
