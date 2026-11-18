addLayer("calc", {
    name: "Calculations", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "x7", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 1,
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        selectedLayer: "",
        visibleCurrency: [],
        allowedLayers: ["le","dn"]
    }},
    tooltip: "Calculations",
    color: "black",
    clickables: {
        2: {
            title() { return "Settings" },
            canClick() { return true },
            unlocked() { return true },
            onClick() {
                player.tab = "settings"
            },
            style: { width: '125px', minHeight: '50px', color: "var(--textColor)", background: "var(--miscButtonDisable)", borderRadius: '0px', border: "3px solid var(--regBorder)", margin: "0px 5px" },
        },
        4: {
            title() { return "Savebank<br><small style='color:#f44'>[HEAVILY WIP]</small>" },
            canClick() { return true },
            unlocked() { return false },
            onClick() {
                player.tab = "savebank"
            },
            style: { width: '125px', minHeight: '50px', color: "var(--textColor)", background: "var(--miscButtonDisable)", borderRadius: '0px', border: "3px solid var(--regBorder)", margin: "0px 5px" },
        },
        5: {
            title() { return "Changelog" },
            canClick() { return true },
            unlocked() { return true },
            onClick() {
                player.tab = "changelog"
            },
            style: { width: '125px', minHeight: '50px', color: "var(--textColor)", background: "var(--miscButtonDisable)", borderRadius: '0px', border: "3px solid var(--regBorder)", margin: "0px 5px" },
        },
        7: {
            title() { return "Jukebox" },
            canClick() { return true },
            unlocked() { return true },
            onClick() {
                player.tab = "jukebox"
            },
            style: { width: '125px', minHeight: '50px', color: "var(--textColor)", background: "var(--miscButtonDisable)", borderRadius: '0px', border: "3px solid var(--regBorder)", margin: "0px 5px" },
        },
        8: {
            title() { return "Calculations" },
            canClick() { return true },
            unlocked() { return true },
            onClick() {
                player.tab = "calc"
            },
            style: { width: '125px', minHeight: '50px', color: "var(--textColor)", background: "var(--miscButtonDisable)", borderRadius: '0px', border: "3px solid var(--regBorder)", margin: "0px 5px" },
        },
        100: {
            title: "Clear Currency",
            canClick: true,
            unlocked: true,
            onClick() {
                player.calc.visibleCurrency = []
            },
            style() {
                let look = {width: "200px", minHeight: "40px", fontSize: "14px", color: "var(--textColor)", background: "var(--miscButton)", border: "3px solid var(--miscButtonDisable)", borderRadius: "0"}
                return look
            },
        },
    },
    tabFormat: [
        ["row", [["clickable", 2], ["clickable", 7], ["clickable", 4], ["clickable", 5], ["clickable", 8]]],
        ["blank", "50px"],
        ["style-column", [
            ["raw-html", ()=>{return "Calculation" + (player.calc?.visibleCurrency["currency"] ? ": " + currency_glossary[player.calc.visibleCurrency["currency"]] : "")},
                 {color: "var(--textColor)", fontSize: "24px", fontFamily: "monospace"}],
        ], {width: "860px", height: "40px", background: "var(--scroll4)", border: "3px solid var(--menuBackground)", marginBottom: "-3px", borderRadius: "30px 30px 0 0"}],
        ["style-row", [
            ["style-column", [
                ["theme-scroll-column", 
                    () => {return layers.calc.generateClickableTabs()()},
                {width: "200px", height: "600px", background: "var(--layerBackground)"}],
            ], {width: "200px", height: "600px", borderRight: "3px solid var(--menuBackground)"}],
            ["theme-scroll-column", 
                () => {return layers.calc.generateCalculationList()()},
            {width: "657px", height: "600px", background: "var(--miscButtonDisable)", borderTop:"3px solid var(--regBorder)"}]
        ], {width: "860px", height: "600px", background: "var(--tabTitle)", border: "3px solid var(--menuBackground)"}],
        ["style-row", [
            ["raw-html", "yippee it works!", {color: "var(--textColor)", fontSize: "20px", fontFamily: "monospace"}],
        ], {width: "860px", height: "30px", background: "var(--scroll4)", border: "3px solid var(--menuBackground)", marginTop: "-3px", borderRadius: "0 0 30px 30px"}],
    ],
    layerShown() { return false },
    generateClickableTabs(){
        let layer = player.calc.selectedLayer
        let tabs = []
        tabs.push(["hoverless-clickable", 100])


        layers.calc.generateLayerClickables()

        for (click of player.calc.allowedLayers){
            if (!!layers.calc.clickables[click]) tabs.push(["hoverless-clickable", click])
            if (layer == click && player[layer]?.calculations !== undefined){
                layers.calc.generateCurrencyClickables(layer)
                for (click2 in player[layer].calculations){
                    if (!!layers.calc.clickables[click2]) tabs.push(["hoverless-clickable", click2])
                }
            }
        }
        return () => {return tabs}
    },
    generateCalculationList(){
        let layer = player.calc.visibleCurrency["layer"]
        let currency = player.calc.visibleCurrency["currency"]

        let selected = (player[layer]?.calculations?.[currency] !== undefined ? player[layer].calculations[currency] : [])

        let calc_components = []
        if (selected.length == 0){
            calc_components.push(["style-row", [
                ["raw-html", "No Calculation Selected" , {color: "var(--textColor)", fontSize: "14px", fontFamily: "monospace"}]
            ], {width: "657px", height: "40px", borderBottom: "3px solid var(--regBorder)"}])
        }
        else {
            selected.splice(0,0,["Total", applyOperations(selected), "Related Values"])
            for (op of selected){
                let bg = (op[0]=="Total"?"var(--miscButtonHover)":"var(--miscButtonDisable")
                let source = (op[2] ? op[2] : "")
                calc_components.push(["style-row",[
                    ["style-column", [["raw-html", op[0] , {color: "var(--textColor)", fontSize: "14px", fontFamily: "monospace"}]],
                        {width: "57px", height: "40px", borderLeft: "3px solid var(--regBorder)", background:bg}],
                    ["style-column", [["raw-html", format(op[1]) , {color: "var(--textColor)", fontSize: "14px", fontFamily: "monospace"}]],
                        {width: "127px", height: "40px", borderLeft: "3px solid var(--regBorder)", background:bg, "align-content":"start", "padding-left":"20px"}],
                    ["style-column", [["raw-html", source , {color: "var(--textColor)", fontSize: "14px", fontFamily: "monospace", "text-align":"left", display:"block"}]],
                        {width: "421px", height: "40px", borderLeft: "3px solid var(--regBorder)", borderRight: "3px solid var(--regBorder)", background:bg, "align-content":"start", "padding-left":"20px"}]
                ],{width: "657px", height: "40px", borderBottom: "3px solid var(--regBorder)"}]
                )
            }
            selected.splice(0,1)
        }
        return () => {return calc_components}
    },
    generateLayerClickables(){
        for (const lay of player.calc.allowedLayers){
            if(!!layers.calc.clickables[lay]) continue
            let colors = (layers[lay].nodeStyle() ? layers[lay].nodeStyle() : {background: "var(--miscButton)", borderColor: "var(--miscButtonDisable)", color:"var(--textColor)"})

            let clickableData = {
                title: layers[lay].name,
                canClick: true,
                unlocked: true,
                onClick() {
                    player.calc.selectedLayer = (player.calc.selectedLayer == lay ? "" : lay)
                },
                style() {
                    let look = {width: "200px", minHeight: "40px", fontSize: "14px", color: colors.color, background: colors.background, border: "3px solid "+colors.borderColor , borderRadius: "0"}
                    return look
                }
            }
            createClickable("calc",lay,clickableData)
        }
    },
    generateCurrencyClickables(layer){
        for (const currency in player[layer].calculations){
            if(!!layers.calc.clickables[currency]) continue
            let colors =  {background: "var(--miscButton)", borderColor: "var(--miscButtonDisable)", color:"var(--textColor)"}

            let clickableData = {
                title: currency_glossary[currency],
                canClick: true,
                unlocked: true,
                onClick() {
                    player.calc.visibleCurrency["currency"] = currency
                    player.calc.visibleCurrency["layer"] = layer
                },
                style() {
                    let look = {width: "200px", minHeight: "40px", fontSize: "14px", color: colors.color, background: colors.background, border: "3px solid "+colors.borderColor , borderRadius: "0"}
                    if (player.calc.visibleCurrency["currency"] == currency) look.borderColor = "var(--selected)"
                    return look
                }
            }
            createClickable("calc",currency,clickableData)
        }
    },
})