import { document } from 'global';
import React from 'react';
import ReactDOM from 'react-dom';
import { render } from '@storybook/renderer-react';

import { RenderMainArgs } from './types';

const rootEl = document ? document.getElementById('root') : null;

export default function renderMain({
  storyFn,
  selectedKind,
  selectedStory,
  showMain,
  forceRender,
}: RenderMainArgs) {
  const element = storyFn();

  // We need to unmount the existing set of components in the DOM node.
  // Otherwise, React may not recreate instances for every story run.
  // This could leads to issues like below:
  // https://github.com/storybookjs/react-storybook/issues/81
  // But forceRender means that it's the same story, so we want too keep the state in that case.
  if (!forceRender) {
    ReactDOM.unmountComponentAtNode(rootEl);
  }

  render(element, rootEl, { name: selectedStory, kind: selectedKind });
  showMain();
}
