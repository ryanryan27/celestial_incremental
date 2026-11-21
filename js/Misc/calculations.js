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
        calculations: {},
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
    tabFormat() {return [
        ["row", [["clickable", 2], ["clickable", 7], ["clickable", 4], ["clickable", 5], ["clickable", 8]]],
        ["blank", "50px"],
        ["style-column", [
            ["raw-html", "Calculation" + (player.calc?.visibleCurrency.currency ? ": " + currency_glossary[player.calc.visibleCurrency.currency].name : ""),
                 {color: "var(--textColor)", fontSize: "24px", fontFamily: "monospace"}],
        ], {width: "903px", height: "40px", background: "var(--scroll4)", border: "3px solid var(--menuBackground)", marginBottom: "-3px", borderRadius: "30px 30px 0 0"}],
        ["style-row", [
            ["theme-scroll-column",//unis
                layers.calc.getClickableFormats("uni"),
            {width: "40px", height: "600px", background: "var(--layerBackground)", borderRight: "3px solid var(--menuBackground)"}],
            ["theme-scroll-column",//layers 
                layers.calc.getClickableFormats("layer"),
            {width: "200px", height: "600px", background: "var(--layerBackground)", borderRight: "3px solid var(--menuBackground)"}],
            ["theme-scroll-column",//calculations
                layers.calc.calcFormatList(),
            {width: "657px", height: "600px", background: "var(--miscButtonDisable)"}]
        ], {width: "903px", height: "600px", background: "var(--tabTitle)", border: "3px solid var(--menuBackground)"}],
        ["style-row", [
            ["raw-html", "yippee it works!", {color: "var(--textColor)", fontSize: "20px", fontFamily: "monospace"}],
        ], {width: "903px", height: "30px", background: "var(--scroll4)", border: "3px solid var(--menuBackground)", marginTop: "-3px", borderRadius: "0 0 30px 30px"}],
    ]},
    layerShown() {
        //heehee haha dumb workaround for errors when tabformat is function and no subtabs
        if (typeof tmp.calc.tabFormat === 'function'){
            temp.calc.tabFormat = temp.calc.tabFormat()
            layers.calc["layerShown"] = ()=>{return false}
        }
        return false },
    getClickableFormats(type){
        let tabs = []
        let uni = player.calc.selectedUni
        
        if (type == "uni"){
            for (const uniID of layers.calc.generateClickables("uni")){
                if (readData(universes[uniID].disabled) == true) continue
                if (!!layers.calc.clickables[uniID] && readData(universes[uniID].uniShown) == true) tabs.push(["hoverless-clickable", uniID])
            }
        }
        else if(type == "layer" && !!uni){
            let layer = player.calc.selectedLayer
            
            tabs.push(["hoverless-clickable", 100])
            
            for (const layerID of layers.calc.generateClickables("layer", uni)){
                if (readData(layers[layerID].deactivated) == true) continue

                let calcIDs = layers.calc.getCalcClickables(layerID)

                if (calcIDs.length == 0) continue
                if (!!layers.calc.clickables[layerID] && readData(layers[layerID].layerShown)) tabs.push(["hoverless-clickable", layerID])
                
                if (layer == layerID){
                    for (const calcID of calcIDs){
                        tabs.push(["hoverless-clickable", calcID])
                    }
                }
            }
        }
        else if(type == "layer"){
            tabs.push(["hoverless-clickable", 100])
            
        }
        tabs
        return tabs
    },
    calcFormatList(){
        let currency = player.calc.visibleCurrency.currency

        let selected = (!!player.calc.calculations[currency] ? player.calc.calculations[currency] : [])

        let calc_components = []
        if (selected.length == 0){
            calc_components.push(["style-row", [
                ["raw-html", "No Calculation Selected" , {color: "var(--textColor)", fontSize: "14px", fontFamily: "monospace"}]
            ], {width: "651px", height: "40px", border: "3px solid var(--regBorder)", }])
        }
        else {
            selected.splice(0,0,{operation:"Total", effect:selected.at(-1).result, result:selected.at(-1).result, description:"Related Values"})
            for (op of selected){
                let bg = (op.operation=="Total"?"var(--miscButtonHover)":"var(--miscButtonDisable")
                let border = (op.operation=="Total"? {'border-block':"3px solid var(--regBorder)"} : {'border-bottom':"3px solid var(--regBorder)"})
                let font = {color: "var(--textColor)", fontSize: "14px", fontFamily: "monospace"}
                calc_components.push(["style-row",[
                    ["style-column", [["raw-html", op.operation , font]],
                        {width: "57px", height: "40px", background:bg, 'border-left': "3px solid var(--regBorder)"}],
                    ["style-column", [["raw-html", format(op.effect) , font]],
                        {width: "127px", height: "40px", background:bg, "align-content":"start", "padding-left":"20px", 'border-inline': "3px solid var(--regBorder)"}],
                    ["style-column", [["raw-html", op.description , Object.assign({"text-align":"left", display:"block"}, font)]],
                        {width: "418px", height: "40px", background:bg, "align-content":"start", "padding-left":"20px", 'border-right': "3px solid var(--regBorder)"}]
                ], Object.assign({width: "654px", height: "40px"}, border)]
                )
            }
            selected.splice(0,1)
        }
        calc_components
        return calc_components
    },
    generateClickables(type, uniID=""){
        let calcSet = []
        if (type != "uni" && (type != "layer" || uniID == "")) return calcSet

        let idSet = type == "uni" ? Object.keys(universes) : universes[uniID].tree.flat()
        let elemType = type == "uni" ? universes : layers
        let selectFunc = (type == "uni" ? (uni) => {
            player.calc.selectedUni = (player.calc.selectedUni == uni ? "" : uni)
            player.calc.selectedLayer = ""
        } 
        : (lay) => {
            player.calc.selectedLayer = (player.calc.selectedLayer == lay ? "" : lay)
        })
        let size = type == "uni" ? {width: "40px", minHeight: "40px"} : {width: "200px", minHeight: "40px"}
        let text = type == "uni" ? "symbol" : "name"

        for (const id of idSet){

            
            if(type == "uni" && readData(universes[id].disabled) == true) continue
            if(type == "layer" && readData(layers[id].deactivated) == true) continue

            if(!!layers.calc.clickables[id]){
                calcSet.push(id)
                continue
            }

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
                    selectFunc(id)
                },
                style() {
                    let sty = {fontSize: "14px", borderRadius: "0", 'transition-duration':"0s"}
                    return Object.assign(look, sty)
                }
            }
            createClickable("calc",id,clickableData)
            calcSet.push(id)
        }
        return calcSet
    },
    getCalcClickables(layer){
        let layerCalcs = []
        for (const currency of Object.keys(player.calc.calculations)){
            if(currency_glossary[currency].layer != layer) continue
            let colors =  {background: "var(--miscButton)", borderColor: "var(--miscButtonDisable)", color:"var(--textColor)"}

            let clickableData = {
                title: currency_glossary[currency].name,
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
            layerCalcs.push(currency)
        }
        return layerCalcs
    },
})


class TrackedDecimal extends Decimal{

    static #handler = {
        get(target, prop, receiver) {
            if (Object.hasOwn(target, prop) || Object.getOwnPropertyNames(Object.getPrototypeOf(target)).includes(prop)) return target[prop]

            if(typeof target.dec[prop] === 'function'){
                return (...args) => {
                    let res = Reflect.apply(target.dec[prop], target.dec, args)
                    if(res instanceof Decimal){
                        target.dec = res
                        return receiver
                    } else {
                        return res
                    }
                }
            }
            return target.dec[prop]
        },
        set(target, prop, value){
            if (prop == 'dec') {
                Reflect.set(target, prop, value)
                return true
            }
            return Reflect.set(target.dec, prop, value)
        }
    }

    constructor(value, trackingArray){
        if (Object.hasOwn(value, "dec") && Object.hasOwn(value, "track")){
            super(0)
            delete this.layer
            delete this.mag
            delete this.sign
            this.dec = value.dec
            this.track = value.track
            return
        }

        trackingArray.splice(0)
    
        const trackerData = {
            dec: new Decimal(value),
            track: trackingArray
        }
        return new Proxy(new TrackedDecimal(trackerData), TrackedDecimal.#handler)
    }

    set(val, desc="", reset=false){
        this.dec = new Decimal(val)
        if(reset)this.track.splice(0)
        this.track.push({operation:'=', effect:val, result:val, description:desc})
        return this
    }

    doOperation(op, opName, val, desc, tracked, doesNothingVal){
        if (typeof val !== 'number' && val.eq(doesNothingVal)) return (tracked ? this : this.dec)
        let result = this.dec[opName](val)
        if (tracked){
            this.dec = result
            this.track.push({operation:op, effect:val, result:result, description:desc})
            return this
        } else return result
    }

    add(val, desc="", tracked=true){
        return this.doOperation("+", 'add', val, desc, tracked, 0)
    }
    sub(val, desc="", tracked=true){
        return this.doOperation("-", 'sub', val, desc, tracked, 0)
    }
    mul(val, desc="", tracked=true){
        return this.doOperation("x", 'mul', val, desc, tracked, 1)
    }
    div(val, desc="", tracked=true){
        return this.doOperation("/", 'div', val, desc, tracked, 1)
    }
    pow(val, desc="", tracked=true){
        return this.doOperation("^", 'pow', val, desc, tracked, 1)
    }

}

function createClickable(layer, id, clickableData){

	if(!layers[layer]) return
    
    if(!layers[layer].clickables[id]) layers[layer].clickables[id] = {}

	Object.assign(layers[layer].clickables[id], clickableData)
	layers[layer].clickables[id].layer = layer
	layers[layer].clickables[id].id = ''+id
	setupTempData(layers[layer].clickables[id], tmp[layer].clickables[id] = {}, funcs[layer].clickables[id] = [])
    player[layer].clickables[id] = ""
}

function layerName(layer){
	return readData(layers[layer].name)
}

function buyableTitle(layer, id, layername=false) {
	let name = (!!layers[layer]?.buyables?.[id]?.title ? readData(layers[layer].buyables[id].title) : layer + " buyable " + id)
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
currency_glossary["pointGain"] = {layer: "i", name:"Celestial Point Gain"}