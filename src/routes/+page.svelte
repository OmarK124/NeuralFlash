<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import FlashcardGrid from '$lib/components/FlashcardGrid.svelte';
</script>

<div class="container mx-auto p-4">
	<div class="grid grid-cols-[350px_1fr] gap-6">
		<Sidebar />

		<div>
			<FlashcardGrid />
		</div>
	</div>
</div>
