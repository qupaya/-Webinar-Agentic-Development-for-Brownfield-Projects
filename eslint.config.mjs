import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignores: ['apps/slides/**'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // Platform separation: angular code cannot import nestjs code and vice-versa
            {
              sourceTag: 'platform:angular',
              onlyDependOnLibsWithTags: ['platform:angular', 'platform:shared'],
            },
            {
              sourceTag: 'platform:nestjs',
              onlyDependOnLibsWithTags: ['platform:nestjs', 'platform:shared'],
            },
            // Shared libs (e.g. shared-models) cannot import from anywhere
            {
              sourceTag: 'platform:shared',
              onlyDependOnLibsWithTags: [],
            },
            // Apps cannot import other apps
            {
              sourceTag: 'type:app',
              notDependOnLibsWithTags: ['type:app'],
            },
            // data-access libs can only depend on shared models (no feature/app imports)
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['platform:shared'],
            },
            // feature libs can depend on data-access and shared, but not apps
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:data-access', 'platform:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
