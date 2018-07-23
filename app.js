var titleApp = new Vue({
    el: '#title',
    data: {
        title: 'Hello Vue!!'
    }
})

var radarApp = new Vue({
    el: '#radar',
    data: {
        radius: 150,
        circles: [],
        quadrants: [],
        items: []
    },
    methods: {
        onClick (event) {
            console.log("Click", event)
        },
        onMouseOver (target) {
            target.fill = "blue"
            // target.name = "*"+target.name
            console.log(target.name)
        },
        onMouseOut (target) {
            target.fill = "green"
            // target.name = target.name.slice(1)
        },
        switchToRadar (data) {
            this.circles = data.stages.map(({ r, name, fill }) => {
                return { cx: this.radius, cy: this.radius, r: r*this.radius, name, fill }
            })
            this.quadrants = data.quadrants
            this.stages = data.stages
    
            let stageNames = this.stages.map(e => e.name).reduce((r,e,i) => { r[e] = i; return r }, {})
            this.items = this.quadrants.reduce((result, { items }, index) => {
                return result.concat(items.map(e => {
                    let pos = calculatePosition(index, stageNames[e.stage], this.circles)
                    e.cx = pos.x + this.radius
                    e.cy = pos.y + this.radius
                    e.fill = "green"
                    return e
                }))
            }, [])
    
            this.time = data.title
        },
    },
    created () {
        console.log("RadarApp Created")
    }
})

var dropList = new Vue({
    el: '#data-selector',
    data: {
        selected: '0',
        options: [
        ]
    },
    methods: {
        select: function () {
            this.switchToRadar(this.selected)
        },
        switchToRadar (id) {
            let { data, text } = this.options[this.selected]
            titleApp.title = text
            radarApp.switchToRadar(data)
            document.title = text
        }
    },
    created () {
        this.options = radar_data.map(function (data, value) {
            return { value, text: data.title, data }
        })
    },
    beforeMount () {
        this.switchToRadar(0)
    }
})

function calculatePosition(quadrant, stage, circles) {
    let fromR = 0
    let toR = circles[stage].r
    if (stage > 0) {
        fromR = circles[stage-1].r
    }
    let x = (toR-fromR)/2 + fromR
    let t = (Math.PI/2) * Math.random() + (Math.PI*quadrant/2)
    let y = x*Math.sin(t)
    x *= Math.cos(t)

    return { x, y }
}