import { Editor, EditorChange, MarkdownView } from "obsidian";
import { range } from "lodash-es";
import escape from "escape-string-regexp";

const getReplaceFunc =
  (line: number, changes: EditorChange[]) =>
  (replacement: string, start: number, offset: number): void => {
    changes.push({
      text: replacement,
      from: { line, ch: start },
      to: { line, ch: start + offset },
    });
  };
const toggleLists = (editor: Editor, view: MarkdownView) => {
  const lineNums = new Set<number>();
  if (editor.somethingSelected()) {
    for (const sel of editor.listSelections()) {
      let fromTo = [sel.head.line, sel.anchor.line].sort() as [
        from: number,
        to: number
      ];
      fromTo[1] = fromTo[1] + 1;
      // generate serial from start-end of selection and add to lineNums
      range(...fromTo).forEach(lineNums.add.bind(lineNums));
    }
  } else {
    lineNums.add(editor.getCursor().line);
  }
  const changes = [] as EditorChange[];
  lineNums.forEach((line) =>
    changes.push(...toggleListSingleLine(editor, line))
  );
  editor.transaction({ changes });
};

const ulChar = "-*+".split(""),
  olChar = ".)".split("");

// https://github.com/yzhang-gh/vscode-markdown/blob/af8fa85941b378a0393d16076e9671a117c4afee/src/formatting.ts
const toggleListSingleLine = (editor: Editor, line: number): EditorChange[] => {
  const lineText = editor.getLine(line);

  let changes = [] as EditorChange[];
  const indentation =
      lineText.trim().length === 0
        ? lineText.length
        : lineText.indexOf(lineText.trim()),
    lineTextContent = lineText.substr(indentation),
    replace = getReplaceFunc(line, changes);

  let index: number = 0;
  if (
    ulChar.some(
      (char, i) => ((index = i), lineTextContent.startsWith(char + " "))
    )
  ) {
    if (index + 1 < ulChar.length) {
      replace(ulChar[index + 1] + " ", indentation, 2);
    } else {
      replace(`1${olChar[0]} `, indentation, 2);
    }
  } else if (
    olChar.some(
      (char, i) => (
        (index = i), new RegExp(`^\\d+${escape(char)} `).test(lineTextContent)
      )
    )
  ) {
    const char = olChar[index],
      lenOfDigits = new RegExp(`^(\\d+)${escape(char)}`).exec(
        lineText.trim()
      )[1].length;
    if (index + 1 < olChar.length) {
      replace(olChar[index + 1], indentation + lenOfDigits, 1);
    } else {
      replace("", indentation, lenOfDigits + 2);
    }
  } else {
    replace(ulChar[0] + " ", indentation, 0);
  }
  return changes;
};
export default toggleLists;
