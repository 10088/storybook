import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import MyButton from './Button.vue';

export default {
  title: 'Button',
  component: MyButton,
};

const Template = (args) => ({
  props: Object.keys(args),
  components: { MyButton },
  template: '<my-button @click="onClick">{{children}}</my-button>',
});

export const Text = Template.bind({});
Text.args = {
  children: 'Button',
  onClick: action('onClick'),
};

export const Emoji = Template.bind({});
Emoji.args = {
  children: '😀 😎 👍 💯',
};

export const WithCustomBackground = Template.bind({});
WithCustomBackground.args = {
  children: 'Defined via addon-backgrounds!',
};

WithCustomBackground.storyName = 'With custom background';

WithCustomBackground.parameters = {
  backgrounds: {
    default: 'dark',
  },
};

export const TextWithAction = () => ({
  components: { MyButton },
  template: '<my-button @click="action">Trigger Action</my-button>',
  methods: { action: () => action('This was clicked')() },
});

TextWithAction.storyName = 'With an action';

export const ButtonWithLinkToAnotherStory = () => ({
  components: { MyButton },
  template: '<my-button @click="action">Go to Welcome Story</my-button>',
  methods: { action: linkTo('example-introduction--page') },
});

ButtonWithLinkToAnotherStory.storyName = 'button with link to another story';
