<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { selectedSubject, subjects } from '$lib/stores';
	import FlashcardForm from './FlashcardForm.svelte';

	export let open = false;
	let frontText = '';
	let backText = '';
	let frontImage: Uint8Array | null = null;
	let backImage: Uint8Array | null = null;
	let frontImagePreview: string | null = null;
	let backImagePreview: string | null = null;
	let difficulty: 'hard' | 'easy' = 'hard';

	function clearForm() {
		frontText = '';
		backText = '';
		frontImage = null;
		backImage = null;
		frontImagePreview = null;
		backImagePreview = null;
		difficulty = 'hard';
	}

	function addFlashcard() {
		if (!$selectedSubject) return;

		const newFlashcard = {
			id: crypto.randomUUID(),
			front: {
				text: frontText || undefined,
				image: frontImage || undefined
			},
			back: {
				text: backText || undefined,
				image: backImage || undefined
			},
			difficulty
		};

		$selectedSubject.flashcards = [...$selectedSubject.flashcards, newFlashcard];
		$subjects = $subjects.map((subject) =>
			subject.id === $selectedSubject.id ? $selectedSubject : subject
		);

		clearForm();
		open = false;
	}
</script>

<Dialog bind:open>
	<DialogTrigger>
		<Button variant="outline">Add Flashcard</Button>
	</DialogTrigger>
	<DialogContent class="sm:max-w-[600px]">
		<DialogHeader>
			<DialogTitle>Add New Flashcard</DialogTitle>
		</DialogHeader>
		<FlashcardForm
			bind:frontText
			bind:backText
			bind:frontImage
			bind:backImage
			bind:frontImagePreview
			bind:backImagePreview
			bind:difficulty
			submitLabel="Create"
			onSubmit={addFlashcard}
		/>
	</DialogContent>
</Dialog>
