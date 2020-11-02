import * as React from 'react';
import * as Showdown from 'showdown';
import xssFilter from 'xss';

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

const MarkdownComponent: React.FC<{
  markdown: string;
}> = ({ markdown }) => (
  <div
    dangerouslySetInnerHTML={{
      __html: xssFilter(converter.makeHtml(markdown)),
    }}
  />
);

export default MarkdownComponent;
