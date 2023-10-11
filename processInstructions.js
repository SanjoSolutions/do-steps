import { lexer } from 'marked'

export function processInstructions(fileContents) {
  const tokens = lexer(fileContents)
  const actions = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.type === 'heading' && token.depth === 2) {
      actions.push({
        type: 'instruction',
        instruction: token.text,
      })
    } else if (token.type === 'paragraph') {
      actions.push({
        type: 'information',
        information: token.text,
      })
    } else if (token.type === 'list') {
      for (const item of token.items) {
        const text = item.raw
        const textToken = item.tokens[0]
        let hadAnyCommands = false
        for (let index = 0; index < textToken.tokens.length; index++) {
          const subToken = textToken.tokens[index]
          if (subToken.type === 'codespan') {
            if (index >= 1) {
              const previousToken = textToken.tokens[index - 1]
              if (
                previousToken.type === 'text' &&
                previousToken.text.endsWith('in ')
              ) {
                actions.push({
                  type: 'instructionToWriteCodeInAFile',
                  filePath: subToken.text,
                  instruction: text.trim(),
                })
                hadAnyCommands = true
                continue
              }
            }

            actions.push({
              type: 'runCommand',
              instruction: text.trim(),
              command: subToken.text,
            })
            hadAnyCommands = true
          }
        }
        if (!hadAnyCommands) {
          actions.push({
            type: 'instruction',
            instruction: text.trim(),
          })
        }
      }
    } else if (token.type === 'code') {
      const regExp =
        /\/\/ (.+?)(?:\n|\r|\r\n)(.+?(?:\n|\r|\r\n))(?:\n|\r|\r\n)\/\/ /gs
      let match
      const text = token.text + '\n\n// '
      while ((match = regExp.exec(text))) {
        const filePath = match[1]
        const code = match[2]
        actions.push({
          type: 'writeCode',
          filePath,
          code,
        })
        regExp.lastIndex -= 3
      }
    }
  }

  return actions
}
