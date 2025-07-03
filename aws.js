import { EC2Client, DescribeInstanceTypesCommand } from "@aws-sdk/client-ec2";

const client = new EC2Client({ region: "us-east-1" });

async function fetchInstanceTypes() {
  const command = new DescribeInstanceTypesCommand({});
  const response = await client.send(command);
  console.log(response);
}

fetchInstanceTypes();
