import { FormEvent, useEffect, useState } from 'react'
import splitLines from 'split-lines'
import { convertInchesToTwip, Document, FileChild, ImageRun, Numbering, Packer, PageBreak, Paragraph, Tab, TextRun } from 'docx'
import { saveAs } from 'file-saver'

Numbering

function App() {
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768)
    const [scrollPosition, setScrollPosition] = useState<number>(window.scrollY)

    const [Absen, setAbsen] = useState('')
    const [Name, setName] = useState('')
    const [NIM, setNIM] = useState('')
    const [Class, setClass] = useState('')
    const [Title, setTitle] = useState('')

    const [Dimensions] = useState<{ [key: string]: { width: number; height: number } }>({} as any)
    const [FlowChart, setFlowChart] = useState<File | null>(null)
    const [SourceCode, setSourceCode] = useState<File | null>(null)
    const [Pseudocode, setPseudocode] = useState('')

    useEffect(() => {
        // Fungsi untuk mengecek posisi scroll
        const handleScroll = () => {
            setScrollPosition(window.scrollY)
        }

        // Menambahkan event listener saat scroll
        window.addEventListener('scroll', handleScroll)

        // Menghapus event listener saat komponen unmount
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => {
        // Fungsi untuk mengecek lebar jendela dan memperbarui state
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        // Menambahkan event listener saat resize
        window.addEventListener('resize', handleResize)

        // Menghapus event listener saat komponen unmount
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

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

                if (node.type === 'If' || node.type === 'While' || node.type === 'For' || node.type === 'Do') {
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

            saveAs(await Packer.toBlob(doc), `${Absen}_${NIM}_${Name}_${Title}.docx`)
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
            } else if (token.type === 'Do') {
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
        <>
            <div
                className={`fixed z-20 top-0 left-0 w-screen px-8 md:px-16 py-6 flex justify-between duration-500 ease-in ${
                    scrollPosition > window.innerHeight - 500 ? 'bg-white/100 shadow shadow-black/20' : ''
                }`}
            >
                <h1 className=" font-[Play] font-bold italic text-[2rem]">FTR</h1>
                {!isMobile && (
                    <a
                        href="#converter"
                        className="bg-blue-500 text-base text-white rounded-full px-4 py-2 flex justify-center items-center duration-300 hover:outline hover:outline-1 hover:outline-blue-500 hover:bg-white hover:text-blue-500"
                    >
                        Mulai Sekarang
                    </a>
                )}
            </div>
            <div className="w-screen h-fit relative bg-gray-100 flex flex-row md:flex-col px-4 md:px-[17rem] pb-16 pt-24">
                <div className="relative z-10 text-center flex flex-col gap-4 items-center">
                    <h1 className="font-black text-[2rem] md:text-[3.5rem] leading-snug">
                        Solusi Cepat untuk Flowchart ke Laporan Tugas.
                    </h1>
                    <h1 className="text-sm md:text-base">
                        Hemat waktu dan tenaga Anda dengan aplikasi yang mengubah flowchart dari Flowgorithm menjadi dokumen tugas
                        dalam format Word dengan cepat dan efisien.
                    </h1>
                    <a
                        href="#converter"
                        className="bg-blue-500 w-fit text-white rounded-full px-4 py-2 flex justify-center items-center duration-300 hover:outline hover:outline-1 hover:outline-blue-500 hover:bg-white hover:text-blue-500"
                    >
                        Mulai Sekarang
                    </a>
                    <div className="w-[90%] md:w-[60%] bg-white rounded-3xl outline outline-2 flex items-center justify-center outline-blue-500 p-4">
                        <img src="./GAMBAR_Kelompok_keren_1.png" className="w-full drop-shadow" alt="" />
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute -bottom-1 left-0">
                    <path
                        fill="#3b82f6 "
                        fill-opacity="1"
                        d="M0,160L30,160C60,160,120,160,180,176C240,192,300,224,360,213.3C420,203,480,149,540,122.7C600,96,660,96,720,122.7C780,149,840,203,900,186.7C960,171,1020,85,1080,74.7C1140,64,1200,128,1260,165.3C1320,203,1380,213,1410,218.7L1440,224L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
                    ></path>
                </svg>
            </div>
            <div className="w-screen h-screen bg-blue-500 bg-gradient-to-b from-blue-500 from-50% to-90% to-gray-200 p-4 flex flex-col gap-4 text-white">
                <h1 className="text-[2rem] md:text-[3.5rem] font-black text-center">Apa yang kami sediakan?</h1>
                <p className="text-center text-gray-100">
                    Berikut adalah layanan dan fitur utama yang kami tawarkan untuk membantu kebutuhan Anda.
                </p>
                <ul className="list-disc px-8 md:px-64 md:text-lg">
                    <li>
                        <h1 className="font-black">Otomatisasi pembuatan notasi deskripsi</h1>
                        <p className="text-gray-100">
                            Hanya dengan mengetikkan source code dengan bahasa auto pseudocode dari flowgorithm nya akan langsung
                            dibuatkan notasi deskripsinya untuk anda.
                        </p>
                    </li>
                    <li>
                        <h1 className="font-black">Menghasilkan file word yang masih bisa diedit</h1>
                        <p className="text-gray-100">
                            Converter ini akan menyediakan output file yang masih berbentuk .docx yang membuat anda masih bisa
                            mengedit nya di Microsoft Word.
                        </p>
                    </li>
                    <li>
                        <h1 className="font-black">Nama File yang dihasilkan sudah diformatkan</h1>
                        <p className="text-gray-100">
                            Nama file nya sudah di formatkan sesuai intruksi tugas yaitu absen_nim_nama_judul
                        </p>
                    </li>
                </ul>
            </div>
            <form
                onSubmit={whenSubmit}
                className="w-screen min-h-screen bg-gray-200 p-4 py-8 pb-16 flex flex-col gap-4 items-center scroll-m-20"
                id="converter"
            >
                <h1 className="font-black text-[2rem] md:text-[3.5rem]">Flowgorithm To Report</h1>
                <input
                    type="text"
                    value={Absen}
                    onChange={ev => setAbsen(ev.target.value)}
                    placeholder="Masukkan absen anda"
                    className="w-full md:w-1/2 rounded-full p-2 px-3"
                />
                <input
                    type="text"
                    value={Name}
                    onChange={ev => setName(ev.target.value)}
                    placeholder="Masukkan nama anda"
                    className="w-full md:w-1/2 rounded-full p-2 px-3"
                />
                <input
                    type="text"
                    value={NIM}
                    onChange={ev => setNIM(ev.target.value)}
                    placeholder="Masukkan nim anda"
                    className="w-full md:w-1/2 rounded-full p-2 px-3"
                />
                <input
                    type="text"
                    value={Class}
                    onChange={ev => setClass(ev.target.value)}
                    placeholder="Masukkan kelas anda"
                    className="w-full md:w-1/2 rounded-full p-2 px-3"
                />
                <input
                    type="text"
                    value={Title}
                    onChange={ev => setTitle(ev.target.value)}
                    placeholder="Masukkan judul tugas anda"
                    className="w-full md:w-1/2 rounded-full p-2 px-3"
                />
                <textarea
                    name=""
                    className="w-full md:w-1/2 h-1/2 rounded-xl p-2 focus:border-none focus:outline-none"
                    placeholder="Tempel Source code Auto Pseudocode nya di sini"
                    value={Pseudocode}
                    onChange={ev => setPseudocode(ev.target.value)}
                ></textarea>
                <div className="flex flex-col gap-4 w-full md:w-1/2 bg-white rounded-3xl p-2 px-4">
                    <h1 className="font-black text-lg">Masukkan Gambar Flowchart nya</h1>
                    <input
                        type="file"
                        accept=".jpg,.png"
                        onChange={ev => {
                            const file = ev.target.files?.[0]
                            setFlowChart(file || null)
                        }}
                        className='className="w-full '
                    />
                </div>
                <div className="flex flex-col gap-4 w-full md:w-1/2 bg-white rounded-3xl p-2 px-4">
                    <h1 className="font-black text-lg">Masukkan Gambar Source Code nya</h1>
                    <input
                        type="file"
                        accept=".jpg,.png"
                        onChange={ev => {
                            const file = ev.target.files?.[0]
                            setSourceCode(file || null)
                        }}
                        className='className="w-full'
                    />
                </div>
                <button
                    className="bg-blue-500 w-fit text-white rounded-full px-4 py-2 flex justify-center items-center duration-300 hover:outline hover:outline-1 hover:outline-blue-500 hover:bg-white hover:text-blue-500"
                    type="submit"
                >
                    Buatkan
                </button>
            </form>
            <footer className="bg-blue-500 w-screen p-8 flex flex-col gap-8">
                <h1 className="font-black text-[2rem] md:text-[3.5rem] text-center text-white">Project ini dibuat oleh kami</h1>
                <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
                    <div className="bg-white p-4 md:p-8 w-full md:w-fit rounded-3xl text-center shadow duration-300 hover:-translate-y-2">
                        <h1 className="font-black uppercase text-xl md:text-2xl">Mohamad Adrian Faturachman</h1>
                        <h1>Teknik Informatika | TF24A</h1>
                        <a
                            href="https://www.instagram.com/justordinary_ryan/"
                            className="flex justify-center items-center gap-2 hover:fill-purple-600 hover:text-purple-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-8" viewBox="0 0 512 512">
                                <path d="M349.33 69.33a93.62 93.62 0 0193.34 93.34v186.66a93.62 93.62 0 01-93.34 93.34H162.67a93.62 93.62 0 01-93.34-93.34V162.67a93.62 93.62 0 0193.34-93.34h186.66m0-37.33H162.67C90.8 32 32 90.8 32 162.67v186.66C32 421.2 90.8 480 162.67 480h186.66C421.2 480 480 421.2 480 349.33V162.67C480 90.8 421.2 32 349.33 32z" />
                                <path d="M377.33 162.67a28 28 0 1128-28 27.94 27.94 0 01-28 28zM256 181.33A74.67 74.67 0 11181.33 256 74.75 74.75 0 01256 181.33m0-37.33a112 112 0 10112 112 112 112 0 00-112-112z" />
                            </svg>
                            <h1>Instagram</h1>
                        </a>
                    </div>
                    <div className="bg-white p-4 md:p-8 w-full md:w-fit rounded-3xl text-center shadow duration-300 hover:-translate-y-2">
                        <h1 className="font-black uppercase text-xl md:text-2xl">Gavin Afriel Permana</h1>
                        <h1>Teknik Informatika | TF24A</h1>
                        <a
                            href="https://www.instagram.com/ini_vinnz/"
                            className="flex justify-center items-center gap-2 hover:fill-purple-600 hover:text-purple-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-8" viewBox="0 0 512 512">
                                <path d="M349.33 69.33a93.62 93.62 0 0193.34 93.34v186.66a93.62 93.62 0 01-93.34 93.34H162.67a93.62 93.62 0 01-93.34-93.34V162.67a93.62 93.62 0 0193.34-93.34h186.66m0-37.33H162.67C90.8 32 32 90.8 32 162.67v186.66C32 421.2 90.8 480 162.67 480h186.66C421.2 480 480 421.2 480 349.33V162.67C480 90.8 421.2 32 349.33 32z" />
                                <path d="M377.33 162.67a28 28 0 1128-28 27.94 27.94 0 01-28 28zM256 181.33A74.67 74.67 0 11181.33 256 74.75 74.75 0 01256 181.33m0-37.33a112 112 0 10112 112 112 112 0 00-112-112z" />
                            </svg>
                            <h1>Instagram</h1>
                        </a>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default App
