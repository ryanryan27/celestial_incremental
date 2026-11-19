addLayer("calc", {
    name: "Calculations", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "x7", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 1,
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        selectedUni: "",
        selectedLayer: "",
        visibleCurrency: {
            currency: "",
            layer: ""
        },
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
                player.calc.visibleCurrency.currency = ""
                player.calc.visibleCurrency.layer = ""
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
        ], {width: "903px", height: "40px", background: "var(--scroll4)", border: "3px solid var(--menuBackground)", marginBottom: "-3px", borderRadius: "30px 30px 0 0"}],
        ["style-row", [
            ["theme-scroll-column",//unis
                () => {return layers.calc.getClickableFormats("uni")},
            {width: "40px", height: "600px", background: "var(--layerBackground)", borderRight: "3px solid var(--menuBackground)"}],
            ["theme-scroll-column",//layers 
                () => {return layers.calc.getClickableFormats("layer")},
            {width: "200px", height: "600px", background: "var(--layerBackground)", borderRight: "3px solid var(--menuBackground)"}],
            ["theme-scroll-column",//calculations
                () => {return layers.calc.calcFormatList()},
            {width: "657px", height: "600px", background: "var(--miscButtonDisable)"}]
        ], {width: "903px", height: "600px", background: "var(--tabTitle)", border: "3px solid var(--menuBackground)"}],
        ["style-row", [
            ["raw-html", "yippee it works!", {color: "var(--textColor)", fontSize: "20px", fontFamily: "monospace"}],
        ], {width: "903px", height: "30px", background: "var(--scroll4)", border: "3px solid var(--menuBackground)", marginTop: "-3px", borderRadius: "0 0 30px 30px"}],
    ],
    layerShown() { return false },
    getClickableFormats(type){
        let tabs = []
        let uni = player.calc.selectedUni
        
        if (type == "uni"){
            let uniList = Object.keys(universes)

            layers.calc.generateClickables("uni")
            for (const id of uniList){
                if (readData(universes[id].disabled) == true) continue
                if (!!layers.calc.clickables[id] && readData(universes[id].uniShown) == true) tabs.push(["hoverless-clickable", id])
            }
        }
        else if(type == "layer" && !!uni){
            let layer = player.calc.selectedLayer
            
            tabs.push(["hoverless-clickable", 100])

            layers.calc.generateClickables("layer", uni)
            
            for (const id of universes[uni].tree.flat()){
                if (readData(layers[id].deactivated) == true) continue
                if (!!layers.calc.clickables[id] && readData(layers[id].layerShown)) tabs.push(["hoverless-clickable", id])
                if (layer == id && player[layer]?.calculations !== undefined){
                    layers.calc.generateCurrencyClickables(layer)
                    for (const calcID in player[layer].calculations){
                        if (!!layers.calc.clickables[calcID]) tabs.push(["hoverless-clickable", calcID])
                    }
                }
            }
        }
        else if(type == "layer"){
            tabs.push(["hoverless-clickable", 100])
        }
        return tabs
    },
    calcFormatList(){
        let layer = player.calc.visibleCurrency.layer
        let currency = player.calc.visibleCurrency.currency

        let selected = (player[layer]?.calculations?.[currency] !== undefined ? player[layer].calculations[currency] : [])

        let calc_components = []
        if (selected.length == 0){
            calc_components.push(["style-row", [
                ["raw-html", "No Calculation Selected" , {color: "var(--textColor)", fontSize: "14px", fontFamily: "monospace"}]
            ], {width: "651px", height: "40px", border: "3px solid var(--regBorder)", }])
        }
        else {
            selected.splice(0,0,["Total", applyOperations(selected), "Related Values"])
            for (op of selected){
                let bg = (op[0]=="Total"?"var(--miscButtonHover)":"var(--miscButtonDisable")
                let border = (op[0]=="Total"? {'border-block':"3px solid var(--regBorder)"} : {'border-bottom':"3px solid var(--regBorder)"})
                let font = {color: "var(--textColor)", fontSize: "14px", fontFamily: "monospace"}
                let source = (op[2] ? op[2] : "")
                calc_components.push(["style-row",[
                    ["style-column", [["raw-html", op[0] , font]],
                        {width: "57px", height: "40px", background:bg, 'border-left': "3px solid var(--regBorder)"}],
                    ["style-column", [["raw-html", format(op[1]) , font]],
                        {width: "127px", height: "40px", background:bg, "align-content":"start", "padding-left":"20px", 'border-inline': "3px solid var(--regBorder)"}],
                    ["style-column", [["raw-html", source , Object.assign({"text-align":"left", display:"block"}, font)]],
                        {width: "418px", height: "40px", background:bg, "align-content":"start", "padding-left":"20px", 'border-right': "3px solid var(--regBorder)"}]
                ], Object.assign({width: "654px", height: "40px"}, border)]
                )
            }
            selected.splice(0,1)
        }
        return calc_components
    },
    generateClickables(type, uniID=""){
        if (type != "uni" && (type != "layer" || uniID == "")) return

        let idSet = type == "uni" ? Object.keys(universes) : universes[uniID].tree.flat()
        let elemType = type == "uni" ? universes : layers
        let selectType = type == "uni" ? "selectedUni" : "selectedLayer"
        let size = type == "uni" ? {width: "40px", minHeight: "40px"} : {width: "200px", minHeight: "40px"}
        let text = type == "uni" ? "symbol" : "name"

        for (const id of idSet){

            if(!!layers.calc.clickables[id]) continue
            if(type == "uni" && readData(universes[id].disabled) == true) continue
            if(type == "layer" && readData(layers[id].deactivated) == true) continue

            let look = {background: "var(--miscButton)", border: "3px solid rgba(0,0,0,0.3)", color:"rgba(0,0,0,0.5)"}
            let ns = readData(elemType[id].nodeStyle)
            if (ns?.background || ns?.backgroundColor){
                Object.assign(look, ns)
                delete look.transform, delete look.margin, delete look.marginRight, delete look.marginLeft
                if (!!look['border-color']) look.border = "3px solid "+look['border-color']
                delete look['border-color']
            }
            else if (readData(elemType[id].color)){
                look.background = readData(elemType[id].color)
            }
            Object.assign(look, size)

            let clickableData = {
                title: elemType[id][text],
                canClick: true,
                unlocked: true,
                onClick() {
                    player.calc[selectType] = (player.calc[selectType] == id ? "" : id)
                },
                style() {
                    let sty = {fontSize: "14px", borderRadius: "0", 'transition-duration':"0s"}
                    return Object.assign(look, sty)
                }
            }
            createClickable("calc",id,clickableData)
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
                    player.calc.visibleCurrency.currency = currency
                    player.calc.visibleCurrency.layer = layer
                },
                style() {
                    let look = {width: "200px", minHeight: "40px", fontSize: "14px", color: colors.color, background: colors.background, border: "3px solid", borderColor:colors.borderColor , borderRadius: "0", 'transition-duration':"0s"}
                    if (player.calc.visibleCurrency.currency == currency) look.borderColor = "var(--selected)"
                    return look
                }
            }
            createClickable("calc",currency,clickableData)
        }
    },
})




//Functions etc for applying/keeping track of calculations
let calc_functions = []
calc_functions["="] = (_input, operand) => {return new Decimal(operand)}
calc_functions["+"] = (input, operand) => {return input.add(operand)}
calc_functions["-"] = (input, operand) => {return input.sub(operand)}
calc_functions["*"] = (input, operand) => {return input.mul(operand)}
calc_functions["/"] = (input, operand) => {return input.div(operand)}
calc_functions["^"] = (input, operand) => {return input.pow(operand)}

function applyOperations(operations){
	let current = new Decimal(0)
	for (const operation of operations){
		current = calc_functions[operation[0]](current, operation[1])
	}
	return current
}

function createClickable(layer, id, clickableData){

	if(!layers[layer]) return

	layers[layer].clickables[id] = clickableData
	layers[layer].clickables[id].layer = layer
	layers[layer].clickables[id].id = ''+id
	setupTempData(layers[layer].clickables[id], tmp[layer].clickables[id] = {}, funcs[layer].clickables[id] = [])
}

function layerName(layer){
	return layers[layer].name
}

function buyableTitle(layer, id, layername=false) {
	let name = (layers[layer]?.buyables?.[id]?.title() ? layers[layer].buyables[id].title() : layer + " buyable " + id)
	return (layername ? layerName(layer) +" Buyable: "+name : name)
}

function levelableTitle(layer, id, layername=false) {
	let name = (layers[layer]?.levelables?.[id]?.title() ? layers[layer].levelables[id].title() : layer + " buyable " + id)
	return (layername ? layerName(layer) +": "+name : name)
}

function upgradeTitle(layer, id, layername=false) {
	let name = (layers[layer]?.upgrades?.[id]?.title ? layers[layer].upgrades[id].title : layer + " buyable " + id)
	return (layername ? layerName(layer) +" Upgrade: "+name : name)
}

let currency_glossary = []
currency_glossary["pointGain"] = "Celestial Point Gain"
currency_glossary["smaResetReq"] = "SMA Reset Req."
currency_glossary["smaGrowth"] = "SMA Store Amount"