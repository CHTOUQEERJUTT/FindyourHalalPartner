import * as React from "react";
import { Html, Body, Container, Text, Heading } from "@react-email/components";

interface MagicCodeEmailProps {
  username: string;
  verificationCode: string;
}

const MagicCodeEmail = ({ username, verificationCode }: MagicCodeEmailProps) => (
  <Html>
    <Body style={{ backgroundColor: "#f4f4f4", padding: "20px" }}>
      <Container
        style={{
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <Heading style={{ color: "#333" }}>Find Your Love Member Verification</Heading>
        <Text>Hello {username},</Text>
        <Text>Your verification code is:</Text>
        <Text style={{ fontSize: "24px", fontWeight: "bold" }}>{verificationCode}</Text>
        <Text>This code will expire in 10 minutes.</Text>
      </Container>
    </Body>
  </Html>
);

export default MagicCodeEmail;
