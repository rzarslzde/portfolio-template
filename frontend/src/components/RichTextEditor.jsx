import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Heading2, Italic, Link2,
  List, ListOrdered, Quote, Redo2, Strikethrough, Undo2,
} from 'lucide-react';

const extensions = [
  StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
  Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
  TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['right', 'center', 'left'] }),
];

export default function RichTextEditor({ value, onChange, label = 'متن نوشته', helper }) {
  const editor = useEditor({
    extensions,
    content: value || '',
    editorProps: {
      attributes: {
        dir: 'rtl',
        lang: 'fa',
        class: 'editor-content',
        'aria-label': label,
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return <div className="editor-loading">در حال آماده‌سازی ویرایشگر…</div>;

  const button = (title, icon, action, active = false) => (
    <button
      key={title}
      type="button"
      className={`editor-tool${active ? ' is-active' : ''}`}
      title={title}
      aria-label={title}
      onClick={action}
    >{icon}</button>
  );

  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('نشانی پیوند را وارد کنید:', previous);
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <div className="rich-editor">
      <div className="editor-toolbar" role="toolbar" aria-label="ابزارهای قالب‌بندی متن">
        {button('عنوان میانی', <Heading2 size={17} />, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading', { level: 2 }))}
        <span className="editor-tool-divider" />
        {button('ضخیم', <Bold size={16} />, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {button('ایتالیک', <Italic size={16} />, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {button('خط‌خورده', <Strikethrough size={16} />, () => editor.chain().focus().toggleStrike().run(), editor.isActive('strike'))}
        <span className="editor-tool-divider" />
        {button('فهرست نشانه‌دار', <List size={17} />, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        {button('فهرست شماره‌دار', <ListOrdered size={17} />, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
        {button('نقل‌قول', <Quote size={16} />, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
        {button('افزودن پیوند', <Link2 size={16} />, setLink, editor.isActive('link'))}
        <span className="editor-tool-divider" />
        {button('راست‌چین', <AlignRight size={16} />, () => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }))}
        {button('وسط‌چین', <AlignCenter size={16} />, () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }))}
        {button('چپ‌چین', <AlignLeft size={16} />, () => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }))}
        <span className="editor-tool-divider" />
        {button('بازگشت', <Undo2 size={16} />, () => editor.chain().focus().undo().run())}
        {button('انجام دوباره', <Redo2 size={16} />, () => editor.chain().focus().redo().run())}
      </div>
      <EditorContent editor={editor} />
      {helper && <small className="field-helper editor-helper">{helper}</small>}
    </div>
  );
}
