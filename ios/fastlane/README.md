fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios dev

```sh
[bundle exec] fastlane ios dev
```

Build para testing local en dispositivo

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Build y subir a TestFlight para beta testing

### ios release

```sh
[bundle exec] fastlane ios release
```

Build para producción (App Store)

### ios bump

```sh
[bundle exec] fastlane ios bump
```

Incrementar version number

### ios version

```sh
[bundle exec] fastlane ios version
```

Mostrar versión actual

### ios clean

```sh
[bundle exec] fastlane ios clean
```

Limpiar archivos de build y caché

### ios xcode

```sh
[bundle exec] fastlane ios xcode
```

Abrir proyecto en Xcode

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
