export const homeContent = {
  hero: {
    title: "Rummage",
    description: "Local-First AI Photo & File Librarian",
    subtitle: "Intelligent file organization with vector search and AI-powered categorization",
    actions: [
      { 
        label: "View Examples", 
        href: "/examples",
        variant: "primary" as const
      }
    ]
  },
  features: [
    {
      title: "AI-Powered Search",
      description: "Vector embeddings and semantic search to find files by content, not just names",
      icon: "search"
    },
    {
      title: "Local-First", 
      description: "Your data stays on your machine. Full privacy and offline functionality",
      icon: "shield"
    },
    {
      title: "Smart Organization",
      description: "Automatic categorization and duplicate detection using machine learning",
      icon: "brain"
    }
  ],
  stats: {
    components: "25+",
    frameworks: "3+", 
    themes: "12+"
  }
};

export const pageMetadata = {
  title: "Electron Template | UI-Core Showcase",
  description: "Standard React template demonstrating ui-core components working without framework injection in Vite environment."
};