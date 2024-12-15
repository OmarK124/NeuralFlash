<script lang="ts">
	import { selectedSubject, subjects, selectedFlashcard, settings } from '$lib/stores';
	import AddFlashcardDialog from './AddFlashcardDialog.svelte';
	import EditFlashcardDialog from './EditFlashcardDialog.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';

	let editDialogOpen = false;
	let flashcardToDelete: any = null;
	let currentFlashcards: any[] = [];

	$: if ($selectedSubject) {
		currentFlashcards = $subjects.find((s) => s.id === $selectedSubject.id)?.flashcards || [];
	}

	function deleteFlashcard(flashcard: any) {
		if ($settings.alwaysAskBeforeDelete) {
			flashcardToDelete = flashcard;
		} else {
			subjects.update((s) => {
				const updated = s.map((subject) => {
					if (subject.id === $selectedSubject?.id) {
						return {
							...subject,
							flashcards: subject.flashcards.filter((f) => f.id !== flashcard.id)
						};
					}
					return subject;
				});
				return updated;
			});
			selectedFlashcard.set(null);
		}
	}

	function resetAllToHard() {
		subjects.update((s) => {
			return s.map((subject) => {
				if (subject.id === $selectedSubject?.id) {
					return {
						...subject,
						flashcards: subject.flashcards.map((f) => ({
							...f,
							difficulty: 'hard'
						}))
					};
				}
				return subject;
			});
		});
	}

	$: console.log($subjects);
</script>

{#if $selectedSubject}
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-bold">{$selectedSubject.name}</h2>
			<div class="space-x-2">
				{#if currentFlashcards.length > 0}
					<Button variant="default" class="bg-red-600 hover:bg-red-700" on:click={resetAllToHard}>
						Reset All to Hard
					</Button>
					<Button
						variant="default"
						class="bg-green-600 hover:bg-green-700"
						on:click={() => goto('/reader')}
					>
						Start Practice
					</Button>
				{/if}
				{#if $selectedFlashcard}
					<Button variant="outline" on:click={() => (editDialogOpen = true)}>Edit</Button>
					<Button
						variant="destructive"
						on:click={(e) => {
							e.stopPropagation();
							deleteFlashcard($selectedFlashcard);
						}}>Delete</Button
					>
				{/if}
				<AddFlashcardDialog />
			</div>
		</div>

		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Front Content</Table.Head>
					<Table.Head>Back Content</Table.Head>
					<Table.Head>Difficulty</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each currentFlashcards as flashcard (flashcard.id)}
					<Table.Row
						on:click={() => selectedFlashcard.set(flashcard)}
						class={cn('cursor-pointer', $selectedFlashcard?.id === flashcard.id && 'bg-muted')}
					>
						<Table.Cell>
							<div class="flex items-center gap-2">
								{#if flashcard.front.image}
									<span class="text-muted-foreground">[Image]</span>
								{/if}
								{#if flashcard.front.text}
									<span>{flashcard.front.text}</span>
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								{#if flashcard.back.image}
									<span class="text-muted-foreground">[Image]</span>
								{/if}
								{#if flashcard.back.text}
									<span>{flashcard.back.text}</span>
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell>
							<Badge
								variant="destructive"
								class={cn(flashcard.difficulty === 'easy' && 'bg-green-600')}
							>
								{flashcard.difficulty === 'easy' ? 'Easy' : 'Hard'}
							</Badge>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<EditFlashcardDialog bind:open={editDialogOpen} flashcard={$selectedFlashcard} />
	<AlertDialog.Root open={flashcardToDelete !== null}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you sure?</AlertDialog.Title>
				<AlertDialog.Description>
					This will permanently delete this flashcard. This action cannot be undone.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel on:click={() => (flashcardToDelete = null)}>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action
					on:click={() => {
						subjects.update((s) => {
							const updated = s.map((subject) => {
								if (subject.id === $selectedSubject?.id) {
									return {
										...subject,
										flashcards: subject.flashcards.filter((f) => f.id !== flashcardToDelete.id)
									};
								}
								return subject;
							});
							return updated;
						});
						flashcardToDelete = null;
						selectedFlashcard.set(null);
					}}
				>
					Delete
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{:else}
	<div class="flex items-center justify-center h-full">
		<p class="text-slate-500">Select a subject to view flashcards</p>
	</div>
{/if}
