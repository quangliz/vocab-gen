import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { GoogleGenAI } from "@google/genai";

interface VocabGenSettings {
	apiKey: string;
	prompt: string;
	model: string;
	useCustomModel: boolean;
	customModel: string;
	noteNamePattern: string;
}

const DEFAULT_SETTINGS: VocabGenSettings = {
	apiKey: '',
	prompt: 'Generate a comprehensive vocabulary definition with examples, etymology, and usage for the word: {}',
	model: 'gemini-2.0-flash',
	useCustomModel: false,
	customModel: 'gemini-2.0-flash',
	noteNamePattern: '[[vocab.{}|{}]]'
}

// Available Gemini models with descriptions (reduced to most popular)
const GEMINI_MODELS = [
	{ value: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash Preview 05-20 (Recommended)', desc: 'Latest, fast, and balanced' },
	{ value: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Stable, fast, cost-effective' }
];

export default class VocabGenPlugin extends Plugin {
	settings: VocabGenSettings;

	async onload() {
		await this.loadSettings();
		this.registerContextMenu();
		this.addSettingTab(new VocabGenSettingTab(this.app, this));
	}

	/**
	 * Register the context menu item for vocabulary generation
	 */
	private registerContextMenu(): void {
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor: Editor, view: MarkdownView) => {
				menu.addItem((item) => {
					item
						.setTitle('Generate Vocabulary')
						.setIcon('book-open')
						.onClick(async () => {
							await this.handleVocabGeneration(editor);
						});
				});
			})
		);
	}

	/**
	 * Handle the vocabulary generation process
	 */
	private async handleVocabGeneration(editor: Editor): Promise<void> {
		const selectedText = editor.getSelection().trim();
		
		if (!selectedText) {
			new Notice('Please select text first');
			return;
		}

		try {
			// Generate wikilink using custom pattern
			const wikilink = this.settings.noteNamePattern.replace(/{}/g, selectedText);
			editor.replaceSelection(wikilink);
			
			// Extract filename from the wikilink pattern
			const fileName = this.extractFileName(this.settings.noteNamePattern, selectedText);
			
			// Generate and save vocabulary file
			await this.createOrUpdateVocabFile(selectedText, fileName);
			
		} catch (error) {
			console.error('Vocab generation error:', error);
			new Notice(`Error: ${error.message}`);
		}
	}

	/**
	 * Extract filename from the note pattern
	 */
	private extractFileName(pattern: string, word: string): string {
		// Replace {} with the word in the pattern
		const fullPattern = pattern.replace(/{}/g, word);
		
		// Extract filename from wikilink format [[filename|display]] or [[filename]]
		const wikilinkMatch = fullPattern.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
		if (wikilinkMatch) {
			return `${wikilinkMatch[1]}.md`;
		}
		
		// If not a wikilink format, use the pattern directly as filename
		return `${fullPattern}.md`;
	}

	/**
	 * Create or update the vocabulary file with AI-generated content
	 */
	private async createOrUpdateVocabFile(word: string, fileName: string): Promise<void> {
		const fileExists = await this.app.vault.adapter.exists(fileName);
		
		// Generate AI content
		const aiContent = await this.generateAIContent(word);
		
		if (!fileExists) {
			// Check if AI content already has a header/title
			const hasHeader = aiContent.trim().startsWith('#') || 
							 aiContent.trim().startsWith('**') ||
							 aiContent.toLowerCase().includes(word.toLowerCase()) && aiContent.trim().split('\n')[0].length < 100;
			
			// Only add header if AI content doesn't already have one
			const finalContent = hasHeader ? aiContent : `# ${word}\n\n${aiContent}`;
			
			await this.app.vault.create(fileName, finalContent + '\n');
			new Notice(`Created vocabulary file: ${fileName}`);
		} else {
			// Append to existing file
			const file = this.app.vault.getFileByPath(fileName);
			if (file) {
				const content = await this.app.vault.read(file);
				await this.app.vault.modify(file, content + `\n---\n\n${aiContent}\n`);
				new Notice(`Updated vocabulary file: ${fileName}`);
			}
		}
	}

	/**
	 * Generate AI content using Gemini API
	 */
	private async generateAIContent(word: string): Promise<string> {
		// Check if API key is configured
		if (!this.settings.apiKey) {
			return `**${word}**\n\n*Please configure your Gemini API key in plugin settings to generate AI content.*`;
		}

		try {
			const ai = new GoogleGenAI({ apiKey: this.settings.apiKey });
			
			// Replace {} placeholder with the word, or append if no placeholder exists
			const promptText = this.settings.prompt.includes('{}') 
				? this.settings.prompt.replace('{}', word)
				: this.settings.prompt + word;
			
			// Get the model to use
			const modelToUse = this.settings.useCustomModel ? this.settings.customModel : this.settings.model;
			
			const response = await ai.models.generateContent({
				model: modelToUse,
				contents: promptText,
			});

			const aiResponse = response.text;
			
			if (!aiResponse) {
				throw new Error('No content generated by AI');
			}

			return aiResponse;
			
		} catch (error) {
			console.error('AI generation error:', error);
			
			// Return a helpful error message instead of throwing
			if (error.message.includes('API key')) {
				return `**${word}**\n\n*Invalid API key. Please check your Gemini API key in plugin settings.*`;
			}
			
			return `**${word}**\n\n*Error generating AI content: ${error.message}*`;
		}
	}

	onunload() {
		// Plugin cleanup - no specific cleanup needed for this plugin
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class VocabGenSettingTab extends PluginSettingTab {
	plugin: VocabGenPlugin;

	constructor(app: App, plugin: VocabGenPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Header
		containerEl.createEl('h2', { text: 'Vocabulary Generator Settings' });

		// Description
		containerEl.createEl('p', {
			text: 'Configure your Gemini AI integration for intelligent vocabulary generation.'
		});

		// Model Setting
		new Setting(containerEl)
			.setName('Gemini Model')
			.setDesc('Choose which Gemini AI model to use for vocabulary generation')
			.addDropdown(dropdown => {
				GEMINI_MODELS.forEach(model => {
					dropdown.addOption(model.value, model.name);
				});
				dropdown.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
						// Update model description dynamically
						if (!this.plugin.settings.useCustomModel) {
							const selectedModel = GEMINI_MODELS.find(m => m.value === value);
							modelDescEl.textContent = selectedModel ? selectedModel.desc : 'Select a model above';
						}
					});
				// Hide dropdown if custom model is enabled
				dropdown.selectEl.style.display = this.plugin.settings.useCustomModel ? 'none' : 'block';
			});

		// Add model descriptions
		const modelDescEl = containerEl.createDiv({ cls: 'setting-item-description' });
		modelDescEl.style.marginTop = '-10px';
		modelDescEl.style.marginBottom = '20px';
		modelDescEl.style.fontStyle = 'italic';
		modelDescEl.style.color = 'var(--text-muted)';
		const selectedModel = GEMINI_MODELS.find(m => m.value === this.plugin.settings.model);
		modelDescEl.textContent = this.plugin.settings.useCustomModel 
			? `Custom model: ${this.plugin.settings.customModel}` 
			: (selectedModel ? selectedModel.desc : 'Select a model above');

		// Custom Model Toggle
		new Setting(containerEl)
			.setName('Use Custom Model')
			.setDesc('Enable this to enter your own model name instead of using the predefined options')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useCustomModel)
				.onChange(async (value) => {
					this.plugin.settings.useCustomModel = value;
					await this.plugin.saveSettings();
					
					// Toggle UI elements
					const dropdown = containerEl.querySelector('.dropdown') as HTMLSelectElement;
					const customInput = containerEl.querySelector('#custom-model-input') as HTMLInputElement;
					
					if (dropdown) dropdown.style.display = value ? 'none' : 'block';
					if (customInput) customInput.style.display = value ? 'block' : 'none';
					
					// Update description
					if (value) {
						modelDescEl.textContent = `Custom model: ${this.plugin.settings.customModel}`;
					} else {
						const selectedModel = GEMINI_MODELS.find(m => m.value === this.plugin.settings.model);
						modelDescEl.textContent = selectedModel ? selectedModel.desc : 'Select a model above';
					}
				}));

		// Custom Model Input
		new Setting(containerEl)
			.setName('Custom Model Name')
			.setDesc('Enter the exact model name (e.g., gemini-2.0-flash-exp, gemini-1.5-flash-001)')
			.addText(text => {
				text.setPlaceholder('gemini-2.0-flash-exp')
					.setValue(this.plugin.settings.customModel)
					.onChange(async (value) => {
						this.plugin.settings.customModel = value;
						await this.plugin.saveSettings();
						// Update description if using custom model
						if (this.plugin.settings.useCustomModel) {
							modelDescEl.textContent = `Custom model: ${value}`;
						}
					});
				text.inputEl.id = 'custom-model-input';
				text.inputEl.style.display = this.plugin.settings.useCustomModel ? 'block' : 'none';
				text.inputEl.style.width = '100%';
				text.inputEl.style.fontFamily = 'monospace';
			});

		// API Key Setting
		new Setting(containerEl)
			.setName('Gemini API Key')
			.setDesc('Your Google Gemini API key for AI content generation')
			.addText(text => {
				text.setPlaceholder('Enter your API key here...')
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value.trim();
						await this.plugin.saveSettings();
					});
				// Make the input field wider
				text.inputEl.style.width = '100%';
				text.inputEl.style.minWidth = '400px';
			});

		// Prompt Setting
		new Setting(containerEl)
			.setName('AI Prompt Template')
			.setDesc('Customize how vocabulary content is generated. Use {} as a placeholder for the selected word. If no {} is found, the word will be appended to the end.')
			.addTextArea(text => {
				text.setPlaceholder('Define the word {} with examples and etymology...')
					.setValue(this.plugin.settings.prompt)
					.onChange(async (value) => {
						this.plugin.settings.prompt = value;
						await this.plugin.saveSettings();
					});
				// Make the text area more flexible and user-friendly
				text.inputEl.style.width = '100%';
				text.inputEl.style.minWidth = '400px';
				text.inputEl.style.minHeight = '150px';
				text.inputEl.style.resize = 'vertical';
				text.inputEl.style.fontFamily = 'monospace';
				text.inputEl.style.padding = '10px';
				text.inputEl.style.lineHeight = '1.5';
				text.inputEl.style.tabSize = '4';
				text.inputEl.style.overflowY = 'auto';
			});

		// Note Naming Pattern Setting
		new Setting(containerEl)
			.setName('Note Naming Pattern')
			.setDesc('Customize how wikilinks and note names are generated. Use {} as placeholder for the selected word.')
			.addText(text => {
				text.setPlaceholder('[[vocab.{}|{}]]')
					.setValue(this.plugin.settings.noteNamePattern)
					.onChange(async (value) => {
						this.plugin.settings.noteNamePattern = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.style.width = '100%';
				text.inputEl.style.fontFamily = 'monospace';
			});

		// Add pattern examples
		const patternExamplesEl = containerEl.createDiv({ cls: 'setting-item-description' });
		patternExamplesEl.style.marginTop = '-10px';
		patternExamplesEl.style.marginBottom = '20px';
		patternExamplesEl.style.fontStyle = 'italic';
		patternExamplesEl.style.color = 'var(--text-muted)';
		
		const examplesTitle = patternExamplesEl.createEl('div', { text: 'Pattern Examples:' });
		examplesTitle.style.fontWeight = 'bold';
		examplesTitle.style.marginBottom = '5px';
		
		const patternExamplesList = patternExamplesEl.createEl('ul');
		patternExamplesList.style.margin = '0';
		patternExamplesList.style.paddingLeft = '20px';
		
		const examples = [
			'[[vocab.{}|{}]] → [[vocab.apple|apple]]',
			'[[{}]] → [[apple]]', 
			'[[dictionary/{}|{}]] → [[dictionary/apple|apple]]',
			'[[{}-definition|{}]] → [[apple-definition|apple]]',
			'[[words.{}]] → [[words.apple]]'
		];
		
		examples.forEach(example => {
			const li = patternExamplesList.createEl('li', { text: example });
			li.style.fontSize = '0.9em';
			li.style.margin = '2px 0';
		});

		// Help section
		const helpEl = containerEl.createDiv();
		helpEl.createEl('h3', { text: 'Setup Instructions' });
		
		const instructionsEl = helpEl.createEl('ol');
		instructionsEl.createEl('li', { text: 'Get your free API key from Google AI Studio' });
		instructionsEl.createEl('li', { text: 'Paste it in the API Key field above' });
		instructionsEl.createEl('li', { text: 'Customize the prompt using {} as placeholder for the word' });
		instructionsEl.createEl('li', { text: 'Select any word in your notes and right-click to generate vocabulary' });

		// Examples section
		const examplesEl = helpEl.createDiv();
		examplesEl.createEl('h4', { text: 'Example Prompts:' });
		const examplesList = examplesEl.createEl('ul');
		examplesList.createEl('li', { text: 'Define the word {} with examples and etymology' });
		examplesList.createEl('li', { text: 'I want definition of {} and its synonyms' });
		examplesList.createEl('li', { text: 'Explain {} in simple terms with 3 example sentences' });
		examplesList.createEl('li', { text: 'Generate academic vocabulary entry for: {}' });
		
		// Report issue link
		const reportEl = helpEl.createDiv();
		reportEl.createEl('h4', { text: 'Report Issue:' });
		const reportList = reportEl.createEl('ul');
		reportList.createEl('li', { text: 'Open an issue on GitHub' });
		const linkItem = reportList.createEl('li');
		linkItem.createEl('a', {
			text: 'Link to issue',
			href: 'https://github.com/quangliz/vocab-gen-obsidian/issues'
		});
		
		// API Key link
		const linkEl = helpEl.createEl('p');
		linkEl.appendText('Get your API key: ');
		linkEl.createEl('a', {
			text: 'Google AI Studio',
			href: 'https://aistudio.google.com/app/apikey'
		});
	}
}