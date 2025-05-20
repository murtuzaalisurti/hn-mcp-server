const fetchStoryDetails = async (id: number) => {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const data = await response.json();
    return {
        by: data.by,
        descendants: data.descendants,
        id: data.id,
        score: data.score,
        time: data.time,
        title: data.title,
        type: data.type,
        url: data.url
    };
}

export {
    fetchStoryDetails
}
