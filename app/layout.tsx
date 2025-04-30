// app/layout.tsx
import "../src/app/globals.css";       // your global styles
import { ReactNode } from "react";

// If you need CopilotKit provider *globally*, import it here
// import { CopilotKit } from "@copilotkit/react-core";

export const metadata = {
  title: "Cell SaaS",
  description: "AI command bar powered by CopilotKit + LangChain",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Wrap providers here if you want them app-wide */}
        {/* <CopilotKit runtimeUrl="/api/agent">{children}</CopilotKit> */}
        {children}
      </body>
    </html>
  );
}
