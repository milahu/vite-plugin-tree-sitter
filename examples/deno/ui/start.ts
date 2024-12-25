import "./style.css"
import TreeSitter from "web-tree-sitter"

const sample = `
SELECT *
  FROM abc
 WHERE abc.xyz = 'def'
`
const test = async () => {
	await TreeSitter.init()
	const parser = new TreeSitter()
	const sqlite = await TreeSitter.Language.load("tree-sitter-sqlite.wasm")
	parser.setLanguage(sqlite)
	const tree = parser.parse(sample)
	return tree.rootNode.toString()
}

const y = document.createElement("pre")
y.textContent = sample
document.body.appendChild(y)

const x = document.createElement("div")
test().then(str => (x.textContent = str))
document.body.appendChild(x)
