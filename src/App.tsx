import { FormEvent, useEffect, useState } from 'react'
import { parse, tokenizer, parseLevel } from './Parser'
import { processDatum } from './Doc'

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
        const handleScroll = () => {
            setScrollPosition(window.scrollY)
        }

        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const whenSubmit = async (ev: FormEvent) => {
        ev.preventDefault()
        const generateToken = tokenizer(Pseudocode)
        const generateParsed = parse(generateToken)
        const generateParsedLevel = parseLevel(generateParsed, 0)

        processDatum(generateParsedLevel, Absen, Name, NIM, Class, Title, Dimensions, FlowChart, SourceCode)
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
            <div className="w-screen min-h-screen h-fit bg-blue-500 bg-gradient-to-b from-blue-500 from-50% to-90% to-gray-200 p-4 md:px-48 flex flex-col gap-4 text-white">
                <h1 className="text-[2rem] md:text-[3.5rem] font-black text-center">Apa yang kami sediakan?</h1>
                <p className="text-center text-gray-100">
                    Berikut adalah layanan dan fitur utama yang kami tawarkan untuk membantu kebutuhan Anda.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-black">
                    <div className="flex flex-col p-4 border-[3px] border-gray-400/45 w-full rounded-3xl bg-gray-100 hover:-translate-y-2 duration-300">
                        <h1 className="font-black text-xl text-center w-full py-8 border-b-2 border-blue-500">
                            Otomatisasi pembuatan notasi deskripsi
                        </h1>
                        <p className="text-gray-500 py-8 text-lg leading-snug">
                            Hanya dengan mengetikkan source code dengan bahasa auto pseudocode dari flowgorithm nya akan langsung
                            dibuatkan notasi deskripsinya untuk anda.
                        </p>
                    </div>
                    <div className="flex flex-col p-4 border-[3px] border-gray-400/45 w-full rounded-3xl bg-gray-100 hover:-translate-y-2 duration-300">
                        <h1 className="font-black text-xl text-center w-full py-8 border-b-2 border-blue-500">
                            Menghasilkan file word yang masih bisa diedit
                        </h1>
                        <p className="text-gray-500 py-8 text-lg leading-snug">
                            Converter ini akan menyediakan output file yang masih berbentuk .docx yang membuat anda masih bisa
                            mengedit nya di Microsoft Word.
                        </p>
                    </div>
                    <div className="flex flex-col p-4 border-[3px] border-gray-400/45 w-full rounded-3xl bg-gray-100 hover:-translate-y-2 duration-300">
                        <h1 className="font-black text-xl text-center w-full py-8 border-b-2 border-blue-500">
                            Nama File yang dihasilkan sudah diformatkan
                        </h1>
                        <p className="text-gray-500 py-8 text-lg leading-snug">
                            Nama file nya sudah di formatkan sesuai intruksi tugas yaitu absen_nim_nama_judul
                        </p>
                    </div>
                </div>
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
