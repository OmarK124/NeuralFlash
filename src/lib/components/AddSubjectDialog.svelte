<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { subjects } from '$lib/stores';
	import { nanoid } from 'nanoid';

	let newSubjectName = '';

	function addSubject() {
		if (!newSubjectName.trim()) return;

		$subjects = [
			...$subjects,
			{
				id: nanoid(),
				name: newSubjectName,
				flashcards: []
			}
		];

		newSubjectName = '';
	}
</script>

<Dialog>
	<DialogTrigger asChild>
		<Button>Add Subject</Button>
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Add New Subject</DialogTitle>
		</DialogHeader>
		<div class="space-y-4">
			<Input bind:value={newSubjectName} placeholder="Subject name" />
			<Button onclick={addSubject}>Create</Button>
		</div>
	</DialogContent>
</Dialog>
