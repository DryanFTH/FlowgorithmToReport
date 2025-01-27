import _, { cloneDeep } from 'lodash'

interface Descriptive {
    description: string

    getDescription(): string
    setDescription(description: string): CommonNode
}

interface Levelable {
    level: number

    getLevel(): number

    setLevel(level: number): void

    increaseLevel(): void

    DecreaseLevel(): void
}

interface ElseBlock {
    elseBlock: CommonNode[] | null
}

class CommonNode implements Descriptive, Levelable {
    description: string
    level: number

    constructor(description: string, level: number) {
        this.description = description
        this.level = level
    }

    getDescription(): string {
        return this.description
    }

    setDescription(description: string): CommonNode {
        this.description = description

        return this
    }

    getLevel(): number {
        return this.level
    }

    setLevel(level: number): void {
        this.level = level
    }

    increaseLevel(): void {
        this.level++
    }

    DecreaseLevel(): void {
        this.level--
    }

    static load(line: string): CommonNode {
        return new CommonNode('', 0)
    }

    clone(): this {
        return _.cloneDeep(this)
    }
}

class BlockNode extends CommonNode {
    block: CommonNode[]

    constructor(description: string, level: number, block: CommonNode[]) {
        super(description, level)
        this.block = block
    }

    getBlocks(): CommonNode[] {
        return this.block
    }

    setBlocks(block: CommonNode[]) {
        this.block = _.cloneDeep(block)
    }

    addBlock(block: CommonNode) {
        this.block.push(block.clone())
    }
}

class Declare extends CommonNode {
    static load(line: string): Declare {
        const parts = line.split(' ')
        const dataType = parts[1]
        const variableNames = parts.slice(2).join(' ')

        if (parts[2] == 'Array') {
            const arrayNames = variableNames.split(' ').slice(1)
            let allNames: string[] = []

            arrayNames.forEach(arrayName => {
                const split = arrayName.match(/(\w+)\[(\w+)\]/)
                const [name, size] = split ? split.slice(1, 3) : ['', '']

                allNames.push(`${name} berukuran ${size}`)
            })

            return new Declare(`Deklarasi ${allNames.join(', ')} bertipe ${dataType}`, 0)
        } else {
            return new Declare(`Deklarasi ${variableNames} bertipe ${dataType}`, 0)
        }
    }
}

class Input extends CommonNode {
    static load(line: string): Input {
        return new Input(`Masukkan nilai ke dalam ${line.split(' ')[1]}`, 0)
    }
}

class Output extends CommonNode {
    static load(line: string): Output {
        return new Output(`Output ${line.substring(7).trim()}`, 0)
    }
}

class Assign extends CommonNode {
    static load(line: string): Assign {
        const set = line.substring(7).split(' = ')

        return new Assign(`Mengatur nilai ${set[0]} menjadi ${set[1]}`, 0)
    }
}

class IfNode extends BlockNode implements ElseBlock {
    elseBlock: CommonNode[] | null

    constructor(description: string, level: number, block: CommonNode[], elseBlock: CommonNode[] | null) {
        super(description, level, block)

        this.elseBlock = elseBlock
    }

    getElseBlocks(): CommonNode[] | null {
        return this.elseBlock
    }

    setElseBlocks(block: CommonNode[]) {
        this.elseBlock = _.cloneDeep(block)
    }

    addElseBlock(block: CommonNode) {
        if (!this.elseBlock) {
            this.elseBlock = [block.clone()]
            return
        }

        this.elseBlock.push(block.clone())
    }

    static load(line: string): IfNode {
        return new IfNode(`Jika ${line.substring(3)}, maka :`, 0, [], null)
    }
}

class While extends BlockNode {
    static load(line: string): While {
        return new While(`Dilakukan looping ketika kondisi ${line.substring(6)} bernilai benar, maka :`, 0, [])
    }
}

class For extends BlockNode {
    static load(line: string): For {
        const forSplit = line.substring(4).split(' = ')
        const interval = forSplit[1].split(' to ')

        return new For(
            `Dilakukan looping ketika kondisi ${forSplit[0]} bernilai kurang dari atau sama dengan ${
                interval[1]
            } dan dimulai dari angka ${Number.parseInt(interval[0])}, maka :`,
            0,
            []
        )
    }
}

class Loop extends CommonNode {
    static load(line: string): Loop {
        return new Loop(
            `Dilakukan operasi terlebih dahulu dan mengecek kondisi ${line.substring(
                5
            )} bernilai benar akan dilakukan looping, maka :`,
            0
        )
    }
}

class Do extends BlockNode {
    static load(line: string): Do {
        return new Do('', 0, [])
    }
}

class Else extends CommonNode {
    static load(line: string): Else {
        return new Else('', 0)
    }
}

class End extends CommonNode {
    static load(line: string): End {
        return new End('', 0)
    }
}

class Call extends CommonNode {
    static load(line: string): Call {
        const func = line.substring(5)
        const funcSplit = func.split('(')
        const parameters = funcSplit[1].replace(')', '').trim().split(',')
        return new Call(`Memanggil fungsi ${funcSplit[0]} yang menerima parameter ${parameters.join(', ')}`, 0)
    }
}

class Function extends BlockNode {
    static load(line: string): Function {
        const splitSpace = line.split(' ')
        let parameters: any[] = []
        if (splitSpace.length > 2) {
            parameters = splitSpace
                .slice(2)
                .join(' ')
                .replace('(', '')
                .replace(')', '')
                .split(', ')
                .map(value => {
                    const splitParameter = value.split(' ')

                    return `${splitParameter[1]} berupa ${splitParameter[0]}`
                })
        }
        return new Function(
            `Fungsi ${splitSpace[1]}${splitSpace.length > 2 ? ' dengan parameter ' + parameters.join(', ') : ''}`,
            -1,
            []
        )
    }
}

class Return extends CommonNode {
    static load(line: string): Return {
        const splitLines = line.split(' ')

        return new Return(`Mengembalikan nilai ${splitLines[2]} berupa ${splitLines[1]}`, 0)
    }
}

export { CommonNode, BlockNode, Declare, Input, Output, Assign, IfNode, While, For, Loop, Do, Else, End, Call, Function, Return }
