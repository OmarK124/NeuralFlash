<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { cn } from '$lib/utils.js';
	import { subjects, type Subject } from '$lib/stores';
	import AddSubjectDialog from '$lib/components/AddSubjectDialog.svelte';
	import SettingsSheet from '$lib/components/SettingsSheet.svelte';

	export let selectedSubject: Subject | null;
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold">Subjects</h2>
		<SettingsSheet />
		<AddSubjectDialog />
	</div>

	<div class="space-y-2">
		{#each $subjects as subject}
			<Card
				class={cn(
					'p-4 cursor-pointer hover:bg-secondary/80 transition-colors',
					selectedSubject?.id === subject.id && 'bg-primary/80'
				)}
				onclick={() => (selectedSubject = subject)}
			>
				<h3 class="font-medium">{subject.name}</h3>
				<p class="text-sm">{subject.flashcards.length} cards</p>
			</Card>
		{/each}
	</div>
</div>
