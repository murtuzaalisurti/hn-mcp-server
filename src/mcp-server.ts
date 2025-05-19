import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

function getMcpServer() {
    const server = new McpServer({
        name: "streamable-http-server",
        version: "1.0.0"
    }, {
        capabilities: {
            tools: {}
        }
    })

    server.tool(
        "fetch-stories",
        "Fetches ids of best stories from HackerNews API. One API call only contains up to 500 stories.",
        async () => {
            const stories = [];
            const response = await fetch("https://hacker-news.firebaseio.com/v0/beststories.json")
            const data = await response.json()

            const storyPromises = data.map(async (id: number) => {
                try {
                    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
                    const data = await response.json()
                    return {
                        by: data.by,
                        descendants: data.descendants,
                        id: data.id,
                        score: data.score,
                        time: data.time,
                        title: data.title,
                        type: data.type,
                        url: data.url
                    }
                } catch (error) {
                    console.error(`Failed to fetch story with id ${id}: ${error}`)
                }
            })

            Promise.allSettled(storyPromises)

            for await (const story of storyPromises) {
                if (story) {
                    stories.push(story)
                }
            }

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(stories)
                    }
                ]
            }
        }
    )

    // server.tool(
    //     "fetch-story-details",
    //     "Fetches details of a story from HackerNews API.",
    //     {
    //         id: z.number(),
    //     },
    //     async ({ id }) => {
    //         const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
    //         const data = await response.json()

    //         return {
    //             content: [
    //                 {
    //                     type: "text",
    //                     text: JSON.stringify(data)
    //                 }
    //             ]
    //         }
    //     }
    // )

    return server
}

export { getMcpServer }
