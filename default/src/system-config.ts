'use strict';

// SystemJS configuration file, see links for more information
// https://github.com/systemjs/systemjs
// https://github.com/systemjs/systemjs/blob/master/docs/config-api.md

/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
/** Map relative paths to URLs. */
const map = {
    'app':                        'app', // 'dist',
    '@angular':                   'vendor/@angular',
    'angular2-in-memory-web-api': 'vendor/angular2-in-memory-web-api',
    'rxjs':                       'vendor/rxjs',
    'firebase':                   'vendor/firebase',
    'angularfire2':               'vendor/angularfire2'
  };

/** User packages configuration. */
const packages: any = {
  'rxjs':                       'node_modules/rxjs',
  'firebase':                   { main: 'firebase.js', defaultExtension: 'js' },
  'angularfire2':               { defaultExtension: 'js', main: 'angularfire2.js' },
  'angular2-jwt':               { defaultExtension: 'js' }
};

////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
const barrels: string[] = [
  // Angular specific barrels.
  '@angular/core',
  '@angular/common',
  '@angular/compiler',
  '@angular/forms',
  '@angular/http',
  '@angular/router',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',

  // Thirdparty barrels.
  'rxjs',

  // App specific barrels.
  'app',
  'app/shared',
  /** @cli-barrel */
];

const cliSystemConfigPackages: any = {};
barrels.forEach((barrelName: string) => {
  cliSystemConfigPackages[barrelName] = { main: 'index' };
});

/** Type declaration for ambient System. */
declare var System: any;

// Apply the CLI SystemJS configuration.
System.config({
  map: {
    '@angular': 'vendor/@angular',
    'rxjs': 'vendor/rxjs',
    'main': 'main.js',
    'angular2-jwt': 'vendor/angular2-jwt/angular2-jwt.js',
    'firebase':                   'vendor/firebase',
    'angularfire2':               'vendor/firebase'
  },
  packages: cliSystemConfigPackages
});

// Apply the user's configuration.
System.config({ map, packages });
