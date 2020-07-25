#!/usr/bin/env ts-node

import { test } from 'tstest'

import * as plugins from '../src/index'

test('integration testing', async (t) => {
  t.skip('should get a bot')
})

test('plugin name', async (t) => {
  for (const plugin of Object.values(plugins)) {
    if (typeof plugin !== 'function') {
      continue
    }

    if (plugin.name === 'validatePlugin') {
      continue // our helper functions
    }

    t.skip('to be fixed')
    // t.doesNotThrow(() => validatePlugin(plugin), 'plugin ' + plugin.name + ' should be valid')
  }
})
