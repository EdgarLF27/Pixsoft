function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 mb-4">
          Pixsoft React 🚀
        </h1>
        <p className="text-slate-600 text-lg mb-6">
          ¡Tailwind CSS está funcionando perfectamente en tu nuevo frontend!
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-blue-500/50 transition-all">
          Empezar Maestro
        </button>
      </div>
    </div>
  )
}

export default App