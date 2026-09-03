#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

echo "Creating/updating conda environment from environment.yml..."
conda env create -f environment.yml 2>/dev/null || conda env update -f environment.yml --prune

for RC in ~/.bashrc ~/.zshrc; do
  [ -f "$RC" ] || continue
  grep -qF "conda activate mpep-kindle" "$RC" || echo "conda activate mpep-kindle" >> "$RC"
done

if ! command -v claude >/dev/null 2>&1; then
  echo "Installing Claude Code CLI..."
  curl -fsSL https://claude.ai/install.sh | bash
fi

cat <<'EOF'

Setup complete.

- Open a new terminal (or run `conda activate mpep-kindle`) to pick up pandoc/poppler.
- Run `claude` and follow the printed link to log in — auth is per-machine, so this
  codespace needs its own login even though your local machine is already signed in.
EOF
