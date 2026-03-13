# CLAUDE.md — Documentation

## Overview

Project documentation including PRDs, API specifications, LLM prompts, and operational notes.

## Directory Structure

```
docs/
├── PRDS/                   # Product Requirements Documents
├── API-specifications/     # Backend API design documents
├── prompts/                # LLM prompts for PRD generation
├── remind/                 # Deferred work items and pending tasks
├── bugs/                   # Issue tracking and root cause analysis
└── sql/                    # Database scripts
```

## Naming Conventions

### Numbering
- Sequential 3-digit prefix: `001`, `002`, `003`, ...
- Sub-features use hyphen-decimal: `004-1`
- Numbers must be unique and monotonically increasing across each directory.

### File Names
- **PRDs**: `NNN-feature-name.md` (e.g., `007-mermaid-chart-rendering.md`)
- **Prompts**: `NNN-feature-prd-generation-prompt.md` (e.g., `007-mermaid-rendering-prd-generation-prompt.md`)
- **API specs**: `api-{domain}-specification.md` (e.g., `api-agent-specification.md`)
- **Remind**: `NNN-task-name.md`
- **Bugs**: `NNN-bug-title.md` or descriptive name

## Document Language

- All documentation is written in **Korean**.
- Technical terms (API names, library names, code references) remain in English.

## Document Standards

### PRD Format
- Metadata header: Version, Created date, Module
- Numbered sections: Overview → Architecture → Components → Security → Performance → Styling → Implementation → Scope
- Tables for structured specifications (tech stack, props, API params)
- Code blocks for examples and pseudocode

### Prompt Format
- Usage instructions at top
- Structured prompt body with: Role, Input, Background, Requirements, Output format, Constraints
- Prompt engineering techniques table at bottom (for reference)

### API Specification Format
- Metadata: creation date, target module, version
- Sections: Overview → Common response format → Endpoints → Enums → Summary table
- Each endpoint: method, path, auth, request/response schemas, error codes
