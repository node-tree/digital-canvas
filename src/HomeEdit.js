import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Heading from '@tiptap/extension-heading';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaImage } from 'react-icons/fa';
import './HomeEdit.css';

const MenuBar = ({ editor, onImageInsertClick }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="menu-bar">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}>
        <FaAlignLeft />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}>
        <FaAlignCenter />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}>
        <FaAlignRight />
      </button>
      <button type="button" onClick={onImageInsertClick}>
        <FaImage />
      </button>
    </div>
  );
};

function HomeEdit() {
  const navigate = useNavigate();
  const [about, setAbout] = useState({ content: '' });
  const [isImageUrlInputVisible, setIsImageUrlInputVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: false,
      }),
      Image,
      Bold,
      Italic,
      Heading.configure({ levels: [1, 2] }),
      Placeholder.configure({ placeholder: '여기에 내용을 입력하세요...' }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: about.content,
    onUpdate: ({ editor }) => {
      setAbout(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(data => {
        setAbout(data);
        if (editor) {
          editor.commands.setContent(data.content);
        }
      })
      .catch(err => console.error("Failed to fetch about content:", err));
  }, [editor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editor.getHTML() }),
      });
      if (!response.ok) throw new Error('Failed to update');
      alert('저장되었습니다.');
      navigate('/');
    } catch (error) {
      alert('저장에 실패했습니다.');
    }
  };
  
  const handleInsertImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setIsImageUrlInputVisible(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>메인 페이지 편집</h1>
      </div>
      <form onSubmit={handleSubmit} className="about-edit-form">
        <div className="form-group">
          <label>내용</label>
          <div className="editor-container">
            {editor && <MenuBar editor={editor} onImageInsertClick={() => setIsImageUrlInputVisible(!isImageUrlInputVisible)} />}
            <EditorContent editor={editor} className="tiptap-editor" />
          </div>
          {isImageUrlInputVisible && (
            <div className="image-url-input-container">
              <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="이미지 URL을 입력하세요" className="image-url-input"/>
              <button onClick={handleInsertImage} className="image-url-submit-btn" type="button">추가</button>
            </div>
          )}
        </div>
        <button type="submit" className="btn-submit">저장</button>
      </form>
    </div>
  );
}

export default HomeEdit; 