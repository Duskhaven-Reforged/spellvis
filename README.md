# What it does

This tool was made to automate adding emote spells by copying a certain spell (taken as input in the CLI) and replacing certain keys with a new ID (taken as input in the CLI as well).

# Requirements

The CLI command will only work in a directory with `Spell.csv`, `SpellVisual.csv`, `SpellVisualEffectName.csv` and `SpellVisualKit.csv` inside. These are to be exported using WDBX.

# Usage

- Run `npm i -g spellvis`
- Run `dupespell dupespell` in the directory with the files stated above
