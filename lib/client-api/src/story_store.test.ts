import createChannel from '@storybook/channel-postmessage';
import { toId } from '@storybook/csf';
import addons from '@storybook/addons';
import Events from '@storybook/core-events';

import StoryStore from './story_store';
import { defaultDecorateStory } from './client_api';

jest.mock('@storybook/node-logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const channel = createChannel({ page: 'preview' });

// make a story and add it to the store
const addStoryToStore = (store, kind, name, storyFn, parameters = {}) =>
  store.addStory(
    {
      kind,
      name,
      storyFn,
      parameters,
      id: toId(kind, name),
    },
    {
      applyDecorators: defaultDecorateStory,
      getDecorators: () => [],
    }
  );

describe('preview.story_store', () => {
  describe('raw storage', () => {
    it('stores hash object', () => {
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a', '1', () => 0);
      addStoryToStore(store, 'a', '2', () => 0);
      addStoryToStore(store, 'b', '1', () => 0);

      const extracted = store.extract();

      // We need exact key ordering, even if in theory JS doesn't guarantee it
      expect(Object.keys(extracted)).toEqual(['a--1', 'a--2', 'b--1']);

      // content of item should be correct
      expect(extracted['a--1']).toMatchObject({
        id: 'a--1',
        kind: 'a',
        name: '1',
        parameters: expect.any(Object),
        state: {},
      });
    });
  });

  describe('storySort', () => {
    it('sorts stories using given function', () => {
      const parameters = {
        options: {
          // Test function does reverse alphabetical ordering.
          storySort: (a: any, b: any): number =>
            a[1].kind === b[1].kind
              ? 0
              : -1 * a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
        },
      };
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a/a', '1', () => 0, parameters);
      addStoryToStore(store, 'a/a', '2', () => 0, parameters);
      addStoryToStore(store, 'a/b', '1', () => 0, parameters);
      addStoryToStore(store, 'b/b1', '1', () => 0, parameters);
      addStoryToStore(store, 'b/b10', '1', () => 0, parameters);
      addStoryToStore(store, 'b/b9', '1', () => 0, parameters);
      addStoryToStore(store, 'c', '1', () => 0, parameters);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'c--1',
        'b-b10--1',
        'b-b9--1',
        'b-b1--1',
        'a-b--1',
        'a-a--1',
        'a-a--2',
      ]);
    });

    it('sorts stories alphabetically', () => {
      const parameters = {
        options: {
          storySort: {
            method: 'alphabetical',
          },
        },
      };
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a/b', '1', () => 0, parameters);
      addStoryToStore(store, 'a/a', '2', () => 0, parameters);
      addStoryToStore(store, 'a/a', '1', () => 0, parameters);
      addStoryToStore(store, 'c', '1', () => 0, parameters);
      addStoryToStore(store, 'b/b10', '1', () => 0, parameters);
      addStoryToStore(store, 'b/b9', '1', () => 0, parameters);
      addStoryToStore(store, 'b/b1', '1', () => 0, parameters);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'a-a--2',
        'a-a--1',
        'a-b--1',
        'b-b1--1',
        'b-b9--1',
        'b-b10--1',
        'c--1',
      ]);
    });

    it('sorts stories in specified order or alphabetically', () => {
      const parameters = {
        options: {
          storySort: {
            method: 'alphabetical',
            order: ['b', ['bc', 'ba', 'bb'], 'a', 'c'],
          },
        },
      };
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a/b', '1', () => 0, parameters);
      addStoryToStore(store, 'a', '1', () => 0, parameters);
      addStoryToStore(store, 'c', '1', () => 0, parameters);
      addStoryToStore(store, 'b/bd', '1', () => 0, parameters);
      addStoryToStore(store, 'b/bb', '1', () => 0, parameters);
      addStoryToStore(store, 'b/ba', '1', () => 0, parameters);
      addStoryToStore(store, 'b/bc', '1', () => 0, parameters);
      addStoryToStore(store, 'b', '1', () => 0, parameters);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'b--1',
        'b-bc--1',
        'b-ba--1',
        'b-bb--1',
        'b-bd--1',
        'a--1',
        'a-b--1',
        'c--1',
      ]);
    });

    it('sorts stories in specified order or by configure order', () => {
      const parameters = {
        options: {
          storySort: {
            method: 'configure',
            order: ['b', 'a', 'c'],
          },
        },
      };
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'a/b', '1', () => 0, parameters);
      addStoryToStore(store, 'a', '1', () => 0, parameters);
      addStoryToStore(store, 'c', '1', () => 0, parameters);
      addStoryToStore(store, 'b/bd', '1', () => 0, parameters);
      addStoryToStore(store, 'b/bb', '1', () => 0, parameters);
      addStoryToStore(store, 'b/ba', '1', () => 0, parameters);
      addStoryToStore(store, 'b/bc', '1', () => 0, parameters);
      addStoryToStore(store, 'b', '1', () => 0, parameters);

      const extracted = store.extract();

      expect(Object.keys(extracted)).toEqual([
        'b--1',
        'b-bd--1',
        'b-bb--1',
        'b-ba--1',
        'b-bc--1',
        'a--1',
        'a-b--1',
        'c--1',
      ]);
    });
  });

  describe('emitting behaviour', () => {
    it('is syncronously emits STORY_RENDER if the channel is defined', async () => {
      const onChannelRender = jest.fn();
      const testChannel = createChannel({ page: 'preview' });
      testChannel.on(Events.STORY_RENDER, onChannelRender);

      const onStoreRender = jest.fn();
      const store = new StoryStore({ channel: testChannel });
      store.on(Events.STORY_RENDER, onStoreRender);

      store.setSelection({ storyId: 'storyId', viewMode: 'viewMode' }, undefined);
      expect(onChannelRender).toHaveBeenCalled();
      expect(onStoreRender).not.toHaveBeenCalled();

      onChannelRender.mockClear();
      await new Promise(r => setTimeout(r, 10));
      expect(onChannelRender).not.toHaveBeenCalled();
      expect(onStoreRender).toHaveBeenCalled();
    });

    it('is asychronously emits STORY_RENDER if the channel is not yet defined', async () => {
      const onChannelRender = jest.fn();
      const testChannel = createChannel({ page: 'preview' });
      testChannel.on(Events.STORY_RENDER, onChannelRender);

      const onStoreRender = jest.fn();
      const store = new StoryStore({ channel: undefined });
      store.on(Events.STORY_RENDER, onStoreRender);

      store.setSelection({ storyId: 'storyId', viewMode: 'viewMode' }, undefined);
      expect(onChannelRender).not.toHaveBeenCalled();
      expect(onStoreRender).not.toHaveBeenCalled();

      store.setChannel(testChannel);
      await new Promise(r => setTimeout(r, 10));
      expect(onChannelRender).toHaveBeenCalled();
      expect(onStoreRender).toHaveBeenCalled();
    });
  });

  describe('removeStoryKind', () => {
    it('should not error even if there is no kind', () => {
      const store = new StoryStore({ channel });
      store.removeStoryKind('kind');
    });
    it('should remove the kind', () => {
      const store = new StoryStore({ channel });
      addons.setChannel(channel);
      addStoryToStore(store, 'kind-1', 'story-1.1', () => 0);
      addStoryToStore(store, 'kind-1', 'story-1.2', () => 0);
      addStoryToStore(store, 'kind-2', 'story-2.1', () => 0);
      addStoryToStore(store, 'kind-2', 'story-2.2', () => 0);

      store.removeStoryKind('kind-1');

      // _data
      expect(store.fromId(toId('kind-1', 'story-1.1'))).toBeFalsy();
      expect(store.fromId(toId('kind-2', 'story-2.1'))).toBeTruthy();
    });
  });

  describe('remove', () => {
    it('should remove the story', () => {
      const store = new StoryStore({ channel });
      addons.setChannel(channel);
      addStoryToStore(store, 'kind-1', 'story-1.1', () => 0);
      addStoryToStore(store, 'kind-1', 'story-1.2', () => 0);

      store.remove(toId('kind-1', 'story-1.1'));

      // _data
      expect(store.fromId(toId('kind-1', 'story-1.1'))).toBeFalsy();
      expect(store.fromId(toId('kind-1', 'story-1.2'))).toBeTruthy();
    });
  });

  describe('story sorting', () => {
    const storySort = (a, b) => a[1].id.localeCompare(b[1].id);
    it('should use the sorting function of the story parameter object', () => {
      const store = new StoryStore({ channel });
      addStoryToStore(store, 'kind-2', 'a-story-2.1', () => 0, {
        fileName: 'bar.js',
        options: { storySort },
      });
      addStoryToStore(store, 'kind-1', 'z-story-1.1', () => 0, {
        fileName: 'foo.js',
        options: { storySort },
      });
      addStoryToStore(store, 'kind-1', 'story-1.2', () => 0, {
        fileName: 'foo-2.js',
        options: { storySort },
      });
      addStoryToStore(store, 'kind-2', 'story-2.1', () => 0, {
        fileName: 'bar.js',
        options: { storySort },
      });

      const stories = Object.values(store.extract()) as any[];
      expect(stories[0].id).toBe('kind-1--story-1-2');
      expect(stories[1].id).toBe('kind-1--z-story-1-1');
      expect(stories[2].id).toBe('kind-2--a-story-2-1');
      expect(stories[3].id).toBe('kind-2--story-2-1');
    });
  });
});
