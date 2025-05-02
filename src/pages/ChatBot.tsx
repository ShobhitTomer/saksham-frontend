import React, { useState, useRef, useEffect } from "react";
// Remove Ollama and data imports from frontend
// import { Ollama } from "ollama";
// import crimeData from "@/data/data.json";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Keep Message interface (or import from a shared types file)
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// Remove CrimeReport interface, findRelevantData, firRegex, systemPromptContent
// They are now handled by the backend

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // No initial loading needed now
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const backendUrl = "http://localhost:3001/api/chat"; // Your backend API URL

  // Remove initial introduction fetch useEffect
  // useEffect(() => { ... fetchIntroduction ... }, []);

  useEffect(() => {
    // Scroll to bottom logic remains the same
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        "div[data-radix-scroll-area-viewport]"
      );
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    // Add user message and assistant placeholder
    const currentMessages = [
      ...messages,
      userMessage,
      { role: "assistant", content: "" } as Message,
    ];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);

    // Prepare history for backend (send all messages up to the current user message)
    const historyForBackend = currentMessages.slice(0, -1); // Exclude the placeholder

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: historyForBackend }), // Send history
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      // Process the stream from the backend
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Process Server-Sent Events data format
        const lines = chunk.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(line.substring(6)); // Remove 'data: ' prefix
              if (jsonData.message?.content) {
                setMessages((prevMessages) => {
                  const lastMessageIndex = prevMessages.length - 1;
                  if (
                    lastMessageIndex >= 0 &&
                    prevMessages[lastMessageIndex].role === "assistant"
                  ) {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[lastMessageIndex] = {
                      ...updatedMessages[lastMessageIndex],
                      content:
                        updatedMessages[lastMessageIndex].content +
                        jsonData.message.content,
                    };
                    return updatedMessages;
                  }
                  return prevMessages; // Should not happen if placeholder exists
                });
              }
            } catch (e) {
              console.error(
                "Failed to parse stream chunk JSON:",
                e,
                "Chunk:",
                line
              );
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error communicating with backend:", error);
      setMessages((prevMessages) => {
        const lastMessageIndex = prevMessages.length - 1;
        if (
          lastMessageIndex >= 0 &&
          prevMessages[lastMessageIndex].role === "assistant"
        ) {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            role: "assistant",
            content: `Sorry, failed to connect to the backend: ${error.message}`,
          };
          return updatedMessages;
        }
        return [
          ...prevMessages,
          {
            role: "assistant",
            content: `Sorry, failed to connect to the backend: ${error.message}`,
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... handleInputChange, handleKeyPress remain the same ...
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  // --- JSX Rendering ---
  // Remove initial loading indicator related to introduction
  // Adjust thinking indicator logic if needed (it should still work based on isLoading and placeholder)
  return (
    <Card className="w-full max-w-3xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader>
        <CardTitle>AI Legal & Crime Data Assistant (RAG)</CardTitle>{" "}
        {/* Updated Title */}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {/* No initial loading needed here anymore */}
            {messages.map(
              (message, index) =>
                // Keep filtering system messages if any were added manually, though backend shouldn't send them
                message.role !== "system" && (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg p-3 max-w-[75%] text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {/* ReactMarkdown rendering remains the same */}
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="mb-2 last:mb-0" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc list-inside my-2"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal list-inside my-2"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="mb-1" {...props} />
                          ),
                          code: ({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) => {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            return !inline ? (
                              <pre
                                className={cn(
                                  "bg-gray-800 text-white p-2 rounded my-2 overflow-x-auto",
                                  className
                                )}
                                {...props}
                              >
                                <code>{children}</code>
                              </pre>
                            ) : (
                              <code
                                className={cn(
                                  "bg-gray-200 text-red-600 px-1 rounded",
                                  className
                                )}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-gray-300 pl-4 italic my-2"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )
            )}
            {/* Thinking indicator logic should still work */}
            {isLoading &&
              messages.length > 0 &&
              messages[messages.length - 1]?.role === "assistant" &&
              messages[messages.length - 1]?.content === "" && (
                <div className="flex justify-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-muted text-sm">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}
          </div>
        </ScrollArea>
      </CardContent>
      {/* CardFooter remains the same */}
      <CardFooter className="pt-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask about Indian Law or crime data..."
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? "..." : "Send"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatBot;
