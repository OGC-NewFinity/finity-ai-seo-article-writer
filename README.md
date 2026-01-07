# Nova‑XFinity AI Article Writer

> AI-powered SEO-optimized article generation for WordPress with multi-provider support, media generation, and research intelligence.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)

## 🚀 Features

- **Multi-Provider AI Support** - Switch seamlessly between Gemini, OpenAI, Claude, and Llama
- **SEO-Optimized Content** - Yoast-compliant articles with focus keyphrases and meta descriptions
- **Media Generation** - Create images, videos, and audio with AI
- **Research Intelligence** - Real-time web research with source citations
- **WordPress Integration** - Direct publishing to WordPress
- **Draft Management** - Auto-save and draft library
- **3D Modern UI** - Elegant design with smooth animations

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Documentation](#-documentation)
- [Tech Stack](#-tech-stack)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Docker Desktop** (for database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/finity-ai-seo-article-writer.git
   cd finity-ai-seo-article-writer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🔧 Installation

### Frontend Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

### Backend Setup (Optional)

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start Docker services:
   ```bash
   docker-compose up -d
   ```

4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start backend server:
   ```bash
   npm run dev
   ```

See [Setup Guide](docs/development/setup.md) for detailed instructions.

## 📁 Project Structure

```
finity-ai-seo-article-writer/
├── docs/                    # Comprehensive documentation
│   ├── architecture/        # System architecture docs
│   ├── development/         # Development guides
│   ├── design/              # Design system & UI/UX
│   └── integrations/        # Third-party integrations
├── src/                     # Frontend source (planned)
│   ├── features/            # Feature-based modules
│   ├── shared/              # Shared components
│   └── core/                # Core functionality
├── components/              # React components
├── services/                # Frontend services
├── backend/                 # Backend application (planned)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── models/
│   └── docker-compose.yml
├── public/                  # Static assets
├── package.json
└── README.md
```

## 🏗️ Architecture

### System Overview

The application follows a full-stack architecture:

- **Frontend:** React 19 with Vite, feature-based modular structure
- **Backend:** Node.js/Express RESTful API (planned)
- **Database:** PostgreSQL with Prisma ORM (planned)
- **Cache:** Redis for performance optimization (planned)
- **AI Providers:** Multi-provider support with automatic fallback

### Key Components

1. **Writer Module** - Article generation and editing
2. **Research Module** - Web research with citations
3. **MediaHub Module** - Image/video/audio generation
4. **Dashboard** - Overview and statistics
5. **Settings** - Configuration management

See [Architecture Overview](docs/architecture/overview.md) for detailed information.

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[Architecture](docs/architecture/)** - System design and patterns
  - [Overview](docs/architecture/overview.md) - System architecture
  - [Backend](docs/architecture/backend.md) - Backend structure
  - [Database](docs/architecture/database.md) - Database schema
  - [Frontend](docs/architecture/frontend.md) - Frontend structure
  - [API](docs/architecture/api.md) - API documentation

- **[Development](docs/development/)** - Development guides
  - [Setup](docs/development/setup.md) - Environment setup
  - [Code Organization](docs/development/code-organization.md) - Project structure
  - [Contributing](docs/development/contributing.md) - Contribution guidelines

- **[Design](docs/design/)** - UI/UX guidelines
  - [Design System](docs/design/design-system.md) - Colors, typography, 3D theme
  - [Components](docs/design/components.md) - Component library
  - [Animations](docs/design/animations.md) - Animation guidelines

- **[Integrations](docs/integrations/)** - Third-party services
  - [Authentication](docs/integrations/authentication.md) - Auth system
  - [Email](docs/integrations/email-autoresponders.md) - Email service
  - [Open Source Resources](docs/integrations/open-source-resources.md) - Used libraries

## 🛠️ Tech Stack

### Frontend
- **React 19.0.0** - UI library
- **Vite 6.2.0** - Build tool
- **Tailwind CSS** - Styling
- **HTM** - HTML-in-JS templating
- **Font Awesome** - Icons

### Backend (Planned)
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Redis** - Caching
- **JWT** - Authentication

### AI Providers
- **Google Gemini** - Primary provider
- **OpenAI GPT-4o** - Alternative
- **Anthropic Claude** - Alternative
- **Groq Llama** - Alternative

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

See [Contributing Guidelines](docs/development/contributing.md) for more details.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](docs/development/contributing.md) before submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) - AI content generation
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- All open-source contributors and template creators

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/yourusername/finity-ai-seo-article-writer/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/finity-ai-seo-article-writer/discussions)

---

<div align="center">
Made with ❤️ by the Nova‑XFinity AI Team
</div>
