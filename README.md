# Anime Image Retrieval And Modification Interface

[![CodeQL](https://github.com/Weebs-Incorporated/AIRAMI/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Weebs-Incorporated/AIRAMI/actions/workflows/codeql-analysis.yml)[![CI](https://github.com/Weebs-Incorporated/AIRAMI/actions/workflows/node.js.ci.yml/badge.svg)](https://github.com/Weebs-Incorporated/AIRAMI/actions/workflows/node.js.ci.yml)

A website that interacts with [AIMS](https://github.com/Weebs-Incorporated/AIMS).

# Installation

Dependencies:

-   [Node JS](https://nodejs.org/en/) v16 or higher. Non-LTS and versions below 16 will probably work, but haven't been tested.
-   [pnpm](https://pnpm.io/), recommended but npm and yarn should still work fine.

You can easily get pnpm using:

```sh
npm i -g pnpm
```

Next you can set up the repository from a terminal:

```sh
git clone https://github.com/Weebs-Incorporated/AIRAMI.git AIRAMI
cd AIRAMI
pnpm install
```

You can now run scripts using `pnpm <script name>`, e.g. `pnpm start`.

Once the app is running, you can go to the [/settings](http://localhost:3000/settings) page to change config options like API URL, Discord client ID, etc...

# Script Reference

-   `start` Starts the client in development mode, with hot-reloading enabled.
-   `build` Compiles client into JavaScript.
-   `lint` Makes sure code follows style rules.
-   `typecheck` Makes sure there are no type errors in the code.
-   `check-all` Does linting and typechecking.
