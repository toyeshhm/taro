import * as ReactDOM from '@tarojs/react'
import { document } from '@tarojs/runtime'
import * as React from 'react'
import { describe, expect, test } from 'vitest'

import { createReactApp } from '../src/runtime'

describe('createReactApp', () => {
  class App extends React.Component<React.PropsWithChildren> {
    render () {
      return this.props.children
    }
  }

  const app = createReactApp(App, React, ReactDOM, {})

  const Home = () => React.createElement('view', null, 'home')
  const Detail = () => React.createElement('view', null, 'detail')

  const mount = (component: React.ComponentType, id: string) => new Promise<void>(resolve => app.mount!(component, id, resolve))
  const unmount = (id: string) => new Promise<void>(resolve => app.unmount!(id, resolve))

  // https://github.com/NervJS/taro/issues/19686
  test('unmounting a page that has not rendered yet keeps the other pages', async () => {
    await mount(Home, 'pages/home/index')
    expect(document.getElementById('pages/home/index')).not.toBeNull()

    // mount 只是把页面放进队列，下一次 render 才会进入 elements
    const mounted = mount(Detail, 'pages/detail/index')
    await Promise.all([mounted, unmount('pages/detail/index')])

    expect(document.getElementById('pages/home/index')).not.toBeNull()

    await unmount('pages/home/index')
    expect(document.getElementById('pages/home/index')).toBeNull()
  })
})
