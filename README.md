# Aetherial Realms

An open-world game.

## Technologies used

- C++ w/ CMake & Clang
- SDL2
- bgfx
- ...Certainly others in the future.

## Compilation Steps

This project was primarily made and tested with Linux. Windows steps are similar and tested, though not as thorough.

## Linux

### Clone this repo

If you don't have git installed, do that: `sudo apt install git`

`git clone https://github.com/justinluce/aetherial-realms.git`

`cd aetherial-realms`

### Install Toolchain

`sudo apt update`

`sudo apt install -y build-essential autoconf automake libtool libltdl-dev m4 libibus-1.0-dev clang cmake ninja-build pkg-config`

### Set up vcpkg

`git clone https://github.com/microsoft/vcpkg "$HOME/vcpkg"`

`"$HOME/vcpkg/bootstrap-vcpkg.sh"`

`echo 'export VCPKG_ROOT="$HOME/vcpkg"' >> ~/.bashrc`

`. ~/.bashrc`

### Build it bro

`cmake --preset linux-vcpkg`

`cmake --build --preset linux-vcpkg`

Optional: symlink these compile_commands files

`ln -sf build/compile_commands.json compile_commands.json`

### ALTERNATIVE BUILD

If, for some reason, the build steps above didn't work, you can build it without using the preset:

`cmake -S . -B build -G Ninja -DCMAKE_TOOLCHAIN_FILE="$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake" -DCMAKE_EXPORT_COMPILE_COMMANDS=ON`

`cmake --build build`

Optional: symlink these compile_commands files

`ln -sf build/compile_commands.json compile_commands.json`

### RUNITUP

`./build/aetherial_realms`

Job done :)

### Aliases

Some helpful aliases I use. Put them in your ~/.bashrc and run `. ~/.bashrc` when you're done.

```bash
projroot() { git rev-parse --show-toplevel 2>/dev/null || pwd; }

alias cmcfg='(cd "$(projroot)" && cmake --preset linux-vcpkg && ln -sf build/compile_commands.json compile_commands.json)'
alias cmb='(cd "$(projroot)" && cmake --build --preset linux-vcpkg)'
alias cmcln='(cd "$(projroot)" && rm -rf build)'
alias cmrun='(cd "$(projroot)" && ./build/aetherial_realms)'
alias cmall='(cd "$(projroot)" && rm -rf build && cmake --preset linux-vcpkg && ln -sf build/compile_commands.json compile_commands.json && cmake --build --preset linux-vcpkg && ./build/aetherial_realms)'

# Make sure your bashrc has this line
export VCPKG_ROOT="$HOME/vcpkg"
```

## Windows USING POWERSHELL

(you can also use cmd prompt of course, but you'll have to edit these commands a bit)

(also, there are replacements for most of these steps if you know what you're doing)

### Installation

#### 1) Prereqs

`winget install --id Microsoft.VisualStudio.2022.BuildTools -e`

Select "Desktop development with C++" + Windows 10/11 SDK

`winget install --id Kitware.CMake -e`

`winget install --id Ninja-build.Ninja -e`

#### 2) vcpkg

`git clone https://github.com/microsoft/vcpkg "$env:USERPROFILE\vcpkg"`

`& "$env:USERPROFILE\vcpkg\bootstrap-vcpkg.bat"`

`setx VCPKG_ROOT "$env:USERPROFILE\vcpkg"`

`$env:VCPKG_ROOT = "$env:USERPROFILE\vcpkg"`

#### Open Developer PowerShell for VS 2022 (x64) or in this shell run:

`& "C:\Program Files\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\Launch-VsDevShell.ps1" -Arch x64`

### Build

Close and reopen PowerShell to refresh PATH, then:

`git clone https://github.com/justinluce/aetherial-realms`

`cd aetherial-realms`

`cmake -S . -B build -G Ninja -DCMAKE_TOOLCHAIN_FILE="$env:VCPKG_ROOT\scripts\buildsystems\vcpkg.cmake" -DVCPKG_TARGET_TRIPLET=x64-windows -DCMAKE_BUILD_TYPE=Release -DCMAKE_EXPORT_COMPILE_COMMANDS=ON`

`cmake --build build -j`

`.\build\aetherial_realms.exe`

## Mac

<p>tbh idk icl lol ¯\_(ツ)_/¯</p>
