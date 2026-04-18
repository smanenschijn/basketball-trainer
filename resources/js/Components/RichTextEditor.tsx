import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useRef, useCallback, useEffect } from 'react';
import axios from 'axios';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    error?: string;
}

function ToolbarButton({
    onClick,
    active,
    children,
    title,
}: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`px-2 py-1 text-sm font-medium transition ${
                active
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            {children}
        </button>
    );
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write your explanation here...',
    error,
}: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isInternalChange = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({ inline: false }),
            Placeholder.configure({ placeholder }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            isInternalChange.current = true;
            onChange(editor.getHTML());
        },
    });

    // Sync editor content only when value changes externally (e.g. dialog opening with exercise data)
    useEffect(() => {
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, { emitUpdate: false });
        }
    }, [editor, value]);

    const handleImageUpload = useCallback(async (file: File) => {
        if (!editor) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await axios.post(
                route('exercise-images.store'),
                formData,
            );
            editor.chain().focus().setImage({ src: data.url }).run();
        } catch {
            // silently fail — user can retry
        }
    }, [editor]);

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            e.target.value = '';
        },
        [handleImageUpload],
    );

    if (!editor) return null;

    return (
        <div>
            <div
                className={`overflow-hidden border-3 shadow-brutal-sm ${
                    error ? 'border-red-500' : 'border-gray-300'
                } focus-within:border-gray-800`}
            >
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        active={editor.isActive('bold')}
                        title="Bold"
                    >
                        B
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        active={editor.isActive('italic')}
                        title="Italic"
                    >
                        <em>I</em>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                        active={editor.isActive('heading', { level: 2 })}
                        title="Heading"
                    >
                        H2
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
                        active={editor.isActive('heading', { level: 3 })}
                        title="Subheading"
                    >
                        H3
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                        active={editor.isActive('bulletList')}
                        title="Bullet list"
                    >
                        &bull; List
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                        active={editor.isActive('orderedList')}
                        title="Numbered list"
                    >
                        1. List
                    </ToolbarButton>
                    <div className="mx-1 w-px bg-gray-300" />
                    <ToolbarButton
                        onClick={() => fileInputRef.current?.click()}
                        title="Insert image"
                    >
                        Image
                    </ToolbarButton>
                </div>

                {/* Editor */}
                <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none px-4 py-3 focus:outline-none [&_.ProseMirror]:min-h-[150px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
                />
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
            />
        </div>
    );
}
