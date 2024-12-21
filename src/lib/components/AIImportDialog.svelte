<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider/index.js';

	import { selectedSubject, settings, subjects, type Flashcard } from '$lib/stores';
	import { LoaderCircle } from 'lucide-svelte';
	import { open as file_open } from '@tauri-apps/plugin-dialog';
	import { BaseDirectory, readFile } from '@tauri-apps/plugin-fs';

	export let open = false;

	const apiKey = $settings.googleAIStudioKey;

	let textInput = '';
	let filePath: string | null = null;
	let temperature = [1];
	let isProcessing = false;
	let error: string | null = null;

	async function selectFile() {
		try {
			const selected = await file_open({
				multiple: false,
				directory: false,
				filters: [
					{
						name: 'PDF',
						extensions: ['pdf']
					}
				]
			});

			if (typeof selected === 'string') {
				filePath = selected;
				console.log('Selected file:', filePath);
			} else if (selected === null) {
				console.log('File selection was canceled.');
				filePath = null;
			} else {
				console.error('Unexpected return type from file selection.');
				filePath = null;
			}
		} catch (err) {
			console.error('Error selecting file:', err);
			error = 'Failed to select file';
		}
	}

	async function createFlashcards() {
		if (!apiKey) {
			error = 'API Key is required. Please set it in settings.';
			return;
		}
		if (!textInput && !filePath) {
			error = 'Please provide either text input or select a file.';
			return;
		}

		isProcessing = true;
		error = null;
		let uploadedFileUri: string | null = null;

		try {
			let fileContent = '';
			if (filePath) {
				const file = await readFile(filePath);
				const fileBlob = new Blob([file], { type: 'application/pdf' });

				const uploadUrlResponse = await fetch(
					`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
					{
						method: 'POST',
						headers: {
							'X-Goog-Upload-Command': 'start',
							'X-Goog-Upload-Header-Content-Length': fileBlob.size.toString(),
							'X-Goog-Upload-Header-Content-Type': 'application/pdf',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							file: { display_name: filePath.split('/').pop() || 'document.pdf' }
						})
					}
				);

				if (!uploadUrlResponse.ok) {
					const errorData = await uploadUrlResponse.json();
					throw new Error(
						`File upload start failed: ${uploadUrlResponse.status} - ${errorData.error?.message}`
					);
				}

				const uploadUrlData = await uploadUrlResponse.json();
				const uploadUrl = uploadUrlData.upload_uri;

				const uploadResponse = await fetch(uploadUrl, {
					method: 'POST',
					headers: {
						'X-Goog-Upload-Command': 'upload, finalize',
						'Content-Type': 'application/pdf'
					},
					body: fileBlob
				});

				if (!uploadResponse.ok) {
					const errorData = await uploadResponse.json();
					throw new Error(
						`File upload failed: ${uploadResponse.status} - ${errorData.error?.message}`
					);
				}

				const uploadFinalizeData = await uploadResponse.json();
				uploadedFileUri = uploadFinalizeData.fileUri;
			}

			let parts: any = [
				{
					text: `Give comprehensive flashcards on this information \n\n${textInput}`
				}
			];
			if (uploadedFileUri) {
				parts.push({
					fileData: {
						fileUri: uploadedFileUri,
						mimeType: 'application/pdf'
					}
				});
			}
			const generateContentResponse = await fetch(
				`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						contents: [
							{
								role: 'user',
								parts: parts
							}
						],
						generationConfig: {
							temperature: temperature[0],
							topK: 40,
							topP: 0.95,
							maxOutputTokens: 8192,
							responseMimeType: 'application/json',
							responseSchema: {
								type: 'object',
								properties: {
									' response': {
										type: 'array',
										items: {
											type: 'object',
											properties: {
												front: {
													type: 'string'
												},
												back: {
													type: 'string'
												}
											},
											required: ['front', 'back']
										}
									}
								},
								required: [' response']
							}
						}
					})
				}
			);

			if (!generateContentResponse.ok) {
				const errorData = await generateContentResponse.json();
				throw new Error(
					`Flashcard generation failed: ${generateContentResponse.status} - ${errorData.error?.message}`
				);
			}

			const responseData = await generateContentResponse.json();
			//get candidates[0]
			let jsonText = '';
			let flashcardsResponse = responseData.candidates?.[0]?.content?.parts;
			for (let i = 0; i < flashcardsResponse.length; i++) {
				jsonText += flashcardsResponse[i].text;
			}
			if (jsonText) {
				try {
					const parsedFlashcards = JSON.parse(jsonText)[' response'];
					if (parsedFlashcards && Array.isArray(parsedFlashcards)) {
						const newFlashcards: Flashcard[] = parsedFlashcards.map((card: any) => ({
							id: crypto.randomUUID(),
							front: { text: card.front, image: undefined },
							back: { text: card.back, image: undefined },
							difficulty: 'hard' // Default difficulty
						}));

						// Update the subjects store
						if ($selectedSubject) {
							$subjects = $subjects.map((subject) => {
								if (subject.id === $selectedSubject.id) {
									return {
										...subject,
										flashcards: [...subject.flashcards, ...newFlashcards]
									};
								}
								return subject;
							});
						}

						open = false; // Close the dialog on success
					} else {
						throw new Error('Invalid flashcard format received from the API.');
					}
				} catch (parseError) {
					console.error('Error parsing flashcards:', parseError);
					error = 'Error parsing the generated flashcards.';
				}
			} else {
				error = 'No flashcards were generated.';
			}
		} catch (err: any) {
			console.error('Error during flashcard generation:', err);
			error = err.message || 'An unexpected error occurred.';
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
			<Button type="submit" on:click={createFlashcards} disabled={isProcessing}>
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
