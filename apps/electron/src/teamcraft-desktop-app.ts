import { app, BrowserWindow, ipcMain, protocol, session } from 'electron';
import { createServer as createHttpServer, Server } from 'http';
import request from 'request';
import { MainWindow } from './window/main-window';
import { TrayMenu } from './window/tray-menu';
import { Store } from './store';
import { PacketCapture } from './pcap/packet-capture';
import log from 'electron-log';
import { Constants } from './constants';
import { join } from 'path';
import { parse } from 'url';
import { MetricsSystem } from './ipc/metrics-system';

export class TeamcraftDesktopApp {

  private static readonly MAIN_WINDOW_PORT = 14500;

  private httpServer: Server;

  public constructor(private mainWindow: MainWindow, private tray: TrayMenu, private store: Store,
                     private pcap: PacketCapture, private metrics: MetricsSystem, private argv: any[]) {
  }

  start(): void {
    // app.releaseSingleInstanceLock();
    app.setAsDefaultProtocolClient('teamcraft');
    let deepLink = '';

    app.whenReady().then(() => {
      session.defaultSession
        .setPermissionRequestHandler((webContents, permission, callback) => {
          const parsedUrl = new URL(webContents.getURL());

          if (permission === 'notifications') {
            // Approves the permissions request
            callback(true);
          }

          // Verify URL
          if (parsedUrl.protocol !== 'file:') {
            // Denies the permissions request
            return callback(false);
          }
        });


      protocol.registerFileProtocol('teamcraft', (req) => {
        deepLink = req.url.substr(12);
        if (deepLink.endsWith('/')) {
          deepLink = deepLink.substr(0, deepLink.length - 1);
        }
      });
      if (process.platform === 'win32' && process.argv.slice(1).toString().indexOf('--') === -1 && process.argv.slice(1).toString().indexOf('.js') === -1) {
        deepLink = process.argv.slice(1).toString().substr(12);
        if (!deepLink) {
          deepLink = this.store.get('router:uri', '');
        }
      } else {
        deepLink = this.store.get('router:uri', '');
      }
      // It seems like somehow, this could happen.
      if (deepLink.indexOf('overlay') > -1) {
        deepLink = '';
      }

      request(`http://localhost:${TeamcraftDesktopApp.MAIN_WINDOW_PORT}${(this.argv[0] || '').replace('teamcraft://', '')}`, (err, res) => {
        if (err) {
          this.bootApp(deepLink);
        } else {
          (<any>app).isQuitting = true;
          app.quit();
          process.exit(0);
        }
      });
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On macOS specific close process
      if (process.platform !== 'darwin') {
        (<any>app).isQuitting = true;
        app.quit();
      }
    });

    app.on('activate', () => {
      // macOS specific close process
      if (this.mainWindow.win === null) {
        this.mainWindow.createWindow(deepLink);
      }
    });

    app.on('before-quit', () => {
      if (this.httpServer) {
        this.httpServer.close(() => {
          process.exit(0);
        });
      }
    });
  }

  private bootApp(deepLink = ''): void {
    const loaderWindow = new BrowserWindow({
      width: 400,
      height: 500,
      show: false,
      frame: false,
      backgroundColor: '#2f3237',
      icon: `file://${Constants.BASE_APP_PATH}/assets/app-icon.png`,
      webPreferences: {
        preload: join(__dirname, 'preload.js')
      }
    });

    loaderWindow.once('ready-to-show', () => {
      loaderWindow.show();
      this.mainWindow.createWindow();
      this.tray.createTray();
      this.httpServer = createHttpServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', '*');
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }
        this.mainWindow.win.focus();
        this.mainWindow.win.show();
        console.log(req.url);
        res.writeHead(200);
        if (req.url.startsWith('/oauth')) {
          this.mainWindow.win.webContents.send('oauth-reply', parse(req.url, true).query.code);
          res.write('<script>window.close();</script>You can now close this tab.');
        } else if (req.url.length > 1) {
          this.mainWindow.win.webContents.send('navigate', req.url);
        }
        res.end();
      }).listen(TeamcraftDesktopApp.MAIN_WINDOW_PORT, 'localhost');

      ipcMain.once('app-ready', () => {
        if (deepLink.length > 0 && !this.store.get('disable-initial-navigation', false)) {
          this.mainWindow.win.webContents.send('navigate', deepLink);
        }
        if (this.store.get<boolean>('machina', false) === true) {
          this.pcap.startPcap();
        }
        loaderWindow.hide();
        loaderWindow.close();
        this.mainWindow.show();
        setTimeout(() => {
          this.mainWindow.win.focus();
          this.mainWindow.win.webContents.send('displayed', true);
        }, 200);
        this.metrics.start();
      });
    });

    const resolveHtmlPath = (htmlFileName) => {
      const url = new URL(join(__dirname, htmlFileName));
      url.pathname = htmlFileName;
      return url.href;
    };

    loaderWindow.loadURL(resolveHtmlPath('loader.html'));
  }
}
