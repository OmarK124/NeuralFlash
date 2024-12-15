<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { GoogleGenerativeAI } from '@google/generative-ai';
	import { selectedSubject, settings, subjects, type Flashcard } from '$lib/stores';

	export let open = false;

	let textInput = '';
	let files: FileList | null = null;
	let temperature = [1];
	let isProcessing = false;
	let error: string | null = null;

	const processWithAI = async (text: string, uploadedFiles: FileList | null) => {
		if (!$settings.googleAIStudioKey) return;
		const genAI = new GoogleGenerativeAI($settings.googleAIStudioKey);
		const model = genAI.getGenerativeModel({
			model: 'gemini-2.0-flash-exp'
		});

		const generationConfig = {
			temperature: temperature[0],
			topP: 0.95,
			topK: 40,
			maxOutputTokens: 8192,
			responseMimeType: 'text/plain'
		};

		try {
			const chatSession = model.startChat({ generationConfig });
			const parts = [];

			if (uploadedFiles) {
				for (const file of Array.from(uploadedFiles)) {
					const fileContent = await file.text();
					parts.push({ text: fileContent });
				}
			}

			if (text) {
				parts.push({ text });
			}

			parts.push({
				text: 'Given this information:\n\nYou\'ll provide smart and comprehensive flashcards in the following json format\n\ne.g.\n[\n{\n"front": TEXT,\n"back":TEXT\n},\n....]\n'
			});

			const result = await chatSession.sendMessage(parts);
			return result.response.text();
		} catch (e) {
			throw new Error('Failed to process with AI: ' + e.message);
		}
	};

	async function handleSubmit() {
		if (!textInput && (!files || files.length === 0)) {
			error = 'Please provide either text input or upload files';
			return;
		}
		if (!$selectedSubject) {
			error = 'Please select a subject first';
			return;
		}

		isProcessing = true;
		error = null;

		try {
			const result = await processWithAI(textInput, files);

			// Parse JSON response, removing any markdown code blocks
			const jsonStr = result?.replace(/```json\n?|\n?```/g, '');
			if (!jsonStr) {
				throw new Error('No flashcards generated');
			}
			const flashcards: any = JSON.parse(jsonStr);

			// Convert AI response to flashcard format
			const newFlashcards: Flashcard[] = flashcards.map((card: any) => ({
				id: crypto.randomUUID(),
				front: {
					text: card.front,
					image: null
				},
				back: {
					text: card.back,
					image: null
				},
				difficulty: 'hard'
			}));

			// Update the selected subject with new flashcards
			$selectedSubject.flashcards = [...$selectedSubject.flashcards, ...newFlashcards];

			// Update the subjects store
			$subjects = $subjects.map((subject) =>
				subject.id === $selectedSubject.id ? $selectedSubject : subject
			);

			open = false;
		} catch (e) {
			error = e.message;
			console.error('Error processing flashcards:', e);
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
				Paste your text or upload files to generate flashcards. At least one is required.
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
				<Label for="files">Upload Files</Label>
				<input
					type="file"
					id="files"
					bind:files
					multiple
					accept=".txt,.pdf,.doc,.docx"
					class="cursor-pointer"
				/>
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
					Processing...
				{:else}
					Create Flashcards
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
