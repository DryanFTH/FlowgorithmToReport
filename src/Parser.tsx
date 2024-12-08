import splitLines from 'split-lines'

export type node = {
    type: string
    declarationType?: string
    description?: string
    level?: number
    block?: node[]
    elseBlock?: node[] | null
}

export function tokenizer(Pseudocode: string) {
    const lines = splitLines(Pseudocode)
        .map(line => line.trim())
        .filter(line => line != '')
        .slice(1, -1)
    const tokens: node[] = []

    lines.forEach(line => {
        if (line.startsWith('Declare')) {
            const parts = line.split(' ')
            const dataType = parts[1]
            const variableNames = parts.slice(2).join(' ')

            if (parts[2] == 'Array') {
                const arrayNames = variableNames.split(' ').slice(1)
                let allNames: string[] = []

                arrayNames.forEach(arrayName => {
                    const split = arrayName.match(/(\w+)\[(\d+)\]/)
                    const [name, size] = split ? split.slice(1, 3) : ['', '']

                    allNames.push(`${name} berukuran ${size}`)
                })

                tokens.push({
                    type: 'Declare',
                    declarationType: 'array',
                    description: `Deklarasi ${allNames.join(', ')} bertipe ${dataType}`,
                    level: 0,
                })
            } else {
                tokens.push({
                    type: 'Declare',
                    declarationType: 'variable',
                    description: `Deklarasi ${variableNames} bertipe ${dataType}`,
                    level: 0,
                })
            }
        } else if (line.startsWith('Input')) {
            tokens.push({
                type: 'Input',
                description: `Masukkan nilai ke dalam ${line.split(' ')[1]}`,
                level: 0,
            })
        } else if (line.startsWith('Output')) {
            tokens.push({
                type: 'Output',
                description: `Output ${line.substring(7).trim()}`,
                level: 0,
            })
        } else if (line.startsWith('Assign')) {
            const set = line.substring(7).split(' = ')
            tokens.push({
                type: 'Assign',
                description: `Mengatur nilai ${set[0]} menjadi ${set[1]}`,
                level: 0,
            })
        } else if (line.startsWith('If')) {
            tokens.push({
                type: 'If',
                description: `Jika ${line.substring(3)}, maka :`,
                block: [],
                elseBlock: null,
                level: 0,
            })
        } else if (line.startsWith('While')) {
            tokens.push({
                type: 'While',
                description: `Dilakukan looping ketika kondisi ${line.substring(6)} bernilai benar, maka :`,
                block: [],
                level: 0,
            })
        } else if (line.startsWith('For')) {
            const forSplit = line.substring(4).split(' = ')
            const interval = forSplit[1].split(' to ')
            tokens.push({
                type: 'For',
                description: `Dilakukan looping ketika kondisi ${forSplit[0]} bernilai kurang dari ${
                    Number.parseInt(interval[1]) + 1
                } dan dimulai dari angka ${Number.parseInt(interval[0])}, maka :`,
                block: [],
                level: 0,
            })
        } else if (line.startsWith('Loop')) {
            tokens.push({
                type: 'Loop',
                description: `Dilakukan operasi terlebih dahulu dan mengecek kondisi ${line.substring(
                    5
                )} bernilai benar akan dilakukan looping, maka :`,
                level: 0,
            })
        } else if (line === 'Do') {
            tokens.push({
                type: 'Do',
                description: '',
                block: [],
                level: 0,
            })
        } else if (line === 'Else') {
            tokens.push({
                type: 'Else',
                level: 0,
            })
        } else if (line === 'End') {
            tokens.push({ type: 'End' })
        }
    })

    return tokens
}

export function parse(tokens: node[]) {
    const ast: node[] = []
    const stack: node[] = []

    tokens.forEach(token => {
        if (token.type === 'If') {
            const node = { ...token, block: [], elseBlock: null }
            stack.push(node)
        } else if (token.type === 'While') {
            const node = { ...token, block: [] }
            stack.push(node)
        } else if (token.type === 'For') {
            const node = { ...token, block: [] }
            stack.push(node)
        } else if (token.type === 'Do') {
            const node = { ...token, block: [] }
            stack.push(node)
        } else if (token.type === 'Else') {
            const last: node | undefined = stack.pop()

            if (last && last.type == 'If') {
                last.elseBlock = []
                stack.push(last)
            }
        } else if (token.type === 'End') {
            const last: any = stack.pop()

            if (stack.length > 0 && last.type !== 'Do') {
                const parent: any = stack[stack.length - 1]

                if (parent.elseBlock) {
                    parent.elseBlock.push({ ...last })
                } else {
                    parent.block.push({ ...last })
                }
            } else {
                if (last.type !== 'Do') {
                    ast.push(last)
                } else {
                    stack.push(last)
                }
            }
        } else if (token.type === 'Loop') {
            const last: any = stack.pop()

            if (stack.length > 0 && last.type === 'Do') {
                const parent: any = stack[stack.length - 1]

                parent.block.push({ ...last, description: token.description })
            } else {
                if (last.type === 'Do') {
                    ast.push({ ...last, description: token.description })
                } else {
                    stack.push(last)
                }
            }
        } else if (stack.length > 0) {
            const last: any = stack[stack.length - 1]

            if (last.elseBlock && last.type == 'If') {
                last.elseBlock.push({ ...token })
            } else {
                last.block.push({ ...token })
            }
        } else {
            ast.push(token)
        }
    })

    return ast
}

export function parseLevel(ast: node[], level: number) {
    const astLevel: node[] = []

    ast.forEach(node => {
        const clone = { ...node }
        if ((node.type === 'If' || node.type === 'While' || node.type === 'For') && clone.block) {
            clone.block = parseLevel(clone.block, level + 1)
            if (clone.elseBlock) clone.elseBlock = parseLevel(clone.elseBlock ?? [], level + 1)
        }

        astLevel.push({ ...clone, level: level })
    })

    return astLevel
}
