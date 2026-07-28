# Framer Marketplace review fixes

1. Remove TanStack development tooling from the production application and dependency tree.
2. Point the initial favicon reference at the bundled favicon.
3. Surface query and mutation failures through the existing router error UI while preserving intentional domain-validation handling.
4. Rebuild and repack the plugin.
5. Audit the new ZIP for the reviewer-flagged external image, DOM observers, and keyboard listeners.
