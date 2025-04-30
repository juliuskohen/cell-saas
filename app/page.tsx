"use client";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function CellApp() {
  return (
    <CopilotKit runtimeUrl="/api/agent">
      {/* Your main app content goes here */}
      <CopilotPopup 
        instructions="You are Cell, a helpful AI assistant for the user." 
        defaultOpen={true}
        labels={{ title: "Cell Assistant", initial: "Hello! How can I help you today?" }}
        clickOutsideToClose={false}
      />
    </CopilotKit>
  );
}
    