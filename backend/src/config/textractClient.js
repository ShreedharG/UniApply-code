import { TextractClient } from "@aws-sdk/client-textract";
import dotenv from "dotenv";

dotenv.config();

const textract = new TextractClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

export default textract;
