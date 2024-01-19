#!/usr/bin/env node
import chalk from "chalk";
import { program } from "commander";
import fs from "fs";
import * as csv from "csv";
import inquirer from "inquirer";
program.name("dupespell").command("dupespell").action(dupeSpell);
async function processCSV(fileName, condition, update, newSpellId) {
    let hitCount = 0;
    let dupeRow = [];
    console.log(`${chalk.cyan(`Starting ${fileName} duplication`)}`);
    const fileStream = fs
        .createReadStream(`./${fileName}`)
        .pipe(csv.parse({ delimiter: "," }));
    fileStream.on("data", function (row) {
        if (condition(row)) {
            hitCount++;
            update(row);
            dupeRow.push(`${row}`);
        }
    });
    await new Promise((resolve, reject) => {
        fileStream
            .on("end", async function () {
            const csvString = dupeRow[0];
            if (hitCount > 1) {
                const answers = await inquirer.prompt({
                    type: "confirm",
                    name: "continue",
                    message: `Found ${hitCount} rows, would you like to duplicate them all?`,
                    default: false,
                    when: () => hitCount > 0,
                });
                if (answers.continue) {
                    await appendCSV(csvString, parseInt(`${newSpellId}`), fileName);
                }
            }
            else {
                await appendCSV(csvString, parseInt(`${newSpellId}`), fileName);
            }
            resolve();
        })
            .on("error", reject);
    });
}
async function dupeSpell() {
    // column 130 for spell.csv
    const questions = [
        {
            type: "input",
            name: "spellId",
            message: "Enter the spellId:",
            validate: function (value) {
                var valid = !isNaN(parseInt(value));
                return valid || "Please enter a valid number";
            },
            filter: Number,
        },
        {
            type: "input",
            name: "newSpellId",
            message: "Enter the new spellId:",
            validate: function (value) {
                var valid = !isNaN(parseInt(value));
                return valid || "Please enter a valid number";
            },
            filter: Number,
        },
        {
            type: "input",
            name: "effectName",
            message: "Enter the new Effect Name:",
            filter: String,
        },
    ];
    const answers = await inquirer.prompt(questions);
    const spellId = answers.spellId;
    const newSpellId = answers.newSpellId;
    const effectName = answers.effectName;
    console.log(`${chalk.green("Searching for spell: " + spellId)}`);
    await processCSV("Spell.csv", (row) => `${row[129]}` === `${spellId}`, (row) => {
        row[129] = newSpellId;
    }, newSpellId);
    await spellVisualEdit(spellId, newSpellId, effectName);
}
async function spellVisualEdit(spellId, newSpellId, effectName) {
    console.log(`${chalk.cyan("Editing SpellVisual.csv")}`);
    await processCSV("SpellVisual.csv", (row) => `${row[0]}` === `${spellId}`, (row) => {
        row[0] = newSpellId;
        row[3] = newSpellId;
    }, newSpellId);
    await spellVisualEffectEdit(spellId, newSpellId, effectName);
}
async function spellVisualEffectEdit(spellId, newSpellId, effectName) {
    console.log(`${chalk.cyan("Editing SpellVisualEffectName.csv")}`);
    await processCSV("SpellVisualEffectName.csv", (row) => `${row[0]}` === `${spellId}`, (row) => {
        row[0] = newSpellId;
        row[1] = effectName;
    }, newSpellId);
    await spellVisualKitEdit(spellId, newSpellId);
}
async function spellVisualKitEdit(spellId, newSpellId) {
    console.log(`${chalk.cyan("Editing SpellVisualKit.csv")}`);
    await processCSV("SpellVisualKit.csv", (row) => `${row[0]}` === `${spellId}`, (row) => {
        row[0] = newSpellId;
        row[4] = newSpellId;
    }, newSpellId);
}
function appendCSV(csvString, spellId, fileName) {
    fs.appendFile(`./${fileName}`, csvString + "\n", "utf8", (err) => {
        if (err) {
            console.log(`An error occurred while writing to the file: ${err}`);
        }
        else {
            console.log(`${chalk.green(`Added ${spellId} to ${fileName}`)}`);
        }
    });
}
program.parse();
