import { FormEvent, useState } from 'react'
import splitLines from 'split-lines'
import { convertInchesToTwip, Document, FileChild, ImageRun, Numbering, Packer, PageBreak, Paragraph, Tab, TextRun } from 'docx'
import { saveAs } from 'file-saver'

Numbering

function App() {
    const [DarkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches)
    const [Name, setName] = useState('')
    const [NIM, setNIM] = useState('')
    const [Class, setClass] = useState('')
    const [Title, setTitle] = useState('')
    const [Dimensions, setDimensions] = useState<{ [key: string]: { width: number; height: number } }>({} as any)
    const [FlowChart, setFlowChart] = useState<File | null>(null)
    const [SourceCode, setSourceCode] = useState<File | null>(null)
    const [Pseudocode, setPseudocode] = useState(`Declare Integer berat, tinggi
    Declare Real bmi
    
    Display "Kami akan menghitungkan BMI (Body Mass Index) anda."
    Display "Masukkan Berat :"
    Input berat
    Display "Masukkan tinggi :"
    Input tinggi
    Set bmi = berat / tinggi / 100 * tinggi / 100
    If bmi >= 30 Then
        Display "BMI kamu ", bmi, " yang menandakan OBESITAS"
    Else
        If bmi >= 25 Then
            Display "BMI kamu ", bmi, " yang menandakan Berat badan berlebih"
        Else
            If bmi >= 18.5 Then
                Display "BMI kamu ", bmi, " yang menandakan Berat badan normal"
            Else
                Display "BMI kamu ", bmi, " yang menandakan Berat badan kurang"
            End If
        End If
    End If
    `)

    const whenSubmit = async (ev: FormEvent) => {
        ev.preventDefault()
        const generateToken = tokenizer()
        const generateParser = parse(generateToken)
        const all = parseLevel(generateParser, 0)
        console.log(generateToken, generateParser, all)

        let maxDepth = 0

        function traverseAst(nodes: node[], depth = 1, reference = 'numbered') {
            if (depth > maxDepth) maxDepth = depth
            return nodes.flatMap((node, index) => {
                console.log(depth, node.type)
                const paragraph: Paragraph[] = []

                if (depth === 1 && index === 0) {
                    paragraph.push(
                        new Paragraph({
                            text: 'Mulai',
                            numbering: { reference: 'numbered', level: depth },
                        })
                    )
                }

                paragraph.push(
                    new Paragraph({
                        text: node.description,
                        numbering: { reference: reference, level: depth },
                    })
                )

                if (node.type === 'If' || node.type === 'While' || node.type === 'For') {
                    paragraph.push(
                        new Paragraph({
                            text: node.type === 'If' ? 'Jika bernilai BENAR, maka :' : 'Jika looping berjalan, maka :',
                            numbering: { reference: 'ifState', level: depth + 1 },
                        })
                    )
                    paragraph.push(...traverseAst(node.block, depth + 2))
                    if (node.elseBlock && node.elseBlock.length > 0) {
                        paragraph.push(
                            new Paragraph({
                                text: 'Jika bernilai SALAH, maka :',
                                numbering: { reference: 'ifState', level: depth + 1 },
                            })
                        )

                        paragraph.push(...traverseAst(node.elseBlock, depth + 2, 'numbered2'))
                    }
                }

                if (depth === 1 && index === nodes.length - 1) {
                    paragraph.push(
                        new Paragraph({
                            text: 'Selesai',
                            numbering: { reference: 'numbered', level: depth },
                        })
                    )
                }

                return paragraph
            })
        }

        const createNumbering = () => {
            const numbering = []
            const numbereds = {
                reference: 'numbered',
                levels: [] as any,
            }
            const numbereds2 = {
                reference: 'numbered2',
                levels: [] as any,
            }
            const ifStates = {
                reference: 'ifState',
                levels: [] as any,
            }
            for (let index = 0; index <= maxDepth; index++) {
                const numbered: any = {
                    level: index,
                    format: 'decimal',
                    text: `%${1 + index}.`,
                    alignment: 'left',
                    style: {
                        paragraph: {
                            indent: { left: index * 720 + (index > 0 ? 0 : 360), hanging: 360 },
                        },
                    },
                }
                numbereds.levels.push(numbered)

                const numbered2: any = {
                    level: index,
                    format: 'decimal',
                    text: `%${1 + index}.`,
                    alignment: 'left',
                    style: {
                        paragraph: {
                            indent: { left: index * 720 + (index > 0 ? 0 : 360), hanging: 360 },
                        },
                    },
                }
                numbereds2.levels.push(numbered2)

                const ifState: any = {
                    level: index,
                    format: 'bullet',
                    text: '•',
                    alignment: 'left',
                    style: {
                        paragraph: {
                            indent: { left: index * 720 + (index > 0 ? 0 : 360), hanging: 360 },
                        },
                    },
                }
                ifStates.levels.push(ifState)
            }

            numbering.push(numbereds, numbereds2, ifStates)

            console.log(numbering)

            return numbering
        }

        const travers = async () => {
            return traverseAst(all)
        }
        const identity: FileChild[] = [
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Nama',
                    }),
                    new TextRun({
                        children: [new Tab()],
                    }),
                    new TextRun({
                        text: ':',
                    }),
                    new TextRun({
                        children: [new Tab()],
                    }),
                    new TextRun({
                        text: Name,
                    }),
                ],
                spacing: {
                    line: convertInchesToTwip(0.25),
                },
                tabStops: [
                    {
                        type: 'left',
                        position: convertInchesToTwip(0.5),
                    },
                    {
                        type: 'left',
                        position: convertInchesToTwip(0.6),
                    },
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'NIM',
                    }),
                    new TextRun({
                        children: [new Tab()],
                    }),
                    new TextRun({
                        text: ':',
                    }),
                    new TextRun({
                        children: [new Tab()],
                    }),
                    new TextRun({
                        text: NIM,
                    }),
                ],
                spacing: {
                    line: convertInchesToTwip(0.25),
                },
                tabStops: [
                    {
                        type: 'left',
                        position: convertInchesToTwip(0.5),
                    },
                    {
                        type: 'left',
                        position: convertInchesToTwip(0.6),
                    },
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Kelas',
                    }),
                    new TextRun({
                        children: [new Tab()],
                    }),
                    new TextRun({
                        text: ':',
                    }),
                    new TextRun({
                        children: [new Tab()],
                    }),
                    new TextRun({
                        text: Class,
                    }),
                ],
                spacing: {
                    line: convertInchesToTwip(0.25),
                },
                tabStops: [
                    {
                        type: 'left',
                        position: convertInchesToTwip(0.5),
                    },
                    {
                        type: 'left',
                        position: convertInchesToTwip(0.6),
                    },
                ],
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: Title,
                        bold: true,
                        allCaps: true,
                    }),
                ],
                spacing: {
                    line: convertInchesToTwip(0.25),
                },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Notasi Deskripsi',
                        bold: true,
                        allCaps: true,
                    }),
                ],
                numbering: {
                    reference: 'numbered',
                    level: 0,
                },
            }),
        ]

        let additional: FileChild[] = []

        const generateImage = async (variable: File, type: string) => {
            const Reader = new FileReader()
            Reader.onload = e => {
                const image = new Image()
                image.src = e.target?.result as string
                image.onload = () => {
                    const w = 600
                    const compare = w / image.width

                    const h = image.height * compare

                    Dimensions[type] = {
                        width: w,
                        height: h,
                    }
                }
            }

            Reader.readAsDataURL(variable)
        }

        if (FlowChart) {
            await generateImage(FlowChart, 'fc')
        }

        if (SourceCode) {
            await generateImage(SourceCode, 'sc')
        }

        if (Dimensions && FlowChart && SourceCode) {
            console.log(Dimensions)

            additional = [
                new Paragraph({
                    children: [
                        new TextRun({
                            children: [new PageBreak()],
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Notasi Flowchart',
                            bold: true,
                            allCaps: true,
                        }),
                    ],
                    numbering: {
                        reference: 'numbered',
                        level: 0,
                    },
                }),
                new Paragraph({
                    children: [
                        new ImageRun({
                            type: (FlowChart.type.split('/')[1] == 'jpeg' || FlowChart.type.split('\\')[1] == 'jpeg'
                                ? 'jpg'
                                : 'png') as any,
                            data: await FlowChart.arrayBuffer(),
                            transformation: {
                                width: Dimensions.fc.width,
                                height: Dimensions.fc.height,
                            },
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            children: [new PageBreak()],
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Source Code',
                            bold: true,
                            allCaps: true,
                        }),
                    ],
                    numbering: {
                        reference: 'numbered',
                        level: 0,
                    },
                }),
                new Paragraph({
                    children: [
                        new ImageRun({
                            type: (SourceCode.type.split('/')[1] == 'jpeg' || SourceCode.type.split('\\')[1] == 'jpeg'
                                ? 'jpg'
                                : 'png') as any,
                            data: await SourceCode.arrayBuffer(),
                            transformation: {
                                width: Dimensions.sc.width,
                                height: Dimensions.sc.height,
                            },
                        }),
                    ],
                }),
            ]
        }

        console.log(additional)

        travers().then(async value => {
            const numberingConfig = createNumbering()
            const doc = new Document({
                styles: {
                    default: {
                        document: {
                            run: {
                                size: 24,
                            },
                        },
                    },
                },
                numbering: {
                    config: numberingConfig as any,
                },
                sections: [
                    {
                        children: [...identity, ...value, ...additional],
                    },
                ],
            })

            saveAs(await Packer.toBlob(doc), 'ListExample.docx')
            console.log(numberingConfig)
        })
    }

    const tokenizer = () => {
        const lines = splitLines(Pseudocode)
            .map(line => line.trim())
            .filter(line => line != '')
            .slice(1, -1)
        const tokens: object[] = []

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
                console.log(line)

                tokens.push({
                    type: 'If',
                    description: `Jika ${line.substring(3)}, maka :`,
                    block: [],
                    elseBlock: null,
                    level: 0,
                })
            } else if (line.startsWith('While')) {
                console.log(line)

                tokens.push({
                    type: 'While',
                    description: `Dilakukan looping ketika nilai ${line.substring(6)} bernilai benar, maka :`,
                    block: [],
                    level: 0,
                })
            } else if (line.startsWith('For')) {
                const forSplit = line.substring(4).split(' = ')
                const interval = forSplit[1].split(' to ')
                tokens.push({
                    type: 'For',
                    description: `Dilakukan looping ketika nilai ${forSplit[0]} bernilai kurang dari ${
                        Number.parseInt(interval[1]) + 1
                    } dan dimulai dari angka ${Number.parseInt(interval[0])}, maka :`,
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

    type node = {
        [key: string]: any
        block: node[]
        elseBlock?: node[]
    }

    function parse(tokens: any[]) {
        const ast: node[] = []
        const stack: node[] = []

        console.log(tokens, 'aaaaaaaaaaaaaaaaaaaaaa')

        tokens.forEach(token => {
            console.log(token.type, token.description)

            if (token.type === 'If') {
                const node = { ...token, block: [], elseBlock: null }
                stack.push(node)
            } else if (token.type === 'While') {
                const node = { ...token, block: [] }
                stack.push(node)
            } else if (token.type === 'For') {
                const node = { ...token, block: [] }
                stack.push(node)
            } else if (token.type === 'Else') {
                const last: node | undefined = stack.pop()

                if (last && last.type == 'If') {
                    console.log('else', last.description)
                    last.elseBlock = []
                    stack.push(last)
                }
            } else if (token.type === 'End') {
                const last: any = stack.pop()

                if (stack.length > 0) {
                    const parent: any = stack[stack.length - 1]

                    if (parent.elseBlock) {
                        parent.elseBlock.push({ ...last })
                    } else {
                        parent.block.push({ ...last })
                    }
                } else {
                    ast.push(last)
                }
            } else if (stack.length > 0) {
                const last: any = stack[stack.length - 1]

                console.log(last.elseBlock ? 's' : 'd', last.elseBlock, last.type)

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

    const parseLevel = (ast: node[], level: number) => {
        const astLevel: node[] = []

        console.log(ast)

        ast.forEach(node => {
            console.log(node)

            const clone = { ...node }
            if (node.type === 'If' || node.type === 'While' || node.type === 'For') {
                clone.block = parseLevel(clone.block, level + 1)
                if (clone.elseBlock) clone.elseBlock = parseLevel(clone.elseBlock ?? [], level + 1)
            }

            astLevel.push({ ...clone, level: level })
        })

        return astLevel
    }

    return (
        <div className={DarkMode ? 'dark' : ''}>
            <form
                onSubmit={whenSubmit}
                className="w-screen h-screen bg-red-500 dark:bg-black p-4 flex flex-col gap-4 items-center"
            >
                <textarea
                    name=""
                    className="w-3/5 h-1/2 rounded-xl p-2 focus:border-none focus:outline-none"
                    placeholder="Paste Gaddis Pseudocode nya di sini"
                    value={Pseudocode}
                    onChange={ev => setPseudocode(ev.target.value)}
                ></textarea>
                <input type="text" value={Name} onChange={ev => setName(ev.target.value)} placeholder="Masukkan nama anda" />
                <input type="text" value={NIM} onChange={ev => setNIM(ev.target.value)} placeholder="Masukkan nim anda" />
                <input type="text" value={Class} onChange={ev => setClass(ev.target.value)} placeholder="Masukkan kelas anda" />
                <input
                    type="text"
                    value={Title}
                    onChange={ev => setTitle(ev.target.value)}
                    placeholder="Masukkan judul tugas anda"
                />
                <input
                    type="file"
                    accept=".jpg,.png"
                    onChange={ev => {
                        const file = ev.target.files?.[0]
                        setFlowChart(file || null)
                    }}
                />
                <input
                    type="file"
                    accept=".jpg,.png"
                    onChange={ev => {
                        const file = ev.target.files?.[0]
                        setSourceCode(file || null)
                    }}
                />
                <button className="bg-white" type="submit">
                    CREATE
                </button>
            </form>
        </div>
    )
}

export default App
