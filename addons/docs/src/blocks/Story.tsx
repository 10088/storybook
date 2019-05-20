import React from 'react';
import { toId } from '@storybook/router';
import { Story, StoryProps as PureStoryProps } from '@storybook/components';
import { CURRENT_SELECTION } from './shared';

import { DocsContext, DocsContextProps } from './DocsContext';

interface StoryProps {
  id?: string;
  name?: string;
  children?: React.ReactElement;
  height?: string;
}

export const getStoryProps = (
  { id, name, height }: StoryProps,
  { storyStore, parameters, mdxKind, selectedKind, selectedStory }: DocsContextProps
): PureStoryProps => {
  const previewId =
    id === CURRENT_SELECTION
      ? toId(selectedKind, selectedStory)
      : id || (name && toId(mdxKind, name));
  const data = storyStore.fromId(previewId);
  const { inlineStories } = (parameters && parameters.options && parameters.options.docs) || {
    inlineStories: false,
  };
  return {
    inline: inlineStories,
    id: previewId,
    storyFn: data && data.getDecorated(),
    height,
    title: data && data.name,
  };
};

const StoryContainer: React.FunctionComponent<StoryProps> = props => (
  <DocsContext.Consumer>
    {context => {
      const storyProps = getStoryProps(props, context);
      return <Story {...storyProps} />;
    }}
  </DocsContext.Consumer>
);

StoryContainer.defaultProps = {
  children: null,
  name: null,
};

export { StoryContainer as Story };
