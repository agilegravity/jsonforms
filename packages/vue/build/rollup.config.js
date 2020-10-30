import fs from 'fs';
import vue from 'rollup-plugin-vue';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import minimist from 'minimist';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

// Get browserslist config and remove ie from es build targets
const esbrowserslist = fs
  .readFileSync('./.browserslistrc')
  .toString()
  .split('\n')
  .filter(entry => entry && entry.substring(0, 2) !== 'ie');

const argv = minimist(process.argv.slice(2));

const baseConfig = {
  input: 'src/index.ts',
  plugins: {
    typescript: {
      typescript: require('typescript'),
      module: 'esnext',
      tsconfig: 'tsconfig.json',
      tsconfigOverride: {
        include: null,
        exclude: ['node_modules', 'tests', 'dev']
      }
    },
    preVue: [
      alias({
        resolve: ['.js', '.jsx', '.ts', '.tsx', '.vue']
      })
    ],
    replace: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.ES_BUILD': JSON.stringify('false')
    },
    vue: {
      css: true,
      template: {
        isProduction: true
      }
    },
    babel: {
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue']
    }
  }
};

// ESM/UMD/IIFE shared settings: externals
// Refer to https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency
const external = [
  // list external dependencies, exactly the way it is written in the import statement.
  // eg. 'jquery'
  'vue',
  '@jsonforms/core',
  'lodash/maxBy'
];

// UMD/IIFE shared settings: output.globals
// Refer to https://rollupjs.org/guide/en#output-globals for details
const globals = {
  // Provide global variable names to replace your external imports
  // eg. jquery: '$'
  vue: 'Vue',
  '@jsonforms/core': 'JsonFormsCore',
  'lodash/maxBy': '_.maxBy'
};

// Customize configs for individual targets
const buildFormats = [];
if (!argv.format || argv.format === 'es') {
  const esConfig = {
    ...baseConfig,
    external,
    output: {
      file: 'lib/jsonforms-vue.esm.js',
      format: 'esm',
      exports: 'named',
      sourcemap: true
    },
    plugins: [
      typescript(baseConfig.plugins.typescript),
      replace({
        ...baseConfig.plugins.replace,
        'process.env.ES_BUILD': JSON.stringify('true')
      }),
      ...baseConfig.plugins.preVue,
      resolve(),
      vue(baseConfig.plugins.vue),
      babel({
        ...baseConfig.plugins.babel,
        presets: [
          [
            '@babel/preset-env',
            {
              targets: esbrowserslist
            }
          ]
        ]
      }),
      commonjs()
    ]
  };
  buildFormats.push(esConfig);
}

if (!argv.format || argv.format === 'cjs') {
  const umdConfig = {
    ...baseConfig,
    external,
    output: {
      compact: true,
      file: 'lib/jsonforms-vue.ssr.js',
      format: 'cjs',
      name: 'JsonFormsVue',
      exports: 'named',
      globals,
      sourcemap: true
    },
    plugins: [
      typescript(baseConfig.plugins.typescript),
      replace(baseConfig.plugins.replace),
      ...baseConfig.plugins.preVue,
      resolve(),
      vue({
        ...baseConfig.plugins.vue,
        template: {
          ...baseConfig.plugins.vue.template,
          optimizeSSR: true
        }
      }),
      babel(baseConfig.plugins.babel),
      commonjs()
    ]
  };
  buildFormats.push(umdConfig);
}

if (!argv.format || argv.format === 'iife') {
  const unpkgConfig = {
    ...baseConfig,
    external,
    output: {
      compact: true,
      file: 'lib/jsonforms-vue.min.js',
      format: 'iife',
      name: 'JsonFormsVue',
      exports: 'named',
      globals,
      sourcemap: true
    },
    plugins: [
      typescript(baseConfig.plugins.typescript),
      replace(baseConfig.plugins.replace),
      ...baseConfig.plugins.preVue,
      resolve(),
      vue(baseConfig.plugins.vue),
      babel(baseConfig.plugins.babel),
      commonjs(),
      terser({
        output: {
          ecma: 5
        }
      })
    ]
  };
  buildFormats.push(unpkgConfig);
}

// Export config
export default buildFormats;
