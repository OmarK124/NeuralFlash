<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import ImageDropper from './ImageDropper.svelte';
	import type { Flashcard } from '$lib/stores';

	export let frontText = '';
	export let backText = '';
	export let frontImage: Uint8Array | null = null;
	export let backImage: Uint8Array | null = null;
	export let frontImagePreview: string | null = null;
	export let backImagePreview: string | null = null;
	export let submitLabel = 'Create';
	export let onSubmit: () => void;

	function handleImageChange(
		side: 'front' | 'back',
		image: Uint8Array | null,
		preview: string | null
	) {
		if (side === 'front') {
			frontImage = image;
			frontImagePreview = preview;
		} else {
			backImage = image;
			backImagePreview = preview;
		}
	}

	function handlePaste(side: 'front' | 'back', e: ClipboardEvent) {
		const items = e.clipboardData?.items;
		if (!items) return;

		for (const item of items) {
			if (item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) {
					loadImageFile(side, file);
				}
				break;
			}
		}
	}

	async function loadImageFile(side: 'front' | 'back', file: File) {
		const buffer = await file.arrayBuffer();
		const image = new Uint8Array(buffer);
		const preview = URL.createObjectURL(file);
		handleImageChange(side, image, preview);
	}
</script>

<svelte:window on:paste={handlePaste} />

<form class="space-y-4" on:submit|preventDefault={onSubmit}>
	<div class="space-y-4">
		<div class="space-y-2">
			<Label>Front Side</Label>
			<Input bind:value={frontText} placeholder="Front side text" />
			<ImageDropper
				image={frontImage}
				imagePreview={frontImagePreview}
				onImageChange={(image, preview) => handleImageChange('front', image, preview)}
				onPaste={(e) => handlePaste('front', e)}
			/>
		</div>

		<div class="space-y-2">
			<Label>Back Side</Label>
			<Input bind:value={backText} placeholder="Back side text" />
			<ImageDropper
				image={backImage}
				imagePreview={backImagePreview}
				onImageChange={(image, preview) => handleImageChange('back', image, preview)}
				onPaste={(e) => handlePaste('back', e)}
			/>
		</div>
	</div>
	<Button type="submit">{submitLabel}</Button>
</form>
