# Vocabulary Generator

An AI-powered Obsidian plugin that automatically generates comprehensive vocabulary entries using Google Gemini AI. Transform any selected word into a detailed vocabulary file with definitions, examples, etymology, and more.

## ✨ Features

- **🤖 AI-Powered**: Uses Google Gemini AI with multiple model options
- **🎛️ Model Selection**: Choose from curated models or enter custom model names
- **🔗 Smart Linking**: Automatically creates wikilinks and vocabulary files
- **🎯 Flexible Prompts**: Use `{}` placeholder for complete control over prompt structure
- **📁 File Management**: Creates new files or appends to existing vocabulary files
- **⚙️ Highly Configurable**: Custom API keys, prompts, and AI models
- **🎨 User-Friendly**: Intuitive right-click context menu integration
- **🧠 Smart Headers**: Avoids duplicate titles when AI generates its own

## 🚀 Quick Start

1. **Install the plugin** in Obsidian
2. **Get a free API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Configure** the plugin in Settings → Vocabulary Generator
4. **Select any word** in your notes and right-click → "Generate Vocabulary"

## 📋 Requirements

- Obsidian(yeah ofcourse)
- Google Gemini API key (it's free if you're broke)
- Internet connection for AI generation
- Suggest using [Auto Note Mover](https://github.com/farux/obsidian-auto-note-mover) plugin for automatically moving note to a specific folder
## ⚙️ Installation

### Manual Installation
1. Download the latest release from GitHub
or clone this repo:
```
git clone https://github.com/quangliz/vocab-gen-obsidian.git
```
2. Extract/Move folder to `.obsidian/plugins/`
3. Enable the plugin in Obsidian settings

## 🔧 Configuration

### 1. Get Your API Key
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Sign in with your Google account
- Create a new API key
- Copy the key for use in the plugin

### 2. Configure Settings
1. Go to **Settings** → **Vocabulary Generator**
2. Paste your API key in the **Gemini API Key** field
3. Choose your preferred **AI model** (or enable custom models)
4. Customize your **AI Prompt Template** (optional)

### 3. Model Selection

#### **Predefined Models** (Recommended for most users)
- **Gemini 2.5 Flash Preview 05-20** ⭐ - Latest and free
- **Gemini 2.0 Flash** I dont know, experience it yourself
- ...

#### **Custom Models** (Advanced users)
- Enable "Use Custom Model" checkbox
- Enter any Gemini model name manually
- Examples: `gemini-2.5-flash-preview-05-20`, `gemini-2.0-flash-exp`

### 4. Prompt Customization
Use `{}` as a placeholder for the selected word in your prompt:

#### Example Prompts:
```
Define the word {} with examples and etymology

I want definition of {} and its synonyms

Explain {} in simple terms with 3 example sentences

Give me a detailed vocabulary breakdown for the word {}. Include:
- Its pronunciation in IPA
- Its meaning in Vietnamese
- All English definitions
- Example sentences for each definition
```

## 📚 Usage

### Basic Usage
1. **Select text** in any note
2. **Right-click** to open context menu
3. **Click "Generate Vocabulary"**
4. The plugin will:
   - Replace selected text with `[[vocab.word|word]]`
   - Create/update `vocab.word.md` with AI-generated content

### Advanced Features

#### Custom Prompts with Placeholders
- Use `{}` placeholder for flexible word positioning
- Create prompts for specific learning styles or languages
- Generate academic, casual, or specialized vocabulary entries

#### Model Flexibility
- **Quick selection**: Choose from proven, fast models
- **Advanced control**: Use cutting-edge experimental models
- **Version specific**: Target exact model versions for consistency

#### Smart File Organization
- **New files**: Creates `vocab.word.md` with fresh content
- **Existing files**: Appends new content with separator (`---`)
- **Smart headers**: Avoids duplicate titles when AI generates its own

## 📖 Examples

### Input
Selected text: `serendipity`
Prompt: `Give me a detailed vocabulary breakdown for the word {}. Include pronunciation, meaning, and examples.`

### Output
**File created**: `vocab.serendipity.md`
**Wikilink**: `[[vocab.serendipity|serendipity]]`

**Generated content** (example with Gemini 2.0 Flash):
```markdown
Here's a detailed vocabulary breakdown for "serendipity":

**Pronunciation (IPA):** /ˌsɛrənˈdɪpɪti/

**Definition:** The occurrence and development of events by chance in a happy or beneficial way.

**Etymology:** Coined by Horace Walpole in 1754, from the Persian fairy tale "The Three Princes of Serendip."

**Example sentences:**
1. Finding that rare book at the garage sale was pure serendipity.
2. Their meeting was a serendipity that changed both their lives.

**Synonyms:** chance, fortune, luck, accident, fate
```

## 🛠️ Development

### Building from Source
```bash
# Clone the repository
git clone https://github.com/quangliz/vocab-gen-obsidian.git
cd vocab-gen-obsidian

# Install dependencies
npm install

# Build the plugin
npm run build
```

### Project Structure
```
├── main.ts              # Main plugin code
├── manifest.json        # Plugin manifest
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── README.md           # Documentation
```

## 🔒 Privacy & Security

- **API Key Security**: Your API key is stored locally in Obsidian
- **No Data Collection**: The plugin doesn't collect or store user data
- **Direct API Calls**: Communications go directly to Google Gemini
- **Offline Fallback**: Shows helpful messages when API is unavailable

## 🔮 Future Work

### Planned Features
- **🌐 Wider AI Integration**: Expand beyond vocabulary to support:
  - **Concept explanations** for complex topics
  - **Historical event summaries** with key facts
  - **Scientific term definitions** with formulas and examples
  - **Code documentation** generation for programming terms
  - **Language learning** support for multiple languages

- **📚 Content Types**: 
  - Academic research summaries
  - Technical documentation generation
  - Creative writing prompts
  - Study guide creation

- **🎯 Specialized Templates**:
  - Subject-specific prompts (Science, History, Literature)
  - Learning level adaptation (Beginner, Intermediate, Advanced)
  - Multi-language support with translations

### Vision
Transform this from a vocabulary-focused tool into a **comprehensive AI-powered knowledge assistant** that can generate contextual, educational content for any selected text across all domains of study.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Priority Areas
- Additional AI model integrations
- Template system for different content types
- Multi-language support
- Performance optimizations

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/quangliz/vocab-gen-obsidian/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/quangliz/vocab-gen-obsidian/discussions)
- **Documentation**: Check this README for usage help

## 🙏 Acknowledgments

- Built for the amazing [Obsidian](https://obsidian.md) community
- Powered by [Google Gemini AI](https://ai.google.dev)
- Inspired by the need for better vocabulary learning tools and AI-assisted knowledge building

---

**Made with ❤️ for knowledge workers, students, and lifelong learners**
