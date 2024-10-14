/** @module babel.config
 *  @desc Babel configuration
 *  @since 2022.04.21, 12:00
 *  @changed 2022.07.19, 17:23
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // targets: { ie: '11' },
        // useBuiltIns: 'usage',
        // corejs: 3,
        loose: true,
      },
    ],
  ],
  plugins: ['@babel/plugin-syntax-import-attributes'],
};
