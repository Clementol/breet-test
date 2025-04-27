export const appConfig = () => ({

    MONGO_DB: {
        URI: process.env.MONGODB_URI as string
    }
})