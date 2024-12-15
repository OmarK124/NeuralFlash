<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import FlashcardList from '$lib/components/FlashcardList.svelte';
</script>

<div class="p-4">
	<div class="grid grid-cols-[350px_1fr] gap-6">
		<Sidebar />

		<div>
			<FlashcardList />
		</div>
	</div>
</div>
