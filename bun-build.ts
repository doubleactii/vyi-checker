import Bun from 'bun';
import CopyBunPlugin from '@evitcastudio/copy-bun-plugin';
import chalk from 'chalk';
import packageJson from './package.json';

const banner = [
  `/*!`,
  ` * ${packageJson.name}@${packageJson.version}`,
  ` * Compiled ${new Date().toUTCString().replace(/GMT/g, 'UTC')}`,
  ` * Copyright (c) ${new Date().getFullYear()} Jared Bates, Evitca Studio, "doubleactii"`,
  ` *`,
  ` * ${packageJson.name} is licensed under the MIT License.`,
  ` * http://www.opensource.org/licenses/mit-license`,
  ` */`,
].join('\n');


function logMessage(pLevel: string, pMessage: string): void {
    const colors: Record<string, string> = { error: '#c42847', info: '#ffa552' };
    const levelFormatted = pLevel.charAt(0).toUpperCase() + pLevel.slice(1);
    const color = colors[pLevel] || '#ffa552';
    console.log(chalk.hex(color)(`[${levelFormatted}]`), `${pMessage}`);
};

const oldNow = Date.now();

await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    naming: 'index.js',
    banner: banner,
    target: 'browser',
    plugins: [
        CopyBunPlugin({
          verbose: false,
          resources: [
            { src: './src/**/*.{html,css,ico}', dst: 'dist/' }
          ]
        })
      ]
});

const elapsed = Date.now() - oldNow;

logMessage('info', `Client Build took: ${elapsed}ms`);