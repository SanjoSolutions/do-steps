# Do Steps

This is a CLI program which can process the steps that GitHub Copilot Chat might produce.

## How to install

```sh
npm install -g do-steps
```

## How to use

Copy the instructions from GitHub Copilot Chat into a file (i.e. `instructions.md`).
Then run:

```sh
do-steps instructions.md
```

Then the program asks you for each step to confirm it.

For steps that instruct to run a command, the program can run the command automatically.
Interactive commands work also.

For steps that instruct to add code into a file or create multiple files with code, the program can automatically
create those files and put the code into it.

## Legal

This project is not by GitHub and GitHub does not necessarily endorse this project.
