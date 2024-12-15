<script lang="ts">
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { selectedSubject, subjects } from '$lib/stores';
	import type { Flashcard } from '$lib/stores';
	import FlashcardForm from './FlashcardForm.svelte';

	export let open = false;
	export let flashcard: Flashcard;

	let frontText = '';
	let backText = '';
	let frontImage: Uint8Array | null = null;
	let backImage: Uint8Array | null = null;
	let frontImagePreview: string | null = null;
	let backImagePreview: string | null = null;

	$: if (open && flashcard) {
		frontText = flashcard.front.text ?? '';
		backText = flashcard.back.text ?? '';
		if (flashcard.front.image) {
			frontImage = flashcard.front.image;
			frontImagePreview = URL.createObjectURL(new Blob([flashcard.front.image]));
		}
		if (flashcard.back.image) {
			backImage = flashcard.back.image;
			backImagePreview = URL.createObjectURL(new Blob([flashcard.back.image]));
		}
	}

	function updateFlashcard() {
		if (!$selectedSubject) return;

		const updatedFlashcard = {
			...flashcard,
			front: {
				text: frontText || undefined,
				image: frontImage || undefined
			},
			back: {
				text: backText || undefined,
				image: backImage || undefined
			}
		};

		$selectedSubject.flashcards = $selectedSubject.flashcards.map((fc) =>
			fc.id === flashcard.id ? updatedFlashcard : fc
		);

		$subjects = $subjects.map((subject) =>
			subject.id === $selectedSubject.id ? $selectedSubject : subject
		);

		open = false;
	}
</script>

<Dialog bind:open>
	<DialogContent class="sm:max-w-[600px]">
		<DialogHeader>
			<DialogTitle>Edit Flashcard</DialogTitle>
		</DialogHeader>
		<FlashcardForm
			bind:frontText
			bind:backText
			bind:frontImage
			bind:backImage
			bind:frontImagePreview
			bind:backImagePreview
			submitLabel="Update"
			onSubmit={updateFlashcard}
		/>
	</DialogContent>
</Dialog>
