<!-- <script lang="ts">
	let { children } = $props();
</script>

{@render children()} -->
<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher />
<slot />
