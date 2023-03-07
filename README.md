<div align="center">
  <img src="./buildResources/icon.png" width="200" height="200">
</div>
  <br/>
<h1 align="center">Sing</h1>
<p align="center">
  <b>Elegant music library</b>
  <br/>
  <a href="https://github.com/Visual-Dawg/sing/releases">Download for Windows (MacOS and Linux coming soon)</a>
</p>

![screenshot sing 2](https://user-images.githubusercontent.com/28539403/217030031-0f96f515-079a-436e-8b32-d4afe72586d3.png)

## ⚠️ Early Alpha

Sing is still in Alpha and does not support auto-updates yet. Future updates might need you to resync your library, but it does never modify your music files.

<br/>

### Get started

1. Install Node.js
2. Install Git LFS
3. Create a `.env` based on `.example.env`
4. Run `pnpm install`
5. Run `pnpm run build:prisma` (Rerun this when changing `schema.prisma`)

### ToDo

- Smart Playlists
- Drag and Drop support
- Order playlists
- Sorting
- Android sync
- much more

### Commands

- `npm run start`: Start app in dev mode ( But better use the VS Code task `devMode`)
- `npm run build`: Build
