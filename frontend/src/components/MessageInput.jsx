import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { File, Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Selected file:", {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      console.log("File converted to base64, length:", base64Data.length);
      setFilePreview({
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64Data
      });
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.error("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeFile = () => {
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !filePreview) return;

    try {
      const messageData = {
        text: text.trim(),
        image: imagePreview,
        file: filePreview
      };

      console.log("Sending message with data:", {
        hasText: !!messageData.text,
        hasImage: !!messageData.image,
        hasFile: !!messageData.file,
        fileData: messageData.file ? {
          name: messageData.file.name,
          type: messageData.file.type,
          size: messageData.file.size,
          hasData: !!messageData.file.data
        } : null
      });

      await sendMessage(messageData);

      // Clear form
      setText("");
      setImagePreview(null);
      setFilePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="p-4 w-full">
      {(imagePreview || filePreview) && (
        <div className="mb-3 flex items-center gap-2">
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
          {filePreview && (
            <div className="relative bg-base-300 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <File className="size-4" />
                <span className="text-sm truncate max-w-[150px]">{filePreview.name}</span>
                <button
                  onClick={removeFile}
                  className="w-5 h-5 rounded-full bg-base-200
                  flex items-center justify-center"
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={imageInputRef}
            onChange={handleImageChange}
          />
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => imageInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${filePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <File size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview && !filePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
