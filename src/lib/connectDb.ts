import mongoose from "mongoose"

type ConnectionObject={
    isConnected?:number
}
const connection:ConnectionObject = {}
async function connectDb() {
    if (connection.isConnected) {
        console.log('Database already connected .');
        return 
    }
    try {
        const response = await mongoose.connect(process.env.MONGO_DB_URI||'',{})
        connection.isConnected=response.connections[0]?.readyState
        console.log('Database connected!...');
        
        
    } catch (error) {
        console.log("MONGO_URI =>", process.env.MONGO_DB_URI);

        console.error("Error connecting Database",error);

        process.exit(1);
    }
}

export default connectDb