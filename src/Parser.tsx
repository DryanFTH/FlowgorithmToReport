import splitLines from 'split-lines'
import {
    Assign,
    BlockNode,
    Call,
    CommonNode,
    Declare,
    Do,
    Else,
    End,
    For,
    Function,
    IfNode,
    Input,
    Loop,
    Output,
    Return,
    While,
} from './Nodes'
import cloneDeep from 'lodash/cloneDeep'

export function tokenizer(Pseudocode: string) {
    const lines = splitLines(Pseudocode)
        .map(line => line.trim())
        .filter(line => line != '')
    const tokens: CommonNode[] = []

    lines.forEach(line => {
        if (line.startsWith('Declare')) {
            tokens.push(Declare.load(line))
        } else if (line.startsWith('Input')) {
            tokens.push(Input.load(line))
        } else if (line.startsWith('Return')) {
            tokens.push(Return.load(line))
        } else if (line.startsWith('Output')) {
            tokens.push(Output.load(line))
        } else if (line.startsWith('Assign')) {
            tokens.push(Assign.load(line))
        } else if (line.startsWith('Function')) {
            tokens.push(Function.load(line))
        } else if (line.startsWith('If')) {
            tokens.push(IfNode.load(line))
        } else if (line.startsWith('While')) {
            tokens.push(While.load(line))
        } else if (line.startsWith('For')) {
            tokens.push(For.load(line))
        } else if (line.startsWith('Loop')) {
            tokens.push(Loop.load(line))
        } else if (line.startsWith('Call')) {
            tokens.push(Call.load(line))
        } else if (line === 'Do') {
            tokens.push(Do.load(line))
        } else if (line === 'Else') {
            tokens.push(Else.load(line))
        } else if (line === 'End') {
            tokens.push(End.load(line))
        }
    })

    console.log(tokens, 'token')

    return tokens
}

export function parse(tokens: CommonNode[]) {
    tokens = cloneDeep(tokens)
    const ast: CommonNode[] = []
    const stack: BlockNode[] = []

    tokens.forEach(token => {
        if (token instanceof BlockNode) {
            stack.push(token.clone())
        } else if (token instanceof Else) {
            const last: BlockNode | undefined = stack.pop()

            if (last && last instanceof IfNode) {
                last.setElseBlocks([])
                stack.push(last.clone())
            }
        } else if (token instanceof End) {
            const last: BlockNode | undefined = stack.pop()

            if (stack.length > 0 && last && !(last instanceof Do)) {
                const parent: BlockNode = stack[stack.length - 1]

                if (parent instanceof IfNode && parent.getElseBlocks()) {
                    parent.addElseBlock(last.clone())
                } else {
                    parent.addBlock(last.clone())
                }
            } else {
                if (last && !(last instanceof Do)) {
                    ast.push(last.clone())
                } else {
                    if (last) stack.push(last.clone())
                }
            }
        } else if (token instanceof Loop) {
            const last: BlockNode | undefined = stack.pop()

            if (stack.length > 0 && last instanceof Do) {
                const parent: BlockNode = stack[stack.length - 1]

                parent.addBlock(last.setDescription(token.getDescription()).clone())
            } else {
                if (last instanceof Do) {
                    ast.push(last.setDescription(token.getDescription()).clone())
                } else {
                    if (last) stack.push(last.clone())
                }
            }
        } else if (stack.length > 0) {
            const last: BlockNode = stack[stack.length - 1]

            if (last instanceof IfNode && last.getElseBlocks()) {
                last.addElseBlock(token.clone())
            } else {
                last.addBlock(token.clone())
            }
        } else {
            ast.push(token.clone())
        }
    })

    console.log(ast, stack, 'parse')

    return ast
}

export function parseLevel(ast: CommonNode[], level: number) {
    ast = cloneDeep(ast)
    const astLevel: CommonNode[] = []

    ast.forEach(node => {
        const clone = node.clone()
        if (clone instanceof BlockNode) {
            clone.setBlocks(parseLevel(clone.block, level + 1))
            if (clone instanceof IfNode && clone.getElseBlocks())
                clone.setElseBlocks(parseLevel(clone.elseBlock ?? [], level + 1))
        }

        astLevel.push(clone)
    })

    console.log(astLevel, 'level')

    return astLevel
}
