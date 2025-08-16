# Aetherial Realms

An open-world game.

### Technologies used:

- C++ w/ CMake & Clang
- SDL2
- bgfx
- ...Certainly others in the future.

# Compilation Steps

This project was primarily made and tested with Linux in mind. Windows steps are probably similar, though not tested/thorough.

## Linux

### Clone this repo
`git clone https://github.com/justinluce/aetherial-realms.git`

### Install Toolchain
`sudo apt update`

`sudo apt install -y build-essential clang cmake ninja-build git pkg-config`

### Set up vcpkg
`git clone https://github.com/microsoft/vcpkg "$HOME/vcpkg"`

`"$HOME/vcpkg/bootstrap-vcpkg.sh"`

`echo 'export VCPKG_ROOT="$HOME/vcpkg"' >> ~/.bashrc`

`source ~/.bashrc`

### Build it bro
`cmake --preset linux-vcpkg`

`cmake --build --preset linux-vcpkg`

<!-- Optional: symlink these compile_commands files -->
`ln -sf build/compile_commands.json compile_commands.json`

### ALTERNATIVE BUILD
If, for some reason, the build steps above didn't work, you can build it without using the preset:

`cmake -S . -B build -G Ninja -DCMAKE_TOOLCHAIN_FILE="$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON`

`cmake --build build`

<!-- Optional: symlink these compile_commands files -->
`ln -sf build/compile_commands.json compile_commands.json`

### RUNIT
`./build/aetherial_realms`

### CMakeLists.txt
Make a CMakeLists.txt file in the root directory. Should look like this:

```c
cmake_minimum_required(VERSION 3.22)
project(aetherial_realms LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(SDL2 CONFIG REQUIRED)
find_package(bgfx CONFIG REQUIRED)

add_executable(aetherial_realms src/main.cpp)
target_link_libraries(aetherial_realms PRIVATE SDL2::SDL2 bgfx::bgfx)
```

Job done :)

## Windows
I'll be real with you I don't actually know if these work yet but it probably does:

### Installation

First, install Visual Studio with "Desktop development with C++"

`git clone https://github.com/microsoft/vcpkg $env:USERPROFILE\vcpkg & $env:USERPROFILE\vcpkg\bootstrap-vcpkg.bat`

`setx VCPKG_ROOT "$env:USERPROFILE\vcpkg"`

### Build

`cmake -S . -B build -G "Ninja" -DCMAKE_TOOLCHAIN_FILE=%VCPKG_ROOT%\scripts\buildsystems\vcpkg.cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=ON`

`cmake --build build`

`build\aetherial_realms.exe`

That's it tbh bt idk icl

## Mac

¯\_(ツ)_/¯