#include <SDL.h>
#include <SDL_syswm.h>
#include <bgfx/bgfx.h>
#include <bgfx/platform.h>
#include <bx/math.h>
#include <cstdio>
#include <cstdint>
#include <cstring>

static bool fill_platform_data(SDL_Window* win, bgfx::PlatformData& outPd) {
    SDL_SysWMinfo wmi;
    SDL_VERSION(&wmi.version);
    if (!SDL_GetWindowWMInfo(win, &wmi)) {
        std::fprintf(stderr, "SDL_GetWindowWMInfo failed: %s\n", SDL_GetError());
        return false;
    }

    std::memset(&outPd, 0, sizeof(outPd));

#if defined(__linux__)
    std::fprintf(stderr, "SDL subsystem: %d\n", (int)wmi.subsystem);
    if (wmi.subsystem == SDL_SYSWM_X11) {
        // X11: provide Display* and Window
        outPd.ndt = wmi.info.x11.display;
        outPd.nwh = (void*)(uintptr_t)wmi.info.x11.window;
        std::fprintf(stderr, "X11 display=%p window=%lu\n",
            outPd.ndt, (unsigned long)wmi.info.x11.window);
    } else if (wmi.subsystem == SDL_SYSWM_WAYLAND) {
        // Wayland: provide wl_display* and wl_surface*
        outPd.ndt = wmi.info.wl.display;
        outPd.nwh = wmi.info.wl.surface;
        std::fprintf(stderr, "Wayland display=%p surface=%p\n",
            outPd.ndt, outPd.nwh);
    } else {
        std::fprintf(stderr, "Unsupported SDL subsystem for bgfx on Linux.\n");
        return false;
    }
#else
#   error This sample is intended for Linux (X11/Wayland). Extend as needed for other platforms.
#endif

    return outPd.nwh != nullptr;
}

int main(int argc, char** argv) {
    (void)argc; (void)argv;

    SDL_SetHint(SDL_HINT_VIDEO_HIGHDPI_DISABLED, "0");
    if (SDL_Init(SDL_INIT_VIDEO) != 0) {
        std::fprintf(stderr, "SDL_Init: %s\n", SDL_GetError());
        return 1;
    }

    SDL_Window* win = SDL_CreateWindow(
        "bgfx + SDL minimal",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        1280, 720,
        SDL_WINDOW_SHOWN | SDL_WINDOW_RESIZABLE | SDL_WINDOW_ALLOW_HIGHDPI
    );
    if (!win) {
        std::fprintf(stderr, "SDL_CreateWindow: %s\n", SDL_GetError());
        SDL_Quit();
        return 1;
    }

    bgfx::PlatformData pd{};
    if (!fill_platform_data(win, pd)) {
        std::fprintf(stderr, "fill_platform_data failed\n");
        SDL_DestroyWindow(win);
        SDL_Quit();
        return 1;
    }

    bgfx::setPlatformData(pd);

    int winW = 0, winH = 0;
    SDL_GetWindowSize(win, &winW, &winH);
    if (winW <= 0 || winH <= 0) { winW = 1280; winH = 720; }

    bgfx::Init init{};
    init.type = bgfx::RendererType::Count;         // Auto-choose (GL/Vulkan/etc)
    init.platformData = pd;
    init.resolution.width  = (uint32_t)winW;
    init.resolution.height = (uint32_t)winH;
    init.resolution.reset  = BGFX_RESET_VSYNC;

    if (!bgfx::init(init)) {
        std::fprintf(stderr, "bgfx::init failed (renderer unavailable or platform data not accepted)\n");
        SDL_DestroyWindow(win);
        SDL_Quit();
        return 1;
    }

    std::fprintf(stderr, "Renderer selected: %s\n",
        bgfx::getRendererName(bgfx::getCaps()->rendererType));

    bool running = true;
    SDL_Event e{};
    float t = 0.0f;

    while (running) {
        while (SDL_PollEvent(&e)) {
            if (e.type == SDL_QUIT) {
                running = false;
            } else if (e.type == SDL_WINDOWEVENT &&
                       (e.window.event == SDL_WINDOWEVENT_SIZE_CHANGED ||
                        e.window.event == SDL_WINDOWEVENT_RESIZED)) {
                int newW = 0, newH = 0;
                SDL_GetWindowSize(win, &newW, &newH);
                if (newW > 0 && newH > 0) {
                    bgfx::reset((uint32_t)newW, (uint32_t)newH, BGFX_RESET_VSYNC);
                }
            }
        }

        t += 0.016f; // ~60fps step;
        const float r = 0.2f + 0.2f * (0.5f + 0.5f * std::sin(t * 1.0f));
        const float g = 0.2f + 0.2f * (0.5f + 0.5f * std::sin(t * 1.7f));
        const float b = 0.4f + 0.4f * (0.5f + 0.5f * std::sin(t * 2.3f));
        uint32_t clear = ( (uint8_t)(r * 255) << 24 )
                       | ( (uint8_t)(g * 255) << 16 )
                       | ( (uint8_t)(b * 255) << 8  )
                       | 0xff;

        const bgfx::Caps* caps = bgfx::getCaps();
        (void)caps;

        bgfx::setViewRect(0, 0, 0,
            (uint16_t)bgfx::getStats()->width,
            (uint16_t)bgfx::getStats()->height);

        bgfx::setViewClear(0, BGFX_CLEAR_COLOR | BGFX_CLEAR_DEPTH, clear, 1.0f, 0);
        bgfx::touch(0);

        bgfx::dbgTextClear(0, false);
        bgfx::dbgTextPrintf(1, 2, 0x0f, "Hello, bgfx!");
        bgfx::dbgTextPrintf(2, 2, 0x0e, "Renderer: %s",
            bgfx::getRendererName(bgfx::getCaps()->rendererType));
        bgfx::dbgTextPrintf(3, 2, 0x0a, "Res: %ux%u",
            bgfx::getStats()->width, bgfx::getStats()->height);

        bgfx::frame();
    }

    bgfx::shutdown();
    SDL_DestroyWindow(win);
    SDL_Quit();
    return 0;
}