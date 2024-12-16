<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { selectedSubject, settings, subjects } from '$lib/stores';
	import { nanoid } from 'nanoid';
	import { LoaderCircle } from 'lucide-svelte';
	import { open as TauriOpen } from '@tauri-apps/plugin-dialog';
	export let open = false;

	let textInput = '';
	let filePath: string | null = null;
	let temperature = [1];
	let isProcessing = false;
	let error: string | null = null;

	async function selectFile() {
		try {
			const selected = await TauriOpen({
				multiple: false,
				directory: false
			});
			filePath = selected;
		} catch (err) {
			console.error('Error selecting file:', err);
			error = 'Failed to select file';
		}
		console.log('Selected file:', filePath);
	}

	async function handleSubmit() {
		if (!$settings.googleAIStudioKey) {
			error = 'API key is required. Please add it in settings.';
			return;
		}
		if (!textInput && !filePath) {
			error = 'Please provide either text input or select a file';
			return;
		}

		isProcessing = true;
		error = null;

		try {
			const formData = new FormData();
			formData.append('temperature', temperature[0].toString());
			formData.append('text', textInput);
			formData.append('api_key', $settings.googleAIStudioKey);
			if (filePath) {
				formData.append('filepath', filePath);
			}

			const response = await fetch('/api/flashcards/generate', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error('Failed to generate flashcards');
			}

			const data = await response.json();

			// Update the selected subject with new flashcards
			if ($selectedSubject) {
				const newFlashcards = data.response.map((card: any) => ({
					id: nanoid(),
					front: { text: card.front },
					back: { text: card.back },
					difficulty: 'hard'
				}));

				subjects.update((subjs) => {
					const updatedSubjects = subjs.map((subj) => {
						if (subj.id === $selectedSubject.id) {
							return {
								...subj,
								flashcards: [...subj.flashcards, ...newFlashcards]
							};
						}
						return subj;
					});
					return updatedSubjects;
				});
			}

			open = false;
		} catch (err) {
			console.error('Error:', err);
			error = 'Failed to generate flashcards. Please try again.';
		} finally {
			isProcessing = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Import Flashcards with AI</Dialog.Title>
			<Dialog.Description>
				Paste your text or select a file to generate flashcards. At least one is required.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="text-input">Text Input</Label>
				<Textarea
					id="text-input"
					bind:value={textInput}
					placeholder="Paste your text here (e.g., book excerpts, notes, articles)..."
					class="min-h-[100px]"
				/>
			</div>
			<div class="grid gap-2">
				<Label>File Selection</Label>
				<div class="flex gap-2 items-center">
					<Button type="button" on:click={selectFile}>Select File</Button>
					{#if filePath}
						<span class="text-sm text-gray-600">{filePath}</span>
					{/if}
				</div>
			</div>
			<div class="grid gap-2">
				<Label for="temperature">Temperature: {temperature[0].toFixed(2)}</Label>
				<Slider id="temperature" min={0} max={2} step={0.05} bind:value={temperature} />
			</div>
			{#if error}
				<div class="text-red-500 text-sm">{error}</div>
			{/if}
		</div>
		<Dialog.Footer>
			<Dialog.Close>Cancel</Dialog.Close>
			<Button type="submit" on:click={handleSubmit} disabled={isProcessing}>
				{#if isProcessing}
					<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
					Processing...
				{:else}
					Create Flashcards
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
