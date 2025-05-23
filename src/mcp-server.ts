import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { fetchStoryDetails } from './lib/stories.js';

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
                    return await fetchStoryDetails(id);
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

    server.prompt(
        "fetch-best-x-stories",
        "Fetches X number of best stories from HackerNews API. Limits to 500 stories.",
        {
            count: z.string(),
        },
        ({ count = 30 }) => {
            return {
                messages: [
                    {
                        role: "user",
                        content: {
                            type: "text",
                            text: `Using the Hackernews API, fetch the best stories and shortlist ${count} of them which are related to major tech companies, AI, open source, mahor cloud providers, interesting developer tools/tips, etc. Research well before shortlisting and add reference links as well. Don't make stuff up.`
                        }
                    }
                ]
            }
        }
    )

    return server
}

export { getMcpServer }
