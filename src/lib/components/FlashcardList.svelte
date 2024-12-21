<script lang="ts">
	import { selectedSubject, subjects, selectedFlashcard, settings } from '$lib/stores';
	import AddFlashcardDialog from './AddFlashcardDialog.svelte';
	import EditFlashcardDialog from './EditFlashcardDialog.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { Sparkles } from 'lucide-svelte';
	import AIImportDialog from './AIImportDialog.svelte';
	import { Separator } from '$lib/components/ui/separator';

	let editDialogOpen = false;
	let aiImportOpen = false;
	let flashcardToDelete: any = null;
	let currentFlashcards: any[] = [];

	$: if ($selectedSubject) {
		currentFlashcards = $subjects.find((s) => s.id === $selectedSubject.id)?.flashcards || [];
	}

	$: console.log($selectedFlashcard);

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
</script>

{#if $selectedSubject}
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Button size="default" variant="default" on:click={() => (aiImportOpen = true)}>
					<Sparkles class="w-4 h-4 mr-2 " color={'yellow'} />
					Import with AI
				</Button>
				<Separator orientation="vertical" />
			</div>
			{#if currentFlashcards.length > 0}
				<Button size="default" variant="destructive" on:click={resetAllToHard}
					>Reset All to Hard</Button
				>
			{/if}
			<AddFlashcardDialog />

			<div class="space-x-2">
				{#if $selectedFlashcard}
					<Button size="default" variant="default" on:click={() => (editDialogOpen = true)}
						>Edit</Button
					>
					<Button
						size="default"
						variant="destructive"
						on:click={(e) => {
							e.stopPropagation();
							deleteFlashcard($selectedFlashcard);
						}}>Delete</Button
					>
				{/if}
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
						class={cn(
							'cursor-pointer',
							$selectedFlashcard?.id === flashcard.id && 'bg-secondary/80'
						)}
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
	<AIImportDialog bind:open={aiImportOpen} />
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
