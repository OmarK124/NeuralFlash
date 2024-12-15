<script lang="ts">
	import { Settings, Sun, Moon } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { resetMode, setMode } from 'mode-watcher';
	import { settings } from '$lib/stores';
	import { Switch } from '$lib/components/ui/switch';
</script>

<Sheet.Root>
	<Sheet.Trigger asChild let:builder>
		<Button builders={[builder]} variant="ghost" size="icon">
			<Settings class="w-5 h-5" />
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="left">
		<Sheet.Header>
			<Sheet.Title>Settings</Sheet.Title>
			<Sheet.Description>Customize your application preferences</Sheet.Description>
		</Sheet.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<span class="text-right">Theme</span>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="outline" size="icon">
							<Sun
								class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
							/>
							<Moon
								class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
							/>
							<span class="sr-only">Toggle theme</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						{#each [{ mode: 'light' }, { mode: 'dark' }, { mode: 'system' }] as { mode }}
							<DropdownMenu.Item
								onclick={() => {
									settings.update((s) => ({ ...s, colorMode: mode as any }));
									mode === 'system' ? resetMode() : setMode(mode as any);
								}}
							>
								{mode[0].toUpperCase() + mode.slice(1)}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<div class="grid grid-cols-4 items-center gap-4">
				<span class="text-right">Confirm Deletions</span>
				<Switch
					checked={$settings.alwaysAskBeforeDelete}
					onCheckedChange={(checked) => {
						settings.update((s) => ({ ...s, alwaysAskBeforeDelete: checked }));
					}}
				/>
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
