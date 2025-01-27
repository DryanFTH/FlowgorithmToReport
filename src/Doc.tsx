import { convertInchesToTwip, Document, FileChild, ImageRun, Packer, PageBreak, Paragraph, Tab, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import { BlockNode, CommonNode, Do, For, Function, IfNode, While } from './Nodes'
import cloneDeep from 'lodash/cloneDeep'

export async function processDatum(
    generateParsedLevel: CommonNode[],
    Absen: string,
    Name: string,
    NIM: string,
    Class: string,
    Title: string,
    FlowChart: File[] | null,
    SourceCode: File[] | null
) {
    let maxDepth = 0
    let func = 0

    function traverseAst(nodes: CommonNode[], depth = 1, reference = 'listing-func1', level: number = 1) {
        if (depth > maxDepth) maxDepth = depth
        const f = nodes.filter(value => value instanceof Function).length
        func = f != 0 ? f : func

        return nodes.flatMap((node, index) => {
            const paragraph: Paragraph[] = []

            if (depth === 2 && index === 0) {
                paragraph.push(
                    new Paragraph({
                        text: 'Mulai',
                        numbering: { reference: reference + '-' + level, level: depth },
                    })
                )
            }
            if (node instanceof Function) {
                paragraph.push(
                    new Paragraph({
                        text: node.getDescription(),
                        numbering: { reference: 'ifState', level: depth },
                    })
                )
                paragraph.push(...traverseAst(node.block, depth + 1, `listing-func${index + 1}`))
            } else {
                paragraph.push(
                    new Paragraph({
                        text: node.getDescription(),
                        numbering: { reference: reference + '-' + level, level: depth },
                    })
                )
            }

            if (!(node instanceof Function) && node instanceof BlockNode) {
                paragraph.push(
                    new Paragraph({
                        text: node instanceof IfNode ? 'Jika bernilai BENAR, maka :' : 'Jika looping berjalan, maka :',
                        numbering: { reference: 'ifState', level: depth + 1 },
                    })
                )
                paragraph.push(...traverseAst(node.getBlocks(), depth + 2, reference, 1))
                if (node instanceof IfNode && node.elseBlock && node.elseBlock.length > 0) {
                    paragraph.push(
                        new Paragraph({
                            text: 'Jika bernilai SALAH, maka :',
                            numbering: { reference: 'ifState', level: depth + 1 },
                        })
                    )

                    paragraph.push(...traverseAst(node.elseBlock, depth + 2, reference, 2))
                }
            }

            if (depth === 2 && index === nodes.length - 1) {
                paragraph.push(
                    new Paragraph({
                        text: 'Selesai',
                        numbering: { reference: reference + '-' + level, level: depth },
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
        let FlowChartStructure = [
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
        ]

        FlowChartStructure = FlowChartStructure.concat(
            await Promise.all(
                FlowChart.map(async value => {
                    const { width, height } = await generateImage(value)

                    const imageType = imageConverter(value.type.split('/')[1])
                    return new Paragraph({
                        children: [
                            new ImageRun({
                                type: imageType as any,
                                data: await value.arrayBuffer(),
                                transformation: {
                                    width: width,
                                    height: height,
                                },
                                ...(imageType == 'svg' && { fallback: 'jpg' }),
                            }),
                        ],
                    })
                })
            )
        )

        additional = additional.concat(FlowChartStructure)
    }

    if (SourceCode) {
        let SourceCodeStructure = [
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
        ]
        SourceCodeStructure = SourceCodeStructure.concat(
            await Promise.all(
                SourceCode.map(async value => {
                    const { width, height } = await generateImage(value)

                    const imageType = imageConverter(value.type.split('/')[1])
                    return new Paragraph({
                        children: [
                            new ImageRun({
                                type: imageType as any,
                                data: await value.arrayBuffer(),
                                transformation: {
                                    width: width,
                                    height: height,
                                },
                                ...(imageType == 'svg' && { fallback: 'jpg' }),
                            }),
                        ],
                    })
                })
            )
        )

        additional = additional.concat(SourceCodeStructure)
    }

    const travers = async () => {
        return traverseAst(generateParsedLevel)
    }

    travers().then(async value => {
        const numberingConfig = createNumbering(maxDepth, func)
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

const generateImage = (variable: File) => {
    return new Promise<{ width: number; height: number }>(resolve => {
        const Reader = new FileReader()
        Reader.onload = e => {
            const image = new Image()
            image.src = e.target?.result as string
            image.onload = () => {
                let w = 600
                const compare = w / image.width

                let h = image.height * compare

                if (h > 800) {
                    h = 800
                    w = image.width * (h / image.height)
                }

                resolve({
                    width: w,
                    height: h,
                })
            }
        }

        Reader.readAsDataURL(variable)
    })
}

const imageConverter = (extension: string) => {
    if (['jpe', 'jpg', 'jpeg'].includes(extension)) {
        return 'jpg'
    } else if (['png', 'webp'].includes(extension)) {
        return 'png'
    } else if (['gif'].includes(extension)) {
        return 'gif'
    } else if (['bmp'].includes(extension)) {
        return 'bmp'
    } else if (['svg', 'svgz'].includes(extension)) {
        return 'svg'
    } else {
        return 'png'
    }
}

const createNumbering = (maxDepth: number, func: number) => {
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
                    indent: { left: (index + 1) * 360, hanging: 360 },
                },
            },
        }
        ifStates.levels.push(ifState)
    }

    numbering.push(numbereds, numbereds2, ifStates)

    for (let index = 1; index <= func; index++) {
        const listing1 = {
            reference: `listing-func${index}-1`,
            levels: [] as any,
        }
        const listing2 = {
            reference: `listing-func${index}-2`,
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
                        indent: { left: (index + 1) * 360, hanging: 360 },
                    },
                },
            }

            listing1.levels.push(cloneDeep(numbered))
            listing2.levels.push(cloneDeep(numbered))
        }
        numbering.push(listing1, listing2)
    }

    return numbering
}
