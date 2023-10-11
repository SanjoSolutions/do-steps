import * as fs from 'fs/promises'
import { execSync } from 'child_process'
import { processInstructions } from './processInstructions.js'
import * as readline from 'node:readline/promises'
import path from 'path'
import crypto from 'crypto'
import { readJSON } from '@sanjo/read-json'
import { writeJSON } from '@sanjo/write-json'
import { existsSync as doesFileExist, read } from 'fs'

let filePath = process.argv[2]
let session = await loadSession()

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

if (filePath) {
  filePath = path.resolve(filePath)
  const file = await createFileObject(filePath)
  if (isSameFilePathAsInSession(file.path, session)) {
    const isContinuingSession = await handleSessionContinuation()

    if (!isContinuingSession) {
      await startWithANewSession(file)
    }
  } else {
    await startWithANewSession(file)
  }
} else {
  const isContinuingSession = await handleSessionContinuation()

  if (!isContinuingSession) {
    console.error('Please provide a path to a Markdown file.')
    process.exit(1)
  }
}

const fileContents = await fs.readFile(session.filePath, 'utf-8')

const actions = processInstructions(fileContents)
await saveSession(session)

while (session.action < actions.length) {
  const action = actions[session.action]
  if (action.type === 'instruction') {
    console.log(action.instruction)
    await readLine.question('Press enter to continue. ')
  } else if (action.type === 'information') {
    console.log(action.information)
  } else if (action.type === 'instructionToWriteCodeInAFile') {
    console.log(action.instruction)
    await createFile(action.filePath)
    await readLine.question('Press enter to continue. ')
  } else if (action.type === 'runCommand') {
    await runCommand(action)
  } else if (action.type === 'writeCode') {
    await createFile(action.filePath, action.code)
  }
  session.action++
  await saveSession(session)
}

await fs.rm(determineSessionFile())

process.exit(0)

async function startWithANewSession(file) {
  session = await createNewSessionForFile(file)
  printNewSession()
}

function printNewSession() {
  console.log('Starting with a new session.')
}

async function createFile(filePath, content = null) {
  let question = null
  if (doesFileExist(filePath)) {
    if (content) {
      question = `Would you like me to overwrite the file "${filePath}" with the new code?`
    }
  } else {
    question = `Would you like me to create the file "${filePath}"?`
  }

  if (question) {
    await askQuestion(readLine, question, [
      {
        text: 'y',
        isDefault: true,
        async handler() {
          await fs.mkdir(path.dirname(filePath), { recursive: true })
          await fs.writeFile(filePath, content ?? '', { encoding: 'utf-8' })
        },
      },
      {
        text: 'n',
        handler() {},
      },
    ])
  }
}

async function createFileObject(filePath) {
  const fileContents = await fs.readFile(filePath, 'utf-8')
  return {
    path: filePath,
    contents: fileContents,
    hash: crypto.createHash('md5').update(fileContents).digest('hex'),
  }
}

async function loadSession() {
  const sessionFilePath = determineSessionFile()
  try {
    return await readJSON(sessionFilePath)
  } catch (error) {}
  return createNewSession()
}

async function createNewSessionForFile(file) {
  return {
    filePath: file.path,
    hash: file.hash,
    action: 0,
  }
}

async function handleSessionContinuation() {
  let isContinuingSession
  if (isValidSession(session)) {
    let fileContents
    try {
      fileContents = await fs.readFile(session.filePath, 'utf-8')
    } catch (error) {
      if (error.code === 'ENOENT') {
        return
      } else {
        throw error
      }
    }
    const hash = crypto.createHash('md5').update(fileContents).digest('hex')
    if (hash === session.hash) {
      await askQuestion(
        readLine,
        `Would you like to continue the last session (file: "${
          session.filePath
        }", action: ${session.action + 1})?`,
        [
          {
            text: 'y',
            isDefault: true,
            handler() {
              isContinuingSession = true
            },
          },
          {
            text: 'n',
            handler() {
              isContinuingSession = false
            },
          },
        ]
      )
    }
  }

  return isContinuingSession
}

function isSameFilePathAsInSession(filePath, session) {
  return session.filePath && session.filePath === filePath
}

async function askQuestion(readLine, question, answers) {
  const answersText = `(${answers.map(convertAnswerToString).join('/')})`
  const questionText = `${question} ${answersText}: `
  let handler
  do {
    const answer = await readLine.question(questionText)
    const answerLowerCase = answer.toLowerCase()
    handler = answers.find(answer => {
      return (
        (answer.isDefault && answerLowerCase === '') ||
        answerLowerCase === answer.text.toLowerCase()
      )
    }).handler
  } while (!handler)
  return await handler()
}

function convertAnswerToString(answer) {
  let text = answer.text
  if (answer.isDefault) {
    text = `[${text}]`
  }
  return text
}

function isValidSession(session) {
  return (
    typeof session.filePath === 'string' &&
    typeof session.hash === 'string' &&
    typeof session.action === 'number' &&
    doesFileExist(session.filePath)
  )
}

function createNewSession() {
  return {
    filePath: null,
    hash: null,
    action: null,
  }
}

async function saveSession(session) {
  const sessionFilePath = determineSessionFile()
  await fs.mkdir(path.dirname(sessionFilePath), { recursive: true })
  await writeJSON(sessionFilePath, session)
}

async function runCommand(action) {
  let thereWasAnError
  do {
    console.log(action.instruction)
    const answer = await readLine.question(
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

function determineSettingsFolderPath() {
  return path.join(
    process.env.APPDATA ||
      (process.platform === 'darwin'
        ? process.env.HOME + '/Library/Preferences'
        : process.env.HOME + '/.local/share'),
    'Sanjo',
    'do-steps'
  )
}

function determineSessionFile() {
  return path.join(determineSettingsFolderPath(), 'session.json')
}
