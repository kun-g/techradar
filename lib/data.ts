import type { RadarData } from "./types"

export const ringRatios = [0.4, 0.3, 0.2, 0.1];
// This function would normally fetch data from an API or Google Sheet
// For this example, we'll use mock data
export async function fetchRadarData(): Promise<RadarData> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    quadrants: [
      { id: "languages", name: "Languages & Frameworks", order: 0 },
      { id: "platforms", name: "Platforms", order: 1 },
      { id: "tools", name: "Tools", order: 2 },
      { id: "techniques", name: "Techniques", order: 3 },
    ],
    rings: [
      { id: "adopt", name: "Adopt", order: 0, color: "green", stroke: "rgba(16, 185, 129, 0.7)" },
      { id: "trial", name: "Trial", order: 1, color: "blue", stroke: "rgba(59, 130, 246, 0.7)" },
      { id: "assess", name: "Assess", order: 2, color: "yellow", stroke: "rgba(234, 179, 8, 0.7)" },
      { id: "hold", name: "Hold", order: 3, color: "red", stroke: "rgba(239, 68, 68, 0.7)" },
    ],
    blips: [
      {
        id: "1-techniques",
        name: "Four key metrics",
        quadrant: "techniques",
        ring: "adopt",
        description:
          "The four key metrics (lead time, deployment frequency, MTTR, and change fail percentage) have become the standard for measuring software delivery performance.",
      },
      {
        id: "2-techniques",
        name: "Pipelines as code",
        quadrant: "techniques",
        ring: "adopt",
        description:
          "Defining deployment pipelines as code allows teams to version, test, and evolve their delivery process alongside their application code.",
      },
      {
        id: "3-techniques",
        name: "Continuous compliance",
        quadrant: "techniques",
        ring: "trial",
        description:
          "Embedding compliance checks into the delivery pipeline to ensure regulatory requirements are met continuously rather than as an afterthought.",
      },
      {
        id: "4-techniques",
        name: "Data mesh",
        quadrant: "techniques",
        ring: "assess",
        description:
          "A sociotechnical approach to data management that treats data as a product, owned by domain teams that provide it as a service to data consumers.",
      },
      {
        id: "5-techniques",
        name: "Zero-trust architecture",
        quadrant: "techniques",
        ring: "trial",
        description:
          "A security model that assumes no user or system should be inherently trusted, requiring verification from everyone trying to access resources.",
      },
      {
        id: "6-techniques",
        name: "Overambitious API gateways",
        quadrant: "techniques",
        ring: "hold",
        description:
          "Using API gateways for complex orchestration and business logic rather than their intended purpose of request routing and cross-cutting concerns.",
      },
      {
        id: "7-platforms",
        name: "Kubernetes",
        quadrant: "platforms",
        ring: "adopt",
        description:
          "The de facto standard for container orchestration, providing deployment, scaling, and management of containerized applications.",
      },
      {
        id: "8-platforms",
        name: "AWS Lambda",
        quadrant: "platforms",
        ring: "adopt",
        description:
          "A serverless compute service that runs code in response to events and automatically manages the computing resources.",
      },
      {
        id: "9-platforms",
        name: "Azure DevOps",
        quadrant: "platforms",
        ring: "trial",
        description:
          "A set of development tools, services, and features that enable teams to plan work, collaborate on code, and build and deploy applications.",
      },
      {
        id: "10-platforms",
        name: "Backstage",
        quadrant: "platforms",
        ring: "assess",
        description:
          "An open-source developer portal platform that helps teams manage their microservices and other software components.",
      },
      {
        id: "11-platforms",
        name: "Cloudflare Workers",
        quadrant: "platforms",
        ring: "trial",
        description:
          "A serverless execution environment that allows developers to create entirely new applications or augment existing ones without configuring or maintaining infrastructure.",
      },
      {
        id: "12-platforms",
        name: "Heroku",
        quadrant: "platforms",
        ring: "hold",
        description:
          "While once revolutionary for deployment simplicity, many teams are moving to more flexible and cost-effective cloud-native solutions.",
      },
      {
        id: "13-tools",
        name: "GitHub Actions",
        quadrant: "tools",
        ring: "adopt",
        description:
          "A CI/CD platform that allows you to automate your build, test, and deployment pipeline directly from your GitHub repository.",
      },
      {
        id: "14-tools",
        name: "Terraform",
        quadrant: "tools",
        ring: "adopt",
        description:
          "An infrastructure as code tool that enables you to safely and predictably create, change, and improve infrastructure.",
      },
      {
        id: "15-tools",
        name: "Prometheus",
        quadrant: "tools",
        ring: "adopt",
        description: "An open-source monitoring and alerting toolkit designed for reliability and scalability.",
      },
      {
        id: "16-tools",
        name: "OpenTelemetry",
        quadrant: "tools",
        ring: "trial",
        description:
          "A collection of tools, APIs, and SDKs for instrumenting, generating, collecting, and exporting telemetry data for analysis.",
      },
      {
        id: "17-tools",
        name: "Grafana Loki",
        quadrant: "tools",
        ring: "assess",
        description: "A horizontally-scalable, highly-available log aggregation system inspired by Prometheus.",
      },
      {
        id: "18-tools",
        name: "Snyk",
        quadrant: "tools",
        ring: "trial",
        description:
          "A developer security platform that helps find and fix vulnerabilities in open source dependencies and container images.",
      },
      {
        id: "19-languages",
        name: "TypeScript",
        quadrant: "languages",
        ring: "adopt",
        description:
          "A strongly typed programming language that builds on JavaScript, giving better tooling at any scale.",
      },
      {
        id: "20-languages",
        name: "Rust",
        quadrant: "languages",
        ring: "trial",
        description:
          "A language empowering everyone to build reliable and efficient software, with strong memory safety guarantees.",
      },
      {
        id: "21-languages",
        name: "Go",
        quadrant: "languages",
        ring: "adopt",
        description:
          "An open source programming language designed for building simple, fast, reliable software, particularly well-suited for microservices.",
      },
      {
        id: "22-languages",
        name: "React",
        quadrant: "languages",
        ring: "adopt",
        description: "A JavaScript library for building user interfaces, particularly single-page applications.",
      },
      {
        id: "23-languages",
        name: "Next.js",
        quadrant: "languages",
        ring: "adopt",
        description:
          "A React framework that enables server-side rendering and generating static websites for React based web applications.",
      },
      {
        id: "24-languages",
        name: "WebAssembly",
        quadrant: "languages",
        ring: "assess",
        description:
          "A binary instruction format for a stack-based virtual machine, designed as a portable target for high-performance applications on the web.",
      },
      {
        id: "25-languages",
        name: "Angular",
        quadrant: "languages",
        ring: "trial",
        description: "A platform and framework for building single-page client applications using HTML and TypeScript.",
      },
    ],
  }
}
