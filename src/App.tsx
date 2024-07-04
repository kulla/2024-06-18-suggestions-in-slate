import { useMemo, useState, useCallback } from 'react'
import {
  createEditor,
  Editor,
  Transforms,
  Text,
  BaseEditor,
  Range,
} from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { withHistory, HistoryEditor } from 'slate-history'
import { v4 as uuidv4 } from 'uuid'
import './App.css'

interface CustomText {
  text: string
  bold?: boolean
  italic?: boolean
  suggestion?: boolean
}

type CustomElement = { type: 'paragraph'; children: CustomText[] }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}

const initialValue: CustomElement[] = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
]

const App = () => {
  const [value, setValue] = useState<CustomElement[]>(initialValue)
  const { editor, editorKey } = useMemo(
    () => ({
      editor: withHistory(withReact(createEditor())),
      editorKey: uuidv4(),
    }),
    [],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { selection } = editor

      if (selection == null || !Range.isCollapsed(selection)) return

      const [node] = Editor.next(editor) ?? [null]

      if (node != null && isText(node) && node.suggestion) {
        if (event.key === 'Tab') {
          Transforms.select(
            editor,
            Editor.range(editor, ReactEditor.findPath(editor, node)),
          )
          Editor.addMark(editor, 'suggestion', false)
          Transforms.collapse(editor, { edge: 'end' })

          event.preventDefault()
        }
      } else {
        if (event.key === 'F1') {
          editor.insertNodes({ text: 'suggestion', suggestion: true })
          editor.setSelection(selection)
        }
      }
    },
    [editor],
  )

  return (
    <>
      <p>Press F1 to insert a suggestion</p>
      <div>
        <button onClick={() => toggleMark(editor, 'bold')}>Bold</button>
        <button onClick={() => toggleMark(editor, 'italic')}>Italic</button>
      </div>
      <Slate
        editor={editor}
        key={editorKey}
        initialValue={value}
        onChange={(newValue) => setValue(newValue as CustomElement[])}
      >
        <Editable
          renderLeaf={(props) => <Leaf {...props} />}
          onKeyDown={onKeyDown}
        />
      </Slate>
    </>
  )
}

function toggleMark(editor: Editor, format: 'bold' | 'italic') {
  const isActive = isMarkActive(editor, format)
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true },
  )
}

function isText(node: object): node is Text {
  return 'text' in node
}

function isMarkActive(editor: Editor, format: 'bold' | 'italic') {
  const marks = Editor.marks(editor) || {}
  return marks[format] === true
}

function Leaf(props: { attributes: any; children: any; leaf: CustomText }) {
  let { children, leaf, attributes } = props
  if (leaf.suggestion) {
    children = <span style={{ color: 'grey' }}>{children}</span>
  }
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }
  if (leaf.italic) {
    children = <em>{children}</em>
  }
  return <span {...attributes}>{children}</span>
}

export default App
