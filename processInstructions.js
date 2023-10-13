import { lexer } from 'marked'

export function processInstructions(fileContents) {
  const tokens = lexer(fileContents)
  const actions = []

  debugger

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
      if (
        token.items.length === 1 &&
        tokens[i + 1]?.type === 'space' &&
        tokens[i + 2]?.type === 'code'
      ) {
        const codeToken = tokens[i + 2]
        const commands = codeToken.text.split('\n')
        const instruction = token.items[0].raw
        if (commands.length === 1) {
          actions.push({
            type: 'runCommand',
            instruction,
            command: commands[0],
          })
        } else {
          actions.push({
            type: 'runCommands',
            instruction,
            commands,
          })
        }

        i += 2
      } else {
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
