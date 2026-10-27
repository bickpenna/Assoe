import { useMemo } from 'react';
import { MarkdownInput, type MarkdownInputProps } from 'sanity-plugin-markdown';

/** Gli avvisi sono brevi: niente immagini, titoli o HTML nell'editor. */
export function NoticeMarkdownInput(props: MarkdownInputProps) {
  const reactMdeProps: MarkdownInputProps['reactMdeProps'] = useMemo(() => ({
    options: {
      toolbar: ['bold', 'italic', '|', 'unordered-list', 'ordered-list'],
      uploadImage: false,
    },
  }), []);

  return <MarkdownInput {...props} reactMdeProps={reactMdeProps} />;
}
