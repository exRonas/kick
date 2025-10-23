import React, { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { api } from '../lib/api.js';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const quillRef = useRef(null);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: async () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const form = new FormData();
            form.append('file', file);
            const r = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            const url = r.data.url;
            const editor = quillRef.current?.getEditor();
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, 'image', url, 'user');
            editor.setSelection(range.index + 1, 0);
          };
          input.click();
        },
        video: async () => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'video/*';
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            const form = new FormData();
            form.append('file', file);
            const r = await api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            const url = r.data.url;
            const editor = quillRef.current?.getEditor();
            const range = editor.getSelection(true);
            // Вставим HTML с <video> тегом, т.к. стандартный blot Quill ожидает iframe
            editor.clipboard.dangerouslyPasteHTML(range.index, `<video controls src="${url}" style="max-width:100%"></video>`);
            editor.setSelection(range.index + 1, 0);
          };
          input.click();
        }
      }
    },
    clipboard: { matchVisual: false }
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'image', 'video'
  ];

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      modules={modules}
      formats={formats}
    />
  );
}
