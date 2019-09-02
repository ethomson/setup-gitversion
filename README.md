# Setup GitVersion

This will install the [GitVersion utility](https://github.com/GitTools/GitVersion) as a command-line application (`gitversion`) for your GitHub Actions workflow.  You'll need to have .NET Core 2.1 installed by your workflow.

Set it up in your workflow:

```
on: [ push, pull_request ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/setup-dotnet@v1
      with:
        dotnet-version: '2.1.801'
    - uses: ethomson/setup-gitversion@v1
    - run: gitversion /UpdateAssemblyInfo
```

