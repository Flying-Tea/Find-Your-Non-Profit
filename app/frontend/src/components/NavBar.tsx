import { HeartHandshake, Plus, Minus } from "lucide-react"
import { useEffect, useState } from "react"

export function NavBar() {
    const [count, setCount] = useState<number>(() => {
        const saved = localStorage.getItem("HourCounter")
        return saved ? Number(saved) : 0
    });

    useEffect(() => {
        localStorage.setItem("HourCounter", count.toString())
    }, [count])

    return <nav className="flex gap-10 lg:gap-20 fixed top-0 w-full z-50 transition-all duration-300 bg-slate-950/20 backdrop-blur-sm border-b">
        <div>
            <h1 className="flex text-2xl font-bold ml-10 lg:ml-0 p-4"><HeartHandshake className="mr-2" />Find Your Non-Profit</h1>
        </div>
        <div className="flex-2x1 ml-auto rounded-3xl font-bold shadow-md items-center p-4 bg-amber-200">
            <p className="flex items-center p-1 text-sm">This is a product demo! There may be more features in the future.</p>
        </div>
        {/* Counter */}
        <div className="flex flex-col items-center mr-10">
            <span className="text-xs font-semibold text-slate-800 bg-white p-0.5 rounded-sm">
                Volunteer Hours
            </span>

            <div className="flex items-center gap-1 bg-blue-200 rounded-lg px-1.5 py-1 shadow-inner border">
                <button
                    onClick={() => setCount(c => Math.max(0, c - 1))}
                    className="p-0.5 hover:bg-slate-100 rounded border bg-white"
                >
                    <Minus size={14} />
                </button>

                <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.min(999, Math.max(0, Number(e.target.value))))}
                    className="w-10 text-center text-sm outline-none ml-4"
                />

                <button
                    onClick={() => setCount(c => Math.min(999, c + 1))}
                    className="p-0.5 hover:bg-slate-100 rounded border bg-white"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    </nav>

}