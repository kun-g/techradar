var radar_data = [
	{
		title: "Kun.G的个人雷达",
		stages: [
            { r: 0.35, name:'Adopt',  fill: "rgba(200, 200, 200, 0.8)" },
            { r: 0.60, name:'Trial',  fill: "rgba(200, 200, 200, 0.6)" },
            { r: 0.80, name:'Assess', fill: "rgba(200, 200, 200, 0.4)" },
            { r: 1.00, name:'Hold',   fill: "rgba(200, 200, 200, 0.2)" },
		],
		quadrants: [
			{
				name: "技能",
				items: [
					{ name: '技能管理', stage: "Assess" },
					{ name: '写作', stage: "Assess" },
					{ name: '读书', stage: "Assess" },
					{ name: '阅读', stage: "Assess" },
				]
			},
			{
				name: "工具",
				items: [
					{ name: '技术雷达', stage: "Trial" },
					{ name: 'Docker', stage: "Trial" },
					{ name: 'Check List', stage: "Assess" },
					{ name: '卡诺图', stage: "Assess" },
					{ name: 'Hubot', stage: "Adopt" },
					{ name: 'mongoDB', stage: "Assess" },
					{ name: 'Ansible', stage: "Assess" },
					{ name: 'Hip Chat', stage: "Assess" },
					{ name: 'Trello', stage: "Assess" },
					{ name: 'ELK', stage: "Assess" },
					{ name: 'haproxy', stage: "Assess" },
					{ name: 'home assistant', stage: "Assess" },
					{ name: 'Kubernetes', stage: "Assess" },
				]
			},
			{
				name: "思想",
				items: [
					{ name: '边缘思维', stage: "Assess" },
					{ name: '能力圈', stage: "Assess" },
				]
			},
			{
				name: "技术",
				"items": [
					{ name: 'Service Mesh', stage: "Assess" },
					{ name: "Architecture Decision Records", stage: "Trial", "url": "https://github.com/npryce/adr-tools" },
					{ name: "Zookeeper for App Config", stage:'Assess' },
					{ name: "Code Reviews", stage: "Trial" },
					{ name: "Dependency Injection", stage: "Assess" },
					{ name: '树梅派', stage: "Assess"  },
					{ name: 'Arduino', stage: "Assess"  },
				]
			}
		]
	},
	{
		title: "Kun.G's Book Radar",
		stages: [
			{r:0.35, name:'Adopt',  fill: "rgba(211, 224, 16, 0.5)"},
			{r:0.60, name:'Trial',  fill: "rgba(211, 224, 16, 0.5)"},
			{r:0.80, name:'Assess', fill: "rgba(211, 224, 16, 0.5)"},
			{r:1.00, name:'Hold',   fill: "rgba(211, 224, 16, 0.5)"}
		],
		quadrants: [
			{
				name: "Techniques",
				items: [
					{ name: 'Service Mesh', stage: "Assess" },
				]
			},
			{
				name: "Tools",
				items: [
					{ name: 'Hubot', stage: "Adopt" },
				]
			},
			{
				name: "Platforms",
				items: [
					{ name: 'Kubernetes', stage: "Assess"  },
				]
			},
			{
				name: "Languages & Frameworks",
				"items": [
					{"name":"Swift", stage: "Assess" },
				]
			}
		]
	},
	
]

// 不这样做，fill的变化无法被vue监听到
radar_data.forEach(datas => {
	datas.quadrants.forEach(q => {
		q.items.forEach(e => e.fill = "rgba(211, 224, 16, 0.5)")
	})
})