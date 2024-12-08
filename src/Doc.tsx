import { convertInchesToTwip, Document, FileChild, ImageRun, Packer, PageBreak, Paragraph, Tab, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import { node } from './Parser'

export type dimension = {
    [key: string]: {
        width: number
        height: number
    }
}

export async function processDatum(
    generateParsedLevel: node[],
    Absen: string,
    Name: string,
    NIM: string,
    Class: string,
    Title: string,
    Dimensions: dimension,
    FlowChart: File | null,
    SourceCode: File | null
) {
    let maxDepth = 0

    function traverseAst(nodes: node[], depth = 1, reference = 'numbered') {
        if (depth > maxDepth) maxDepth = depth
        return nodes.flatMap((node, index) => {
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

            if ((node.type === 'If' || node.type === 'While' || node.type === 'For' || node.type === 'Do') && node.block) {
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

    const identity: FileChild[] = [
        new Paragraph({
            children: [Text('Nama'), TabRun(), Text(':'), TabRun(), Text(Name)],
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
            children: [Text('NIM'), TabRun(), Text(':'), TabRun(), Text(NIM)],
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
            children: [Text('Kelas'), TabRun(), Text(':'), TabRun(), Text(Class)],
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
            children: [BoldCaps(Title)],
            spacing: {
                line: convertInchesToTwip(0.25),
            },
        }),
        new Paragraph({
            children: [BoldCaps('Notasi Deskripsi')],
            numbering: {
                reference: 'numbered',
                level: 0,
            },
        }),
    ]

    let additional: FileChild[] = []

    if (FlowChart) {
        await generateImage(FlowChart, 'fc', Dimensions)
    }

    if (SourceCode) {
        await generateImage(SourceCode, 'sc', Dimensions)
    }

    if (Dimensions && FlowChart && SourceCode) {
        additional = [
            new Paragraph({
                children: [Break()],
            }),
            new Paragraph({
                children: [BoldCaps('Notasi Flowchart')],
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
                children: [Break()],
            }),
            new Paragraph({
                children: [BoldCaps('Source Code')],
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

    const travers = async () => {
        return traverseAst(generateParsedLevel)
    }

    travers().then(async value => {
        const numberingConfig = createNumbering(maxDepth)
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

        saveAs(await Packer.toBlob(doc), `${Absen}_${NIM}_${Name}_${Title}.docx`)
    })
}

const TabRun = () =>
    new TextRun({
        children: [new Tab()],
    })

const Break = () =>
    new TextRun({
        children: [new PageBreak()],
    })

const Text = (text: string) =>
    new TextRun({
        text: text,
    })

const BoldCaps = (text: string) =>
    new TextRun({
        text: text,
        bold: true,
        allCaps: true,
    })

const generateImage = async (variable: File, type: string, Dimensions: dimension) => {
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

const createNumbering = (maxDepth: number) => {
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

    return numbering
}
