<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import { subjects } from '$lib/stores';
	import { nanoid } from 'nanoid';
	import { Plus } from 'lucide-svelte';

	let newSubjectName = '';
	let open = false;
	let error = ''; // Add error state

	function addSubject() {
		if (!newSubjectName.trim()) {
			error = 'Subject name cannot be empty';
			return;
		}

		error = ''; // Clear error
		$subjects = [
			...$subjects,
			{
				id: nanoid(),
				name: newSubjectName,
				flashcards: []
			}
		];

		newSubjectName = '';
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button size="icon" variant="ghost"><Plus /></Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add New Subject</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-4">
			<Input bind:value={newSubjectName} placeholder="Subject name" />
			{#if error}
				<p class="text-sm text-red-500">{error}</p>
			{/if}
		</div>
		<Dialog.Footer>
			<Button type="submit" onclick={addSubject}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
