cmake_minimum_required(VERSION 3.22)
project(aetherial_realms LANGUAGES CXX)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(SDL2 CONFIG REQUIRED)
find_package(bgfx CONFIG REQUIRED)

add_executable(aetherial_realms src/main.cpp)
target_link_libraries(aetherial_realms PRIVATE SDL2::SDL2 bgfx::bgfx)