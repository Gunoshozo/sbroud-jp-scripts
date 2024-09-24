export default {
    urls: Object.create({
        gamesListConfig: "{assets}/games/games.json",
        nameMapping: "{assets}/games/name-mapping.json",
        gameConfig: "{assets}/games/{gameName}/game.config.json",
        gameRouteConfig: "{assets}/games/{gameName}/routes/routes.config.json",
        routedGameChapterConfig: "{assets}/games/{gameName}/routes/{routeName}/chapters.config.json",
        nonRoutedGameChapterConfig: "{assets}/games/{gameName}/chapters/chapters.config.json",
        routedChapterFile: "{assets}/games/{gameName}/routes/{routeName}/{file}",
        nonRoutedChapterFile: "{assets}/games/{gameName}/chapters/{file}",
        tips: "{assets}/games/{gameName}/tips.json",
        walkthough: "{assets}/games/{gameName}/walkthough.html",
        searchConfig: "{assets}/games/{gameName}/search.config.json",
        gameInfo: "{assets}/games/{gameName}/game.info.html",
        supplementary: "{assets}/games/{gameName}/supplementary/{page}.html"
    })
}