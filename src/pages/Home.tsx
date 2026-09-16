export function Home() {
  return (
    <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6 mt-10">
      <h1 className="font-display text-4xl font-bold">The Wyldling Project</h1>

      <p className="text-sm leading-relaxed">
        This is a project with every little guide we would've loved to have while we were completing Wylde Flowers. In here, you'll find information about relationships, favorite gifts, where to catch fish, where to find recipes, and much more! You can also track your progress, if you want. No personal info required, no ads, just a small free tool to help you complete the game.
      </p>
      <p className="text-sm leading-relaxed">
        Disclaimer: all the information is stored locally in your browser. If you want to save it in order to be able to clear or switch browsers, please check our Settings page to export a copy of your data.
      </p>
      
        <p className="text-sm leading-relaxed">
        This site is under continuous improvement and expansion, we're more than glad to receive any suggestions for future implementation.
      </p>

      
        <a href="https://www.paypal.com/paypalme/wyldlingproject"
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 rounded-lg bg-marigold-harvest text-white font-display font-semibold shadow-sm hover:shadow-md transition-shadow"
      >
        Support us!
      </a>
    </div>
  )
}