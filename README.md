# Elegant Text Editor

A modern, feature-rich text editor built with Next.js, Tiptap, and Tailwind CSS. This editor provides a seamless writing experience with advanced formatting options, AI-powered content generation, and commenting capabilities.

## Features

- **Rich Text Editing**: Format text with headings, bold, italic, underline, and more
- **AI Content Generation**: Generate content using AI with the Gemini API
- **Comments System**: Add, view, and manage comments on your text
- **Color Formatting**: Apply text and background colors
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

## Technologies Used

- **Next.js**: React framework for server-rendered applications
- **Tiptap**: Headless, framework-agnostic rich text editor
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for React
- **Google Gemini API**: AI-powered content generation
- **TypeScript**: Type-safe JavaScript

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key (for AI features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/elegant-text-editor.git
   cd elegant-text-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

- **Text Formatting**: Use the toolbar at the top to format your text
- **AI Generation**: Select text and click the AI button to generate content
- **Comments**: Select text and click the comment button to add a comment
- **Color Formatting**: Use the color picker to apply text and background colors

## Project Structure

- `/app`: Next.js app router pages and layouts
- `/components`: React components
  - `/rich-text-editor`: Tiptap editor implementation
  - `/Navbar.tsx`: Editor toolbar
  - `/GenerateContentPopup.tsx`: AI content generation popup
  - `/CommentPopup.tsx`: Comment creation and editing
- `/extensions`: Tiptap extensions
- `/public`: Static assets

## Video link: https://drive.google.com/drive/folders/1CPcqJJE3OZ8n4wUk77JcQCm4B-TUV1mu?usp=drive_link

## Acknowledgments

- [Tiptap](https://tiptap.dev/) for the rich text editor
- [Google Gemini](https://deepmind.google/technologies/gemini/) for the AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) for the styling 