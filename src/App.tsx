import { useMemo, useState, useCallback } from 'react'
import { createEditor, Editor, Transforms, Text, BaseEditor } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'
import { withHistory, HistoryEditor } from 'slate-history'
import './App.css'

interface CustomText {
  text: string
  bold?: boolean
  italic?: boolean
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
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  return (
    <>
      <div>
        <button onClick={() => toggleMark(editor, 'bold')}>Bold</button>
        <button onClick={() => toggleMark(editor, 'italic')}>Italic</button>
      </div>
      <Slate
        editor={editor}
        initialValue={value}
        onChange={(newValue) => setValue(newValue as CustomElement[])}
      >
        <Editable renderLeaf={(props) => <Leaf {...props} />} />
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

function isMarkActive(editor: Editor, format: 'bold' | 'italic') {
  const marks = Editor.marks(editor) || {}
  return marks[format] === true
}

function Leaf(props: { attributes: any; children: any; leaf: CustomText }) {
  let { children, leaf, attributes } = props
  if (leaf.bold) {
    children = <strong {...attributes}>{children}</strong>
  }
  if (leaf.italic) {
    children = <em {...attributes}>{children}</em>
  }
  return <span {...props.attributes}>{children}</span>
}

export default App
