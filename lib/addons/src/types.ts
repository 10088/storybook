import { Addon } from './index';

export enum types {
  TAB = 'tab',
  PANEL = 'panel',
  TOOL = 'tool',
  PREVIEW = 'preview',
  NOTES_ELEMENT = 'notes-element',
}

export type Types = types | string;

export function isSupportedType(type: Types): boolean {
  return !!Object.values(types).find(typeVal => typeVal === type);
}

export interface Parameters {
  fileName?: string;
  options?: OptionsParameter;
  [key: string]: any;
}

export interface StoryContext {
  id: string;
  name: string;
  kind: string;
  [key: string]: any;
  parameters: Parameters;
}

export interface WrapperSettings {
  options: OptionsParameter;
  parameters: {
    [key: string]: any;
  };
}

export interface OptionsParameter extends Object {
  storySort?: any;
  hierarchyRootSeparator?: string;
  hierarchySeparator?: RegExp;
  theme?: {
    base: string;
    brandTitle?: string;
  };
  [key: string]: any;
}

export type StoryGetter = (context: StoryContext) => any;
export type StoryFn = (p?: StoryContext) => any;

export type StoryWrapper = (
  getStory: StoryGetter,
  context: StoryContext,
  settings: WrapperSettings
) => any;

export type MakeDecoratorResult = (...args: any) => any;

export interface AddStoryArgs {
  id: string;
  kind: string;
  name: string;
  storyFn: StoryFn;
  parameters: Parameters;
}

export interface ClientApiAddon<TApi = unknown> extends Addon {
  apply: (a: StoryApi<TApi>, b: any[]) => any;
}
export interface ClientApiAddons<TApi> {
  [key: string]: ClientApiAddon<TApi>;
}

export type ClientApiReturnFn<TApi> = (...args: any[]) => StoryApi<TApi>;

export interface StoryApi<TApi> {
  kind: string;
  add: (storyName: string, storyFn: StoryFn, parameters: Parameters) => StoryApi<TApi>;
  addDecorator: (decorator: DecoratorFunction) => StoryApi<TApi>;
  addParameters: (parameters: Parameters) => StoryApi<TApi>;
  [k: string]: string | ClientApiReturnFn<TApi>;
}

export type DecoratorFunction = (fn: StoryFn, c: StoryContext) => ReturnType<StoryFn>;

export interface ClientStoryApi<TApi> {
  storiesOf(kind: string, module: NodeModule): StoryApi<TApi>;
  addDecorator(decorator: any): StoryApi<TApi>;
  addParameters(parameter: any): StoryApi<TApi>;
}
