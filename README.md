## DOCTOR VAI
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Offline desktop assets

The public offline downloads page serves these files directly:

```text
public/offline/windows-setup.exe
public/offline/doctor-vai.appimage
```

Copy your packaged Electron builds into that folder and the `/offline` page will expose the download buttons automatically.
