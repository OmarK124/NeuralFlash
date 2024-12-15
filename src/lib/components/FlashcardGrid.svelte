<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { selectedSubject } from '$lib/stores';
</script>

{#if $selectedSubject}
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold">{$selectedSubject.name}</h2>
			<Button variant="outline">Add Flashcard</Button>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each $selectedSubject.flashcards as flashcard}
				<Card class="p-4">
					<div class="aspect-[3/2] flex items-center justify-center border rounded-lg mb-2">
						{#if flashcard.front.text}
							<p>{flashcard.front.text}</p>
						{:else if flashcard.front.image}
							<img
								src={`data:image/jpeg;base64,${btoa(String.fromCharCode(...flashcard.front.image))}`}
								alt="Front"
								class="object-contain max-h-full"
							/>
						{/if}
					</div>
				</Card>
			{/each}
		</div>
	</div>
{:else}
	<div class="flex items-center justify-center h-full">
		<p class="text-slate-500">Select a subject to view flashcards</p>
	</div>
{/if}
