import { HeartHandshake } from "lucide-react"

export function NavBar() {
    return <nav className="flex gap-10 lg:gap-20 fixed top-0 w-full z-50 transition-all duration-300 bg-slate-950/20 backdrop-blur-sm border-b">
        <div>
            <h1 className="flex text-2xl font-bold ml-10 lg:ml-0 p-4"><HeartHandshake className="mr-2" />Find Your Non-Profit</h1>
        </div>
        <div className="flex-2x1 ml-auto mr-10 rounded-3xl font-bold shadow-md items-center p-4 bg-amber-200">
            <p className="flex items-center p-1 text-sm">This is a product demo! There may be more features in the future.</p>
        </div>
    </nav>

}