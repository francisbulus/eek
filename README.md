[![Coverage Status](https://coveralls.io/repos/github/invisible-tech/process-automation/badge.svg?t=mq7t5K)](https://coveralls.io/github/invisible-tech/process-automation)

# process-automation

Infrastructure to quickly write and deploy automations that can be automatically imported to the DAL

<!-- MarkdownTOC -->

- [process-automation](#process-automation)
- [Overview](#overview)
- [Quickstart](#quickstart)
- [API](#api)
  - [Input](#input)
  - [Output](#output)
- [File and Directory Structure](#file-and-directory-structure)
  - [`src/automations` directory](#srcautomations-directory)
  - [Individual automation file structure](#individual-automation-file-structure)
    - [handler.ts](#handlerts)
    - [index.ts](#indexts)
    - [index.spec.ts](#indexspects)
    - [scripts/syncHandlers.sh](#scriptssynchandlerssh)

<!-- /MarkdownTOC -->

<a id="overview"></a>

# Overview

1. Automations are written in typescript (so that the engineering team can quickly review them as we are a Typescript focused team, currently). However, Python and other languages are also supported by Vercel, so we could support those in the future.
2. Automations are run on Vercel as serverless functions. They have a 60 second maximum run time, so you will need to break your automations into small pieces. If your automation takes more than 60 seconds, we MIGHT be able to support it on Vercel in the future or if we get an enterprise level account. Otherwise, we'll need to come up with another solution.
3. Dependencies are managed via `yarn` at the root level of the repo. This is done for speed and so as to reduce redundancy. It also allows us to enforce a single `tsconfig.json` and linting rules across the repo. To add a dependency, simply do  `yarn add xyz` at the root directory of the repo.
4. We use `yup` to validate inputs to the endpoints. Yup is very simple and easy to use, however it is a bit non-standard when compared to pure JSON schema. Because of that, we may be moving to `ajv` in the future. Unfortunately, there is not currently a good way to generate a yup schema from the inputs and outputs schema that we have for our automations, so you will need to write these yourself for each automation.
5. Linting is automated via `yarn run lint:fix`. Please run this and fix any errors you see before committing your code. It won't catch 100% of errors, but it will catch a lot.

<a id="quickstart"></a>

# Quickstart

1. Pull master and check out a new feature branch. We use the branch naming convention of your three initials, followed by a kebab-case tiny branch name. Like `ktj/duplicate-gsheet`
2. copy the directory `src/automations/template` to a new subdirectory under `src/automations`. Give this new directory a `kebab-case` name if it has more than one word in it. This will be your URL
2. Start filling out the `handler.ts` with the inputs and outputs that are specific to your automation
3. Start filling out `index.ts` with the actual work of the automation
4. Add the handler to the `ALL_HANDLERS` object in `automations/index.ts`
5. Don't forget to write tests in `index.spec.ts`
6. Clean up your commit history. We use [semantic commit messages](https://seesparkbox.com/foundry/semantic_commit_messages), and your PR will be rejected if your commit messages don't conform to this.
7. Submit a PR for merging your branch to master. Linting and tests will run automatically, and you will not be able to merge unless these pass, so ensure that they do before you submit.
8. Once approved, simply click the merge button, and your new automation will be deployed to production.

<a id="api"></a>

# API

<a id="input"></a>

## Input

Each endpoint will take the following in the `POST` body:

- `stepRunId`: either a number (step run from the DAL) or uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: optional object with input data needed to run the automation. The schema for this will be defined in the `handler.ts` file for each automation.

For example:

```
{
  "stepRunId": 123,
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": { "pipeInput": "howdy" }
}
```

<a id="output"></a>

## Output

Each endpoint will send a `200` status if execution completed successfully, a `400` if validation fails, and a `500` if there is some other error.

On success, the endpoint will return the following as json

- `stepRunId`: either a number (step run from the DAL) or uuid string (step run from Manticore)
- `token`: string, a uuid uniquely identifying the step run
- `data`: optional object with output data from running the automation. The schema for this will be defined in the `handler.ts` file for each automation.

For example:

```
{
  "stepRunId": 123,
  "token": "1f06ca82-72b9-409e-8286-c88718bee049",
  "data": { "pipeOutput": "howdy" }
}
```

<a id="file-and-directory-structure"></a>

# File and Directory Structure

<a id="srcautomations-directory"></a>

## `src/automations` directory

This is where most of your work will live. Each subdirectory here will be a separate endpoint on vercel. The name of the subdirectory itself should be kebab-case if it has multiple words in the name. Why? Because the name of the directory actually determines the URL we will POST to, to run the automation.

Example: If we had a dir: `src/automations/cool-automation-bro`

We could POST to `https://automation.inv.tech/cool-automation-bro`

<a id="individual-automation-file-structure"></a>

## Individual automation file structure

> See: [template](src/template) for a fully working example

<a id="handlerts"></a>

### handler.ts

This is the configuration for a given automation. Fill this out first. This gives us the important information on how to run this automation and how it will integrate with the DAL.

It is fully type-checked, so this will prevent some simple mistakes and leaving stuff out.

- `uid`: string. Use a UUID generator to make this unique. You must supply this. If you don't change it from the template, it will be rejected.
- `allowRetry`: boolean. If `true`, will permit automated retries (on an exponential backoff) of the automation
- `name`: string. A human-readable name. This is what will appear in the DAL when someone is using Process Lab to build their Process
- `description`: string, optional. A lengthier description of what the step does. This will appear on hover in Process Lab
- `inputs`: `TInputsOutputs`. This can be `null` if no inputs, otherwise, it is an object with the following format. For example:

  ```
    const inputs: TInputsOutputs = {
      pipeInput: {
        internalId: 1,
        name: 'Pipe input',
        type: VARIABLE_TYPES.STRING,
        required: true,
      },
    } as const
  ```

  - `internalId`: number. This id must be unique for a given automation. This is useful if you need to refer to a variable by id in your automation.
  - `name`: string. A human-readable name for the variable
  - `type`: `TVariableTypes` The type of the variable. see `src/constants/variable` for all options here. TODO: migrate to standard JSON Schema in the future
  - `required`: boolean. If required is true: for inputs, the step will not run until this value is filled. For outputs, the step will not be able to complete until this value is filled

- `outputs`: `TInputsOutputs`. This can be `null` if no inputs, otherwise, it is an object with the same format as `inputs`
- `handler`: `IAutomationHandler` You shouldn't need to modify this. It simply gathers up the other stuff you filled out and exports it as the default object

<a id="indexts"></a>

### index.ts

This is where you will do the actual work of the automation.

- `inputYupSchema` and `outputYupSchema`: yup schemas for validating inputs and outputs. If you have non-null inputs and/or outputs, you need to fill these out. It's a bit redundant currently, because there is no simple way to generate a Yup schema from our Input/Output schema. This may change in the future if we move purely to JSON schema. For now, you will have to write these yourself, but it's very simple to do so. See: <https://www.npmjs.com/package/yup>
- The default exported function: This is the starting point for your automation. It validates inputs using the `inputYupSchema`, does the actual work of the automation, then sends the results back (after validating the outputs using the `outputYupSchema`). You should keep this function relatively small, and you shouldn't need to change much here except for the inputs and outputs.
- Everything else: After validating the inputs, you should call a helper function (that you write elsewhere in that file or in the same subdirectory) on the inputs to do the actual work of the automation.
- Remove all the template comments before submitting your PR for review. A PR that still contains the template comments will be rejected.
- Each endpoint will send a `200` status if execution completed successfully, a `400` if validation fails, and a `500` if there is some other error. This is handled automatically, so you should not need to modify this.

<a id="indexspects"></a>

### index.spec.ts

This is where you will write tests for your automation

Utilizing `mocha` `chai` and `sinon` (for mocks), write some tests for the functionality of your automation. At the bare minimum, ensure that the input and output validations are working properly. If your automation does something that takes a long time, you can mock those pieces. We must have at least some basic tests for each automation.

A PR with no tests will be rejected.

<a id="scriptssynchandlerssh"></a>

### scripts/syncHandlers.sh

This script will sync all handlers to nidavellir, which will then push them to mimir.

Note that currently, we do not update step handlers after they have already been pushed. If the uid of a handler already exists in mimir, nothing will happen.

Because of that, if you want to make a change after you already pushed a new automation to the values in its `handler.ts`, you can either change the uid (which will create a new step template in mimir), or modify the step template in mimir.
