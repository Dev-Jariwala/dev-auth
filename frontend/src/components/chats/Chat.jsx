/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useChat } from "@ai-sdk/react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal, } from "@/components/ui/dropdown-menu"
import { ChevronDown, Paperclip, X } from "lucide-react"
import { PROVIDERS } from "./utils/constants"
import { Message } from "./Message"
import { Textarea } from "../ui/textarea"
import { v4 as uuid } from 'uuid'
import { getSignedUrlForUpload, uploadFileToSignedUrl } from "../../services/commonServices"

export default function Chat() {
    const [provider, setProvider] = useState("google")
    const [model, setModel] = useState("gemini-2.0-flash-001")
    const [selectedFiles, setSelectedFiles] = useState([]);
    const scrollRef = useRef(null)
    const fileInputRef = useRef(null);
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "http://localhost:8080/api/ai",
        streamProtocol: "text",
    });
    const conversationId = `28fbc17b-fc7d-4b34-9b67-56506c7db1cd`;

    const currentProvider = PROVIDERS[provider];
    const currentModel = currentProvider?.models.find(m => m.value === model);

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const removeFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        const messageId = uuid();
        let filesMetadata = [];
        if (selectedFiles.length > 0) {
            try {
                const uploadedFiles = await Promise.all(selectedFiles.map(async (file) => {
                    const fileId = uuid();
                    const filename = file.name;
                    const key = `chats/ai/${conversationId}/${messageId}/${fileId}-${filename}`;
                    const response = await getSignedUrlForUpload({ filePath: key });

                    if (response.success) {
                        const { signedUrl } = response.data;
                        const uploadResult = await uploadFileToSignedUrl(signedUrl, file);
                        if (uploadResult.success) {
                            return { key, filename, mimetype: file.type };
                        }
                    }
                    return null;
                }));

                filesMetadata = uploadedFiles.filter(file => file !== null);
            } catch (error) {
                console.error("Error uploading files:", error);
                setSelectedFiles([]);
            }
        }

        handleSubmit(event, { body: { provider, model, filesMetadata, conversationId, messageId } });
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    return (
        <div className="flex items-center justify-center h-full bg-muted p-4">
            <Card className="w-full flex h-full flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>AI Chat</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <img src={currentProvider.icon} className="size-4" alt="" />
                                <span>{currentModel.label}</span>
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            {Object.entries(PROVIDERS).map(([providerKey, providerData]) => (
                                <DropdownMenuSub key={providerKey}>
                                    <DropdownMenuSubTrigger>
                                        <div className="flex items-center space-x-2">
                                            <img src={providerData.icon} className="size-4" alt="" />
                                            <span>{providerData.label}</span>
                                        </div>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            {providerData.models.map((modelData) => (
                                                <DropdownMenuItem
                                                    key={modelData.value}
                                                    onClick={() => {
                                                        setProvider(providerKey)
                                                        setModel(modelData.value)
                                                    }}
                                                >
                                                    {modelData.label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto space-y-4 pr-4">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-[80%] p-2 rounded-lg ${m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                            >
                                <Message m={m} />
                            </div>
                        </div>
                    ))}
                    <div ref={scrollRef} ></div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <form onSubmit={handleFormSubmit} className="flex items-end w-full space-x-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            multiple
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={handleFileButtonClick}
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <div className="flex-grow flex flex-col gap-2">
                            {selectedFiles.length > 0 && (
                                <div className="w-full flex flex-wrap gap-2">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 bg-secondary p-2 rounded-md"
                                        >
                                            <span className="text-sm">{file.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                ({formatFileSize(file.size)})
                                            </span>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="hover:bg-destructive/90 p-1 rounded-sm"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Textarea
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Type your message..."
                                className="flex-grow"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isLoading}>
                                Send
                            </Button>
                        </div>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}
