<script lang="ts">
	import { Button } from './ui/button';

	export let image: Uint8Array | null = null;
	export let imagePreview: string | null = null;
	export let onImageChange: (image: Uint8Array | null, preview: string | null) => void;
	export let onPaste: (e: ClipboardEvent) => void;

	let dragActive = false;

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;

		const file = e.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/')) {
			loadImageFile(file);
		}
	}

	async function loadImageFile(file: File) {
		const buffer = await file.arrayBuffer();
		const newImage = new Uint8Array(buffer);
		const newPreview = URL.createObjectURL(file);
		onImageChange(newImage, newPreview);
	}

	function clearImage() {
		onImageChange(null, null);
	}
</script>

<div
	class="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer relative"
	class:border-primary={dragActive}
	on:dragenter|preventDefault={() => (dragActive = true)}
	on:dragleave|preventDefault={() => (dragActive = false)}
	on:dragover|preventDefault
	on:drop={handleDrop}
	on:paste={onPaste}
	tabindex="0"
>
	{#if imagePreview}
		<div class="relative">
			<img src={imagePreview} alt="Preview" class="max-h-[200px] mx-auto" />
			<Button
				variant="destructive"
				class="absolute top-2 right-2"
				size="icon"
				type="button"
				on:click={clearImage}
			>
				✕
			</Button>
		</div>
	{:else}
		<p class="text-sm text-muted-foreground">Drop an image here or paste from clipboard</p>
	{/if}
</div>
