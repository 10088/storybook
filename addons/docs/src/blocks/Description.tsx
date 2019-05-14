/* eslint-disable no-underscore-dangle */
import React from 'react';
import { Description, DescriptionProps as PureDescriptionProps } from '@storybook/components';
import { DocsContext, DocsContextProps } from './DocsContext';

export enum DescriptionType {
  INFO = 'info',
  NOTES = 'notes',
  DOCGEN = 'docgen',
  AUTO = 'auto',
}

interface DescriptionProps {
  of?: any;
  type?: DescriptionType;
  markdown?: string;
}

type Notes = string | any;
type Info = string | any;
type Component = any;

const getNotes = (notes?: Notes) =>
  notes && (typeof notes === 'string' ? notes : notes.markdown || notes.text);

const getInfo = (info?: Info) => info && (typeof info === 'string' ? info : info.text);

const getDocgen = (component?: Component) =>
  (component && component.__docgenInfo && component.__docgenInfo.description) || '';

export const getDescriptionProps = (
  { of, type, markdown }: DescriptionProps,
  { parameters, getPropDefs }: DocsContextProps
): PureDescriptionProps => {
  if (markdown) {
    return { markdown };
  }
  const { component, notes, info } = parameters;
  const target = of || component;
  const options = {}; // placeholder
  switch (type) {
    case DescriptionType.INFO:
      return { markdown: getInfo(info) };
    case DescriptionType.NOTES:
      return { markdown: getNotes(notes) };
    case DescriptionType.DOCGEN:
      return { markdown: getDocgen(target) };
    case DescriptionType.AUTO:
    default:
      return {
        markdown: `
${getNotes(notes) || getInfo(info) || ''}

${getDocgen(target)}
`.trim(),
      };
  }
};

const DescriptionContainer: React.FunctionComponent<DescriptionProps> = props => (
  <DocsContext.Consumer>
    {context => {
      const { markdown } = getDescriptionProps(props, context);
      return markdown && <Description markdown={markdown} />;
    }}
  </DocsContext.Consumer>
);

export { DescriptionContainer as Description };
