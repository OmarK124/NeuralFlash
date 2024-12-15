<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { selectedSubject, subjects } from '$lib/stores';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';

	let currentIndex = 0;
	let isFlipped = false;
	let remainingCards: any[] = [];
	let currentCard: any;
	let frontImageUrl: string | null = null;
	let backImageUrl: string | null = null;
	let isAnimating = false;
	const slideDirection = writable('');

	onMount(() => {
		if (!$selectedSubject) {
			goto('/');
			return;
		}
		remainingCards = [...($subjects.find((s) => s.id === $selectedSubject.id)?.flashcards || [])];
		currentCard = remainingCards[0];

		// Convert Uint8Array to URL if images exist
		if (currentCard) {
			if (currentCard.front.image) {
				const blob = new Blob([currentCard.front.image], { type: 'image/png' });
				frontImageUrl = URL.createObjectURL(blob);
			}
			if (currentCard.back.image) {
				const blob = new Blob([currentCard.back.image], { type: 'image/png' });
				backImageUrl = URL.createObjectURL(blob);
			}
		}

		// Keyboard controls
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.code === 'Space') {
				e.preventDefault();
				isFlipped = !isFlipped;
			} else if (e.code === 'ArrowRight') {
				handleAnswer('easy');
			} else if (e.code === 'ArrowLeft') {
				handleAnswer('hard');
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => {
			// Clean up URLs when component is destroyed
			if (frontImageUrl) URL.revokeObjectURL(frontImageUrl);
			if (backImageUrl) URL.revokeObjectURL(backImageUrl);
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	async function handleAnswer(difficulty: 'easy' | 'hard') {
		isFlipped = false;
		if (isAnimating) return;
		isAnimating = true;

		// Set slide direction
		$slideDirection = difficulty === 'easy' ? 'right' : 'left';

		// Wait for animation to complete
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Clean up existing URLs
		if (frontImageUrl) URL.revokeObjectURL(frontImageUrl);
		if (backImageUrl) URL.revokeObjectURL(backImageUrl);

		// Update the difficulty in the subjects store
		const card = remainingCards[currentIndex];
		if ($selectedSubject) {
			$subjects = $subjects.map((subject) => {
				if (subject.id === $selectedSubject.id) {
					return {
						...subject,
						flashcards: subject.flashcards.map((fc) =>
							fc.id === card.id ? { ...fc, difficulty } : fc
						)
					};
				}
				return subject;
			});
		}

		// Update remaining cards
		if (difficulty === 'easy') {
			remainingCards = remainingCards.filter((_, i) => i !== currentIndex);
			currentIndex = Math.min(currentIndex, remainingCards.length - 1);
		} else {
			remainingCards = remainingCards.filter((_, i) => i !== currentIndex);
			remainingCards.push(card);
			currentIndex = Math.min(currentIndex, remainingCards.length - 1);
		}
		currentCard = remainingCards[currentIndex];

		// Create new URLs for next card
		if (currentCard) {
			if (currentCard.front.image) {
				const blob = new Blob([currentCard.front.image], { type: 'image/png' });
				frontImageUrl = URL.createObjectURL(blob);
			} else {
				frontImageUrl = null;
			}
			if (currentCard.back.image) {
				const blob = new Blob([currentCard.back.image], { type: 'image/png' });
				backImageUrl = URL.createObjectURL(blob);
			} else {
				backImageUrl = null;
			}
		}

		isFlipped = false;
		isAnimating = false;
		$slideDirection = '';
	}
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-4 relative">
	<div class="absolute top-4 left-4 flex items-center gap-4">
		<Button variant="outline" on:click={() => goto('/')}>← Back</Button>
		<span class="text-sm text-muted-foreground">
			Remaining: {remainingCards.length}
		</span>
	</div>

	{#if remainingCards.length > 0}
		<div
			class="w-[800px] h-[600px] perspective-1000 cursor-pointer"
			class:slide-left={$slideDirection === 'left'}
			class:slide-right={$slideDirection === 'right'}
			on:click={() => (isFlipped = !isFlipped)}
		>
			<div
				class="relative w-full h-full transition-transform duration-500"
				style="transform-style: preserve-3d; transform: {isFlipped
					? 'rotateY(180deg)'
					: 'rotateY(0deg)'}"
			>
				<!-- Front -->
				<div
					class="absolute w-full h-full bg-card border rounded-xl p-8 flex flex-col items-center justify-center backface-hidden"
				>
					{#if currentCard.front.image}
						<img
							src={frontImageUrl}
							alt="Front"
							class="max-w-full max-h-[400px] w-auto h-auto object-contain mb-6"
						/>
					{/if}
					{#if currentCard.front.text}
						<p class="text-2xl text-center">{currentCard.front.text}</p>
					{/if}
				</div>

				<!-- Back -->
				<div
					class="absolute w-full h-full bg-card border rounded-xl p-8 flex flex-col items-center justify-center backface-hidden"
					style="transform: rotateY(180deg);"
				>
					{#if currentCard.back.image}
						<img
							src={backImageUrl}
							alt="Back"
							class="max-w-full max-h-[400px] w-auto h-auto object-contain mb-6"
						/>
					{/if}
					{#if currentCard.back.text}
						<p class="text-2xl text-center">{currentCard.back.text}</p>
					{/if}
				</div>
			</div>
		</div>

		<div class="mt-8 flex gap-4">
			<Button variant="destructive" on:click={() => handleAnswer('hard')} class="w-32">
				Hard (←)
			</Button>
			<Button
				variant="default"
				class="w-32 bg-green-600 hover:bg-green-700"
				on:click={() => handleAnswer('easy')}
			>
				Easy (→)
			</Button>
		</div>
	{:else}
		<div class="text-center" in:fade>
			<h2 class="text-2xl font-bold mb-4">All Done! 🎉</h2>
			<Button variant="outline" on:click={() => goto('/')}>Return Home</Button>
		</div>
	{/if}
</div>

<style>
	.perspective-1000 {
		perspective: 1000px;
	}

	.backface-hidden {
		backface-visibility: hidden;
	}

	.slide-left {
		animation: slideLeft 0.3s ease-out;
	}

	.slide-right {
		animation: slideRight 0.3s ease-out;
	}

	@keyframes slideLeft {
		to {
			transform: translateX(-150%) rotate(-20deg);
			opacity: 0;
		}
	}

	@keyframes slideRight {
		to {
			transform: translateX(150%) rotate(20deg);
			opacity: 0;
		}
	}
</style>
