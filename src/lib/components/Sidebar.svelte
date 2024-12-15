<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { cn } from '$lib/utils.js';
	import { isEditMode, selectedSubject, subjects, settings, selectedFlashcard } from '$lib/stores';
	import AddSubjectDialog from '$lib/components/AddSubjectDialog.svelte';
	import SettingsSheet from '$lib/components/SettingsSheet.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Pencil, Plus } from 'lucide-svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';
	import { Separator } from './ui/separator';

	let editedName = '';
	let subjectToDelete: any = null;
	let subjectToEdit: any = null;
	function deleteSubject(subject: any) {
		if ($settings.alwaysAskBeforeDelete) {
			subjectToDelete = subject;
		} else {
			subjects.update((s) => s.filter((s) => s.id !== subject.id));
			if ($selectedSubject?.id === subject.id) {
				selectedSubject.set(null);
			}
		}
	}
	function handleEditSubmit() {
		if (editedName.trim() && editedName !== subjectToEdit.name) {
			subjects.update((s) =>
				s.map((s) => {
					if (s.id === subjectToEdit.id) {
						return { ...s, name: editedName };
					}
					return s;
				})
			);
			subjectToEdit = null;
		}
	}

	function getDifficultyCounts(flashcards: any[]) {
		return {
			easy: flashcards.filter((f) => f.difficulty === 'easy').length,
			hard: flashcards.filter((f) => f.difficulty === 'hard').length
		};
	}

	$: if (selectedSubject) selectedFlashcard.set(null);
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<Button size="default" variant="default" on:click={() => goto('/reader')}>Start Practice</Button
		>
		<div class="flex gap-2">
			<SettingsSheet />
			<Separator orientation="vertical" />
			<Button variant="ghost" size="icon" onclick={() => isEditMode.update((v) => !v)}>
				<Pencil />
			</Button>
			<AddSubjectDialog />
		</div>
	</div>

	<div class="space-y-2">
		{#each $subjects as subject}
			<div class="card-container" class:flipped={$isEditMode}>
				<div class="card-inner relative h-full">
					<div class="card-front absolute h-full w-full">
						<Card
							class={cn(
								'p-4 cursor-pointer hover:bg-secondary/80',
								$selectedSubject?.id === subject.id && 'bg-muted'
							)}
							onclick={() => {
								console.log('subject');
								selectedSubject.set(subject);
							}}
						>
							<div>
								<h3 class="font-medium">{subject.name}</h3>
								<div class="flex gap-2 mt-1">
									{#if subject.flashcards.length > 0}
										{@const counts = getDifficultyCounts(subject.flashcards)}
										<Badge class="bg-green-600">{counts.easy} Easy</Badge>
										<Badge variant="destructive">{counts.hard} Hard</Badge>
									{:else}
										<p class="text-sm">No cards</p>
									{/if}
								</div>
							</div>
						</Card>
					</div>
					<div class="card-back absolute h-full w-full">
						<Card class={cn('p-4 cursor-pointer hover:bg-secondary/80 transition-colors')}>
							<div class="flex justify-between items-center">
								<div>
									<h3 class="font-medium">{subject.name}</h3>
									<p class="text-sm">{subject.flashcards.length} cards</p>
								</div>
								<div class="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => {
											subjectToEdit = subject;
											editedName = subject.name;
										}}>Edit</Button
									>
									<Button variant="destructive" size="sm" onclick={() => deleteSubject(subject)}>
										Delete
									</Button>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<AlertDialog.Root open={subjectToDelete !== null}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete the subject "{subjectToDelete?.name}" and all its flashcards.
				This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => (subjectToDelete = null)}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					subjects.update((s) => s.filter((s) => s.id !== subjectToDelete.id));
					if ($selectedSubject?.id === subjectToDelete.id) {
						selectedSubject.set(null);
					}
					subjectToDelete = null;
				}}
			>
				Delete
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root open={subjectToEdit !== null}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Subject</Dialog.Title>
			<Dialog.Description>Change the name of the subject.</Dialog.Description>
		</Dialog.Header>
		<div class="py-4">
			<Input bind:value={editedName} placeholder="Subject name" />
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (subjectToEdit = null)}>Cancel</Button>
			<Button onclick={handleEditSubmit}>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	.card-container {
		perspective: 1000px;
		height: 80px; /* Add fixed height */
		margin-bottom: 8px; /* Add spacing between cards */
	}

	.card-inner {
		transition: transform 0.6s;
		transform-style: preserve-3d;
		z-index: 2;
	}

	.card-container.flipped .card-inner {
		transform: rotateY(180deg);
	}
	.card-front,
	.card-back {
		backface-visibility: hidden;
	}
	.card-back {
		transform: rotateY(180deg);
	}
</style>
