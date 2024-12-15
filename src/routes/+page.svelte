<script lang="ts">
	import { type Subject } from '$lib/stores';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import FlashcardGrid from '$lib/components/FlashcardGrid.svelte';

	let selectedSubject: Subject | null = null;
</script>

<div class="container mx-auto p-4">
	<div class="grid grid-cols-[300px_1fr] gap-6">
		<Sidebar bind:selectedSubject />

		<div>
			{#if selectedSubject}
				<FlashcardGrid subject={selectedSubject} />
			{:else}
				<div class="flex items-center justify-center h-full">
					<p class="text-slate-500">Select a subject to view flashcards</p>
				</div>
			{/if}
		</div>
	</div>
</div>
