# Updating the Bookshelf

The bookshelf page (`content/bookshelf.md`) displays a "Last updated" date.

## How to Update

### Option 1: Automatic (Recommended)

A git pre-commit hook automatically updates the date when you commit changes to `bookshelf.md`.

**Setup the hook** (one-time setup):

```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook to automatically update lastmod date in bookshelf.md

BOOKSHELF_FILE="content/bookshelf.md"

# Check if bookshelf.md is being committed
if git diff --cached --name-only | grep -q "^${BOOKSHELF_FILE}$"; then
    # Get current timestamp in ISO 8601 format with timezone
    CURRENT_DATE=$(date -Iseconds)

    # Update the lastmod field in the front matter
    sed -i "s/^lastmod = .*$/lastmod = ${CURRENT_DATE}/" "${BOOKSHELF_FILE}"

    # Add the updated file back to the commit
    git add "${BOOKSHELF_FILE}"

    echo "✓ Updated lastmod in ${BOOKSHELF_FILE} to ${CURRENT_DATE}"
fi
EOF

chmod +x .git/hooks/pre-commit
```

Once set up, the date updates automatically whenever you commit changes to `bookshelf.md`.

### Option 2: Manual

Edit the `lastmod` field in the front matter of `content/bookshelf.md`:

```toml
+++
title = "bookshelf"
lastmod = 2024-03-12T13:41:17-05:00
+++
```

Change the date to the current date/time in ISO 8601 format.

## How It Works

- The `lastmod` field in the front matter stores the last update date
- The custom layout at `layouts/bookshelf/single.html` displays this date
- The date appears after the intro text in a styled callout box
- Works reliably on all hosting platforms (including Render)
