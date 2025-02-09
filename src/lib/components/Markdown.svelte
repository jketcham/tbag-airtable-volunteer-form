<script>
	import { marked } from 'marked';

	export let text = '';

	// Set marked options to prevent XSS and handle breaks
	marked.setOptions({
		sanitize: true,
		breaks: true,
		gfm: true
	});

	// Replace single newlines with <br> tags before processing markdown
	$: processedText = text?.replace(/(?<!\n)\n(?!\n)/g, '  \n');
	$: html = processedText ? marked(processedText) : '';
</script>

<div
	class="prose dark:prose-invert max-w-none prose-p:my-2 prose-p:!text-white dark:prose-p:!text-white prose-headings:!text-white dark:prose-headings:!text-white prose-a:!text-white dark:prose-a:!text-white prose-strong:!text-white dark:prose-strong:!text-white"
>
	{@html html}
</div>
