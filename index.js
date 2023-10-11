import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { processInstructions } from './processInstructions.js'
import * as readline from 'node:readline/promises'

const filePath = process.argv[2]

if (!filePath) {
  console.error('Please provide a path to a text file.')
  process.exit(1)
}

const fileContents = fs.readFileSync(filePath, 'utf-8')
const actions = processInstructions(fileContents)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// TODO: Make it possible to continue the last session. Ask if the user would like to continue the last session (if there was one).

for (const action of actions) {
  if (action.type === 'instruction') {
    console.log(action.instruction)
    await rl.question('Press enter to continue. ')
  } else if (action.type === 'information') {
    console.log(action.information)
  } else if (action.type === 'instructionToWriteCodeInAFile') {
    console.log(action.instruction)
    const input = await rl.question(
      'Would you like me to create the file? ([y]/n)'
    )
    if (!(input && input.toLowerCase() === 'n')) {
      // fs.writeFileSync(action.filePath, '')
      console.log(`File created: ${action.filePath}`)
    }
    await rl.question('Press enter to continue. ')
  } else if (action.type === 'runCommand') {
    await runCommand(action)
  } else if (action.type === 'writeCode') {
    const filePath = action.filePath
    const code = action.code

    const answer = await rl.question(`Overwriting ${filePath} ([y]/n): `)
    const answerLowerCase = answer.toLowerCase()
    if (answerLowerCase === 'y' || answerLowerCase === '') {
      // TODO: Make sure that there is a backup.
      // If the current version of the file is committed to Git it seems fine.
      // Otherwise: create a backup.
      // fs.writeFileSync(filePath, code)
      // console.log(`Code written to file: ${filePath}`)
    } else if (answerLowerCase === 'n') {
      break
    }
  }
}

async function runCommand(action) {
  let thereWasAnError
  do {
    console.log(action.instruction)
    const answer = await rl.question(
      `Run \`${action.command}\` ([y]/n/alternative command): `
    )
    const answerLowerCase = answer.toLowerCase()
    if (answerLowerCase === 'y' || answerLowerCase == '') {
      try {
        thereWasAnError = false
        execSync(action.command, {
          stdio: 'inherit',
        })
      } catch (error) {
        thereWasAnError = true
      }
    } else if (answerLowerCase === 'n') {
      return
    } else {
      try {
        thereWasAnError = false
        execSync(answer, {
          stdio: 'inherit',
        })
      } catch (error) {
        thereWasAnError = true
      }
    }
  } while (thereWasAnError)
}
